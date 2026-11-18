"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SERVICES, ASSETS } from "./services";
import { createCanvasEngine, tFinished, timelineDuration } from "./canvasEngine";
import "./services-canvas.css";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
const pad = (n) => String(n).padStart(2, "0");
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Decorative design-tool icons (the toolbar shows which tool is "in use"). */
const TOOLS = {
  move: <path d="M4 3 L4 16 L8 12 L11 18 L13 17 L10 11 L15 11 Z" strokeLinejoin="round" />,
  frame: <path d="M5 2 V18 M13 2 V18 M2 5 H18 M2 13 H18" />,
  rect: <rect x="3" y="4" width="14" height="12" rx="1.5" />,
  ellipse: <circle cx="10" cy="10" r="7" />,
  pen: <path d="M4 16 L7 9 L13 3 L17 7 L11 13 Z M4 16 L9 14" strokeLinejoin="round" />,
  text: <path d="M4 4 H16 M10 4 V17" />,
  comment: <path d="M3 4 H17 V13 H9 L5 17 V13 H3 Z" strokeLinejoin="round" />,
};

/**
 * "Five disciplines. One studio." — the services section as a live design canvas.
 * Scrolling pins the section and drives one timeline: the camera flies to each
 * artboard and the work is built step by step, with the service details beside it.
 *
 * The stage pins just below the site's fixed header (measured, not hard-coded),
 * and /services#<id> links (see `id` in services.js) jump to that artboard.
 *
 * @param {object} props
 * @param {Array}  [props.services]      see services.js
 * @param {object} [props.assets]        image paths used by the artboards
 * @param {string} [props.contactHref]   "Start a project" link (gets ?service=<slug>)
 * @param {number} [props.scrollLength]  scroll distance, in viewport heights
 * @param {string} [props.className]     extra classes on the section (e.g. next/font variables)
 */
export default function ServicesCanvas({
  services = SERVICES,
  assets = ASSETS,
  contactHref = "/contact",
  scrollLength = 12,
  className = "",
}) {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const engineRef = useRef(null);
  const triggerRef = useRef(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [done, setDone] = useState(-1); // -1 = nothing being built yet

  const current = services[active];
  const duration = timelineDuration(services.length);

  /** Jump to a service: scroll there when pinned, switch instantly otherwise. */
  const goTo = (k, smooth = true) => {
    const st = triggerRef.current;
    if (st) {
      const y = st.start + (st.end - st.start) * (tFinished(k) / duration);
      window.scrollTo({ top: y, behavior: smooth && !reducedMotion() ? "smooth" : "auto" });
    } else {
      engineRef.current?.render(tFinished(k));
    }
  };

  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    const stage = stageRef.current;
    const root = document.documentElement;

    // The site sets `html { scroll-behavior: smooth }`, which turns every scroll
    // write from ScrollTrigger's snap into its own animated scroll (stutter).
    // Use instant scrolling while this section is mounted; goTo() still asks for
    // a smooth scroll explicitly.
    const prevScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";

    // The fixed site header covers the top of the viewport: pin the stage just
    // below it and make the stage exactly the remaining height.
    const header = document.querySelector(".site-header");
    let headerH = 0;
    const syncHeader = () => {
      headerH = header ? header.offsetHeight : 0;
      section.style.setProperty("--sc-offset", `${headerH}px`);
    };
    syncHeader();

    const engine = createCanvasEngine({
      root: stage,
      onIndex: (k) => {
        activeRef.current = k;
        setActive(k);
      },
      onProgress: setDone,
    });
    engineRef.current = engine;

    // Mobile address bars resize the viewport while scrolling; don't re-pin on that.
    ScrollTrigger.config({ ignoreMobileResize: true });

    const mm = gsap.matchMedia(stage);
    mm.add(
      { motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" },
      (ctx) => {
        engine.layout();
        if (ctx.conditions.reduce) {
          // No pinning, no scrubbing: show finished work; the service buttons switch instantly.
          engine.render(tFinished(activeRef.current));
          return;
        }
        const state = { t: 0 };
        const tween = gsap.to(state, {
          t: duration,
          ease: "none",
          onUpdate: () => engine.render(state.t),
          scrollTrigger: {
            trigger: stage,
            start: () => `top ${headerH}px`,
            end: () => `+=${window.innerHeight * scrollLength}`,
            pin: true,
            scrub: 1.4,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefreshInit: syncHeader,
            onRefresh: () => {
              engine.layout();
              engine.render(state.t);
            },
            // settle on a finished artboard (or the intro) when scrolling stops.
            // The stops are ~1,000px+ of scroll apart, so snapping to the
            // *nearest* one would drag any ordinary wheel/swipe back to where
            // it started; snap onward in the direction of travel instead.
            snap: {
              snapTo: [0, ...services.map((_, k) => tFinished(k) / duration)],
              duration: { min: 0.9, max: 2.2 },
              delay: 0.35,
              ease: "power1.inOut",
              directional: true,
              inertia: false,
            },
          },
        });
        triggerRef.current = tween.scrollTrigger;
        engine.render(state.t);
        return () => {
          triggerRef.current = null;
        };
      }
    );

    // keep the camera centred between the panels on any size change
    const ro = new ResizeObserver(() => {
      engine.layout();
      engine.render(engine.time);
    });
    ro.observe(stage);

    // Content above the section can change height after the trigger was
    // measured (web fonts, the hero video, images). Re-measure when the page
    // height really changes; a refresh ends at the same height, so this
    // doesn't feed back into itself.
    let lastHeight = document.body.scrollHeight;
    let refreshTimer = 0;
    const pageRo = new ResizeObserver(() => {
      const h = document.body.scrollHeight;
      if (h === lastHeight) return;
      lastHeight = h;
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        ScrollTrigger.refresh();
        lastHeight = document.body.scrollHeight;
      }, 150);
    });
    pageRo.observe(document.body);

    // /services#web etc.: jump to that artboard (on load and on in-page links)
    const indexFromHash = () => services.findIndex((s) => s.id && `#${s.id}` === window.location.hash);
    const onHash = () => {
      const k = indexFromHash();
      if (k >= 0) goTo(k);
    };
    window.addEventListener("hashchange", onHash);

    let alive = true;
    // web fonts change text widths: re-measure once they're in
    document.fonts?.ready.then(() => {
      if (!alive) return;
      engine.layout();
      engine.render(engine.time);
      ScrollTrigger.refresh();
      const k = indexFromHash();
      if (k >= 0) goTo(k, false);
    });

    return () => {
      alive = false;
      window.removeEventListener("hashchange", onHash);
      pageRo.disconnect();
      clearTimeout(refreshTimer);
      ro.disconnect();
      mm.revert();
      engine.destroy();
      engineRef.current = null;
      root.style.scrollBehavior = prevScrollBehavior;
    };
    // services/scrollLength are setup-time options; remount to change them
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pageButtons = (className) => (
    <ol className={className}>
      {services.map((s, k) => (
        <li key={s.slug}>
          <button type="button" className="sc-page" aria-current={k === active ? "true" : undefined} onClick={() => goTo(k)}>
            <span className="sc-page-num">{pad(k + 1)}</span>
            <span className="sc-page-name">{s.name}</span>
            <i style={{ background: s.swatch }} aria-hidden="true" />
          </button>
        </li>
      ))}
    </ol>
  );

  return (
    <section ref={sectionRef} className={`sc ${className}`} aria-labelledby="sc-title">
      <div ref={stageRef} className="sc-stage">
        <div className="sc-amb" aria-hidden="true">
          <i /> <i /> <i /> <i /> <i />
        </div>

        {/* ── the canvas ── */}
        <div className="sc-canvas">
          <div className="sc-world">
            <header className="sc-headline">
              <p className="sc-eyebrow">Services</p>
              <h2 id="sc-title" className="sc-h">
                Five
                <br />
                disciplines.
                <br />
                <em>One</em> studio.
              </h2>
              <p className="sc-lede">Every service, shown as real work — designed and built in the same studio.</p>
            </header>

            {services.map((s, k) => (
              <div
                key={s.slug}
                className="sc-ab"
                style={{ left: k * 700 }}
                data-included={s.included.length}
                aria-hidden="true"
              >
                <div className="sc-ab-label">
                  <b>{pad(k + 1)}</b> — {s.name} · <span>{s.client}</span>
                </div>
                <div className="sc-ab-inner">
                  <div className="sc-fill" />
                  {/* static, trusted artboard markup (see ./artboards) */}
                  <div className="sc-ab-art" dangerouslySetInnerHTML={{ __html: s.artboard(assets) }} />
                </div>
                <div className="sc-sel">
                  <i /> <i /> <i /> <i />
                  <b />
                </div>
                <div className="sc-note" style={{ left: s.noteAt[0], top: s.noteAt[1] }}>
                  <span className="sc-note-ic">✓</span>
                  {s.note}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sc-cursor" aria-hidden="true">
          <svg width="22" height="24" viewBox="0 0 22 24">
            <path d="M2 2 L2 20 L7 15 L11 23 L14.5 21.5 L10.5 13.5 L17 13.5 Z" fill="#FF4433" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        </div>

        {/* ── floating glass chrome ── */}
        <div className="sc-top">
          <span className="sc-crumb">
            alldystars <span aria-hidden="true">/</span> <b>Services</b>
          </span>
          <div className="sc-tools" aria-hidden="true">
            {Object.entries(TOOLS).map(([key, icon]) => (
              <span key={key} className="sc-tool" data-sc-tool={key}>
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                  {icon}
                </svg>
              </span>
            ))}
          </div>
          <span className="sc-zoom" data-sc-zoom aria-hidden="true">
            28%
          </span>
          <Link className="sc-cta" href={contactHref}>
            Start a project
          </Link>
        </div>

        <nav className="sc-left" aria-label="Services">
          <p className="sc-label">Pages — services</p>
          {pageButtons("sc-pages")}
          <p className="sc-label sc-label-gap" aria-hidden="true">
            Layers — what&apos;s included
          </p>
          <ul className="sc-layers" aria-hidden="true">
            {current.included.map((item, i) => (
              <li key={item} className={i < done ? "is-done" : i === done ? "is-now" : undefined}>
                <i />
                {item}
              </li>
            ))}
          </ul>
        </nav>

        <aside className="sc-panel" aria-label="Service details">
          {pageButtons("sc-pages sc-pages-compact")}
          <div className="sc-panel-body" aria-live="polite">
            <p className="sc-num">
              {pad(active + 1)} / {pad(services.length)}
            </p>
            <p className="sc-title">
              {current.title[0]} <em>{current.title[1]}</em>
            </p>
            <p className="sc-desc">{current.description}</p>
            <p className="sc-label">What&apos;s included</p>
            <ul className="sc-chips">
              {current.included.map((item, i) => (
                <li key={item} className={i < done ? "sc-chip is-on" : "sc-chip"}>
                  {item}
                </li>
              ))}
            </ul>
            <p className="sc-label sc-hide-sm">On the canvas</p>
            <div className="sc-client sc-hide-sm">
              <i style={{ background: current.swatch }} aria-hidden="true" />
              <div>
                <b>{current.client}</b>
                <small>{current.clientSub}</small>
              </div>
            </div>
            <Link className="sc-go" href={`${contactHref}?service=${current.slug}`}>
              Start a {current.name.split(" ")[0].toLowerCase()} project <span aria-hidden="true">→</span>
            </Link>
          </div>
        </aside>
      </div>

      {/* All services as plain content, for search engines and screen readers */}
      <div className="sc-sr">
        {services.map((s) => (
          <article key={s.slug}>
            <h3>{s.title.join(" ")}</h3>
            <p>{s.description}</p>
            <ul>
              {s.included.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
