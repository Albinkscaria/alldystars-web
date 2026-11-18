"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FOUNDERS, STATS } from "./founders";
import { createNamesEngine } from "./namesEngine";
import "./founders-names.css";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
const pad = (n) => String(n).padStart(2, "0");

/**
 * "Two founders. One studio." — each founder's portrait shows through his name.
 * The section pins; the first scroll step opens the first founder (the stem of a
 * letter stretches into his portrait), the second step opens the next one.
 *
 * The stage pins just below the site's fixed header (measured, not hard-coded).
 *
 * @param {object}  props
 * @param {Array}   [props.founders]      see founders.js
 * @param {Array}   [props.stats]         [{ value, suffix, label }]
 * @param {string}  [props.eyebrow]
 * @param {string}  [props.intro]         paragraph beside the heading
 * @param {number}  [props.stepLength]    scroll distance per founder, in viewport heights
 * @param {string}  [props.className]     extra classes on the section (e.g. next/font variables)
 */
export default function FoundersNames({
  founders = FOUNDERS,
  stats = STATS,
  eyebrow = "Meet the founders",
  intro = "An award-winning artist and a developer built one studio in Kottayam where creative thinking and technical craft share the same desk.",
  stepLength = 1,
  className = "",
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const goToRef = useRef(() => {});
  const [open, setOpen] = useState(-1); // -1 = names view, otherwise the open founder
  // Rebuild only when the founders really change (an inline array prop is a new object every render).
  const foundersRef = useRef(founders);
  foundersRef.current = founders;
  const foundersKey = founders.map((f) => `${f.id}:${f.word}:${f.image.src}:${f.quote}:${f.bio}`).join("|");

  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    const stage = stageRef.current;
    const root = document.documentElement;
    const list = foundersRef.current;
    const count = list.length;

    // The site sets `html { scroll-behavior: smooth }`, which turns every scroll
    // write from ScrollTrigger's snap into its own animated scroll (stutter).
    // Use instant scrolling while this section is mounted; the founder buttons
    // still ask for a smooth scroll explicitly.
    const prevScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";

    // The fixed site header covers the top of the viewport: pin the stage just
    // below it and make the stage exactly the remaining height.
    const header = document.querySelector(".site-header");
    let headerH = 0;
    const syncHeader = () => {
      headerH = header ? header.offsetHeight : 0;
      section.style.setProperty("--fn-offset", `${headerH}px`);
    };
    syncHeader();

    const engine = createNamesEngine({ root: stage, founders: list });
    const state = { p: 0, intro: 0 };
    let last = -2;

    const draw = () => {
      const k = engine.render(state.p, state.intro);
      if (k !== last) {
        last = k;
        setOpen(k);
      }
    };
    const relayout = () => {
      engine.layout();
      draw();
    };

    // Mobile address bars resize the viewport while scrolling; don't re-pin on that.
    ScrollTrigger.config({ ignoreMobileResize: true });

    const mm = gsap.matchMedia(stage);
    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference) and (min-height: 500px)",
        // reduced motion, or a screen too short to hold the stage (phones held
        // sideways): pinned, the bottom of the stage would sit off-screen
        reduce: "(prefers-reduced-motion: reduce), (max-height: 499.98px)",
      },
      (ctx) => {
        engine.layout();

        if (ctx.conditions.reduce) {
          // No pinning or scrubbing: everything is in place; the buttons switch founders instantly.
          state.intro = 1;
          draw();
          goToRef.current = (k) => {
            state.p = k;
            draw();
          };
          return;
        }

        const tween = gsap.to(state, {
          p: count,
          ease: "none",
          onUpdate: draw,
          scrollTrigger: {
            trigger: stage,
            start: () => `top ${headerH}px`,
            end: () => `+=${window.innerHeight * stepLength * count}`,
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefreshInit: syncHeader,
            onRefresh: relayout,
            // one scroll gesture = one founder (snap onward in the direction of travel)
            snap: {
              snapTo: 1 / count,
              duration: { min: 0.7, max: 1.1 },
              delay: 0.08,
              ease: "power2.inOut",
              directional: true,
              inertia: false,
            },
          },
        });

        // Names rise into place once, when the section comes into view.
        const enter = ScrollTrigger.create({
          trigger: stage,
          start: "top 75%",
          once: true,
          onEnter: () => gsap.to(state, { intro: 1, duration: 1.3, ease: "none", onUpdate: draw }),
        });
        // Arriving mid-section (reload, anchor link): skip the entrance.
        if (window.scrollY >= enter.start) {
          state.intro = 1;
          enter.kill();
        }
        draw();

        goToRef.current = (k) => {
          const st = tween.scrollTrigger;
          window.scrollTo({ top: st.start + ((st.end - st.start) * k) / count, behavior: "smooth" });
        };

        return () => {
          enter.kill();
        };
      }
    );

    // Re-measure when the stage resizes or the display font finishes loading.
    const ro = new ResizeObserver(() => relayout());
    ro.observe(stage);

    // Content above the section can change height after the trigger was
    // measured (web fonts, images). Re-measure when the page height really
    // changes; a refresh ends at the same height, so this doesn't feed back.
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

    let alive = true;
    document.fonts?.ready.then(() => {
      if (!alive) return;
      relayout();
      ScrollTrigger.refresh();
    });

    return () => {
      alive = false;
      pageRo.disconnect();
      clearTimeout(refreshTimer);
      ro.disconnect();
      mm.revert();
      engine.destroy();
      root.style.scrollBehavior = prevScrollBehavior;
    };
  }, [foundersKey, stepLength]);

  const goTo = (k) => goToRef.current(k);

  return (
    <section ref={sectionRef} className={`fn ${className}`} aria-labelledby={`${uid}-title`}>
      <div className="fn-stage" ref={stageRef}>
        <header className="fn-head" data-fn-fade>
          <p className="fn-eyebrow">{eyebrow}</p>
          <h2 className="fn-title" id={`${uid}-title`}>
            Two founders.
            <br />
            <em>One</em> studio.
          </h2>
        </header>
        <p className="fn-intro" data-fn-fade>
          {intro}
        </p>

        <svg className="fn-svg" aria-hidden="true" focusable="false">
          <defs>
            {founders.map((f, i) => (
              <mask key={f.id} id={`${uid}-m${i}`} data-fn-mask={i} maskUnits="userSpaceOnUse">
                <rect data-fn-maskbg={i} fill="#000" />
                <g data-fn-group={i}>
                  <text data-fn-word={i} className="fn-word" fill="#fff">
                    {f.word}
                  </text>
                </g>
                <rect data-fn-stem={i} fill="#fff" />
              </mask>
            ))}
          </defs>
          {founders.map((f, i) => (
            <g key={f.id} data-fn-layer={i} mask={`url(#${uid}-m${i})`}>
              <rect data-fn-base={i} className="fn-base" />
              <image data-fn-image={i} href={f.image.src} preserveAspectRatio="xMidYMid slice" />
            </g>
          ))}
        </svg>

        {founders.map((f, i) => (
          <div key={f.id} className="fn-meta" data-fn-meta={i} aria-hidden="true">
            <span className="fn-num">{pad(i + 1)}</span>
            <span className="fn-meta-role">
              {f.role.split(" & ")[0]}
              {f.role.includes(" & ") && <span>&amp; {f.role.split(" & ")[1]}</span>}
            </span>
            <span className="fn-meta-text">{f.teaser}</span>
          </div>
        ))}

        {founders.map((f, i) => (
          <div key={f.id} className="fn-chapter" data-fn-chapter={i} aria-hidden="true">
            <span className="fn-ln"><span className="fn-li fn-kicker">{pad(i + 1)} / {pad(founders.length)} — {f.side}</span></span>
            <span className="fn-ln"><span className="fn-li fn-name">{f.name}</span></span>
            <span className="fn-ln"><span className="fn-li fn-role">{f.role}</span></span>
            <span className="fn-ln fn-quote-ln"><span className="fn-li fn-quote">{f.quote}</span></span>
            <span className="fn-ln fn-bio-ln"><span className="fn-li fn-bio">{f.bio}</span></span>
            <span className="fn-ln fn-skills-ln">
              <span className="fn-li fn-skills">
                {f.skills.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </span>
            </span>
          </div>
        ))}

        {founders.map((f, i) => (
          <div key={f.id} className="fn-caption" data-fn-cap={i} aria-hidden="true">
            <b>{f.name}</b>
            <span>
              {pad(i + 1)} · {f.tag}
            </span>
          </div>
        ))}

        <div className="fn-foot">
          <ul className="fn-stats" data-fn-fade>
            {stats.map((s) => (
              <li key={s.label}>
                <b>
                  {s.value}
                  <i>{s.suffix}</i>
                </b>{" "}
                {s.label}
              </li>
            ))}
          </ul>
          <nav className="fn-pager" aria-label="Founders">
            {founders.map((f, i) => (
              <button
                key={f.id}
                type="button"
                className="fn-page"
                aria-current={open === i ? "true" : undefined}
                aria-label={open === i ? `Back to both founders` : `Meet ${f.name}`}
                onClick={() => goTo(open === i ? 0 : i + 1)}
              >
                <i aria-hidden="true" />
                {f.name.split(" ")[0]}
              </button>
            ))}
          </nav>
        </div>

        {/* Full content for screen readers and search engines. */}
        <div className="fn-sr">
          <p>{intro}</p>
          {founders.map((f) => (
            <article key={f.id}>
              <h3>{f.name}</h3>
              <p>{f.role}</p>
              <p>{f.about}</p>
              <p>{f.skills.join(", ")}</p>
              <blockquote>
                <p>{f.quote}</p>
              </blockquote>
            </article>
          ))}
          <ul>
            {stats.map((s) => (
              <li key={s.label}>
                {s.value}
                {s.suffix} {s.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
