"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DotField } from "./dotField";
import { SHAPES } from "./shapes";
import "./services-dots.css";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// alldystars' five disciplines; copy and sub-services match the /services page,
// and each link jumps to that discipline's section there.
const DEFAULT_SERVICES = [
  {
    name: "Brand Identity & Design",
    shape: "brand",
    description: "Build a brand people remember. Everything your business needs to establish a distinctive and professional identity.",
    tags: ["Logo Design", "Brand Strategy", "Visual Identity Design", "Rebranding"],
    href: "/services#brand",
    illustration: "the letters Aa, a type specimen",
  },
  {
    name: "Web Design",
    shape: "web",
    description: "Where clean interfaces meet exceptional user experience. Digital products that are intuitive, engaging, and built to perform.",
    tags: ["Custom Website Design", "Landing Page Design", "E-commerce Design", "Dashboard Design"],
    href: "/services#web",
    illustration: "a browser window with a page layout",
  },
  {
    name: "Graphic Design",
    shape: "graphic",
    description: "Design that speaks before words do. Visual storytelling that strengthens marketing and communication.",
    tags: ["Brochures & Flyers", "Posters & Banners", "Menus & Catalogs", "Business Presentations", "Marketing Materials", "Event Branding"],
    href: "/services#graphic",
    illustration: "a poster with a red sun and bold bars",
  },
  {
    name: "Data Analytics",
    shape: "data",
    description: "Turn raw numbers into direction. Dashboards and reporting that show you what’s working and what to fix next.",
    tags: ["Data Dashboards", "Reporting Automation", "Performance Tracking", "Data Visualization"],
    href: "/services#data",
    illustration: "a bar chart with a rising trend line",
  },
  {
    name: "Business Analytics",
    shape: "business",
    description: "Decisions backed by evidence, not guesswork. Market and performance insight that sharpens strategy before you spend.",
    tags: ["Market Research", "KPI Frameworks", "Growth Strategy", "Competitor Insights"],
    href: "/services#business",
    illustration: "a donut chart with one slice pulled out",
  },
];

const pad = (n) => String(n).padStart(2, "0");

/**
 * "Five disciplines. One studio." — a pinned section where ~2,600 dots form
 * each discipline in turn as you scroll, and part around the cursor.
 *
 * @param {object}   props
 * @param {Array}    [props.services]       { name, shape, description, tags[], href, illustration }
 *                                          shape: "brand" | "web" | "graphic" | "data" | "business"
 * @param {string}   [props.number]         section number shown in the eyebrow, e.g. "02"
 * @param {string}   [props.eyebrow]
 * @param {React.ReactNode} [props.title]
 * @param {number}   [props.scrollPerStep]  viewport heights of scrolling per discipline
 * @param {string}   [props.className]      extra classes on the section (e.g. next/font variables)
 */
export default function ServicesDots({
  services = DEFAULT_SERVICES,
  number = "02",
  eyebrow = "What we do",
  title = (
    <>
      Five disciplines.
      <br />
      <em>One</em> studio.
    </>
  ),
  scrollPerStep = 0.7,
  className = "",
}) {
  const sectionRef = useRef(null);
  const listRef = useRef(null);
  const pinRef = useRef(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const fieldRef = useRef(null);
  const triggerRef = useRef(null); // the pinned ScrollTrigger (null when not pinned)
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);

  const count = services.length;
  const current = services[active];

  const goTo = (i) => {
    if (i === activeRef.current) return;
    activeRef.current = i;
    setActive(i);
    fieldRef.current?.setShape(i);
  };

  // List buttons: when pinned, scroll to that step so scroll and dots stay in sync.
  const select = (i) => {
    const st = triggerRef.current;
    if (!st) return goTo(i);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const y = st.start + (st.end - st.start) * (i / (count - 1)) + 1;
    window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
  };

  // Phones: keep the active chip visible in the swipeable row
  // (scrolls only the row, never the page).
  useEffect(() => {
    const list = listRef.current;
    if (!list || list.scrollWidth <= list.clientWidth) return;
    const chip = list.children[active];
    if (!chip) return;
    const left = chip.offsetLeft - (list.clientWidth - chip.offsetWidth) / 2;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollTo({ left, behavior: reduce ? "auto" : "smooth" });
  }, [active]);

  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    const root = document.documentElement;

    // The site sets `html { scroll-behavior: smooth }`. ScrollTrigger's snap
    // drives the scroll position frame by frame, and CSS smooth scrolling
    // turns each of those writes into its own animated scroll, so the snap
    // stutters. Use instant scrolling while this section is on the page
    // (the list buttons still ask for a smooth scroll explicitly).
    const prevScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";

    // The site header is fixed over the top of the page; the pinned stage
    // fills the viewport, so leave room for it above the heading.
    const header = document.querySelector(".site-header");
    const syncHeader = () => section.style.setProperty("--sd-header", `${header ? header.offsetHeight : 0}px`);
    syncHeader();

    const styles = getComputedStyle(section);
    const css = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;

    const small = window.matchMedia("(max-width: 899px)").matches;
    const weak = (navigator.hardwareConcurrency || 8) <= 4;
    const field = new DotField(canvasRef.current, {
      shapes: services.map((s) => SHAPES[s.shape] || SHAPES.brand),
      count: small ? 1400 : weak ? 1900 : 2600,
      fontFamily: css("--sd-display", "Georgia, serif"),
      colors: {
        ink: css("--sd-ink", "#f3efe6"),
        accent: css("--sd-accent", "#e5483d"),
        dust: css("--sd-dust", "rgba(243,239,230,0.1)"),
      },
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
    fieldRef.current = field;
    field.init();
    const detachPointer = field.attachPointer(stageRef.current);

    // Mobile address bars resize the viewport while scrolling; don't re-pin on that.
    ScrollTrigger.config({ ignoreMobileResize: true });

    const mm = gsap.matchMedia(section);
    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduce: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        if (ctx.conditions.reduce) {
          // No pinning, no flight: the list switches the picture instantly.
          field.setReducedMotion(true);
          field.setShape(activeRef.current, { instant: true });
          return;
        }
        field.setReducedMotion(false);

        // Dust gathers into the first shape when the section comes into view.
        ScrollTrigger.create({
          trigger: section,
          start: "top 70%",
          once: true,
          onEnter: () => field.assemble(),
        });

        // Pin the section and step through the disciplines with scroll.
        const st = ScrollTrigger.create({
          trigger: pinRef.current,
          start: "top top",
          end: () => `+=${window.innerHeight * scrollPerStep * (count - 1)}`,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: {
            snapTo: 1 / (count - 1),
            // nearest step, not "next step in the scroll direction" (which skips one
            // whenever you stop just past a step)
            directional: false,
            inertia: false,
            duration: { min: 0.2, max: 0.6 },
            delay: 0.15,
            ease: "power1.inOut",
          },
          onUpdate: (self) => goTo(Math.round(self.progress * (count - 1))),
        });
        triggerRef.current = st;
        // Page opened part-way through (reload / back button): match the step.
        goTo(Math.round(st.progress * (count - 1)));

        return () => {
          triggerRef.current = null;
        };
      }
    );

    // Content above this section can change height after the triggers were
    // measured (web fonts, images, the preloader releasing the scrollbar).
    // Re-measure whenever the page height really changes. ScrollTrigger's own
    // refresh briefly unpins and re-pins, but ends at the same height, so this
    // doesn't feed back into itself.
    let lastHeight = document.body.scrollHeight;
    let refreshTimer = 0;
    const pageRo = new ResizeObserver(() => {
      const h = document.body.scrollHeight;
      if (h === lastHeight) return;
      lastHeight = h;
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        syncHeader();
        ScrollTrigger.refresh();
        lastHeight = document.body.scrollHeight;
      }, 150);
    });
    pageRo.observe(document.body);
    document.fonts?.ready.then(() => {
      if (!field.destroyed) ScrollTrigger.refresh();
    });
    window.addEventListener("resize", syncHeader);

    return () => {
      pageRo.disconnect();
      clearTimeout(refreshTimer);
      window.removeEventListener("resize", syncHeader);
      mm.revert();
      detachPointer();
      field.destroy();
      fieldRef.current = null;
      root.style.scrollBehavior = prevScrollBehavior;
    };
    // services/scrollPerStep are setup-time options; remount the section to change them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section ref={sectionRef} className={`sd-section ${className}`} aria-labelledby="sd-title">
      <div ref={pinRef} className="sd-pin">
        <header className="sd-head">
          <p className="sd-eyebrow">
            <span>({number})</span> — {eyebrow}
          </p>
          <h2 id="sd-title" className="sd-title">
            {title}
          </h2>
        </header>

        <div ref={stageRef} className="sd-stage">
          <canvas
            ref={canvasRef}
            className="sd-canvas"
            role="img"
            aria-label={`Dot illustration: ${current.illustration || current.name}`}
          />
          <span className="sd-count" aria-hidden="true">
            {pad(active + 1)} / {pad(count)}
          </span>
          <span className="sd-hint" aria-hidden="true">
            Move your cursor through the dots
          </span>
        </div>

        <div className="sd-panel">
          <ol ref={listRef} className="sd-list">
            {services.map((s, i) => (
              <li key={s.name}>
                <button
                  type="button"
                  className="sd-item"
                  aria-current={i === active ? "true" : undefined}
                  onClick={() => select(i)}
                >
                  <span className="sd-num">{pad(i + 1)}</span>
                  <span className="sd-name">{s.name}</span>
                </button>
              </li>
            ))}
          </ol>

          <div className="sd-detail" aria-live="polite">
            {/* key restarts the fade-in each time the discipline changes */}
            <div key={active} className="sd-detail-inner">
              <p className="sd-desc">{current.description}</p>
              {current.tags?.length > 0 && (
                <ul className="sd-tags" aria-label="Includes">
                  {current.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
              {current.href && (
                <Link className="sd-link" href={current.href}>
                  Explore {current.name.toLowerCase()} <span aria-hidden="true">→</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
