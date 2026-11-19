"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ArchiveFile from "./ArchiveFile";
import ArchiveCover from "./ArchiveCover";
import useArchiveCursor from "./useArchiveCursor";
import { FILTERS as DEFAULT_FILTERS, PROJECTS as DEFAULT_PROJECTS } from "./projects";
import "./projects-archive.css";

const pad = (n) => String(n).padStart(2, "0");
const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};
const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Projects page, "The Archive".
 * Every project is a file in a studio drawer: live case studies peek out and
 * can be pulled, unreleased work is sealed, and the last file invites a new client.
 *
 * @param {string} [props.className]  extra classes (e.g. next/font variables)
 */
export default function ProjectsArchive({
  projects = DEFAULT_PROJECTS,
  filters = DEFAULT_FILTERS,
  kicker = "Selected work",
  title = "The",
  titleScript = "archive.",
  lede = "Every project lives in a file. Pull one out to open the case study — the sealed ones are launching soon.",
  hint = "Hover to pull a file",
  plate = "alldystars — archive 2026",
  perDrawer = 5,
  className = "",
}) {
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;
  const rootRef = useRef(null);
  const cursorRef = useRef(null);
  const coverRefs = useRef({});
  const zoomRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [settled, setSettled] = useState(false);
  const [active, setActive] = useState(null); // global index of the hovered / focused file
  const [filter, setFilter] = useState("all");
  const [opening, setOpening] = useState(null); // { project, index, rect }
  const headingId = useId();
  const statusId = useId();

  useArchiveCursor(rootRef, cursorRef);

  // ---- entrance (once) ----
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // once the files have dropped in, hover transitions run without the entrance stagger
  useEffect(() => {
    if (!inView) return undefined;
    const t = window.setTimeout(() => setSettled(true), 2200);
    return () => window.clearTimeout(t);
  }, [inView]);

  const isVisible = useCallback(
    (p) => filter === "all" || p.category == null || p.category === filter,
    [filter]
  );
  const visibleCount = useMemo(
    () => projects.filter((p) => p.status !== "cta" && isVisible(p)).length,
    [projects, isVisible]
  );
  const totalCount = useMemo(() => projects.filter((p) => p.status !== "cta").length, [projects]);
  const drawers = useMemo(() => chunk(projects, Math.max(1, perDrawer)), [projects, perDrawer]);

  const onActivate = useCallback((i) => setActive(i), []);
  const onDeactivate = useCallback((i) => setActive((cur) => (cur === i ? null : cur)), []);

  // ---- click a live file: pull it out, grow the cover to full screen, then navigate ----
  const onOpen = useCallback(
    (e, project, index) => {
      const cover = coverRefs.current[project.id];
      if (reducedMotion() || !cover) return; // plain navigation via <Link>
      e.preventDefault();
      const r = cover.getBoundingClientRect();
      setOpening({ project, index, rect: { left: r.left, top: r.top, width: r.width, height: r.height } });
    },
    []
  );

  useEffect(() => {
    if (!opening) return undefined;
    const el = zoomRef.current;
    const { rect, project } = opening;
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      routerRef.current.push(project.href);
    };
    if (!el || typeof el.animate !== "function") {
      go();
      return undefined;
    }
    routerRef.current.prefetch?.(project.href);
    const anim = el.animate(
      [
        { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`, borderRadius: "4px" },
        { left: "0px", top: "0px", width: "100vw", height: "100vh", borderRadius: "0px" },
      ],
      { duration: 900, delay: 220, easing: "cubic-bezier(0.76, 0, 0.24, 1)", fill: "forwards" }
    );
    anim.onfinish = go;
    const safety = window.setTimeout(go, 1600);
    return () => {
      window.clearTimeout(safety);
      anim.onfinish = null;
    };
  }, [opening]);

  // ---- leaning neighbours (desktop): files part around the active one ----
  const leanFor = (globalIndex, drawerStart, drawerLength) => {
    if (active == null || active === globalIndex) return { lean: 0, shift: 0 };
    if (active < drawerStart || active >= drawerStart + drawerLength) return { lean: 0, shift: 0 };
    const d = globalIndex - active;
    const k = 1 / Math.abs(d);
    return { lean: Math.sign(d) * 3.2 * k, shift: Math.sign(d) * 1.7 * k };
  };

  const activeLabel = active == null ? "—" : pad(active + 1);

  return (
    <section
      ref={rootRef}
      className={`pa ${className}`}
      data-inview={inView ? "true" : "false"}
      data-settled={settled ? "true" : undefined}
      data-opening={opening ? "true" : undefined}
      aria-labelledby={headingId}
    >
      <div className="pa__intro">
        <div className="pa__head">
          <p className="pa__kicker">{kicker}</p>
          <h1 className="pa__title" id={headingId}>
            <span className="pa__title-in">
              {title} <em>{titleScript}</em>
            </span>
          </h1>
        </div>
        <p className="pa__lede">{lede}</p>
        <p className="pa__count" aria-hidden="true">
          <b>{pad(visibleCount)}</b>
          {visibleCount === 1 ? "file" : "files"} · {pad(totalCount)} total
        </p>
      </div>

      <div className="pa__bar">
        <div className="pa__filters" role="group" aria-label="Filter projects by discipline">
          {filters.map((f) => {
            const n =
              f.key === "all"
                ? totalCount
                : projects.filter((p) => p.status !== "cta" && p.category === f.key).length;
            if (n === 0) return null; // no files in this discipline yet: don't offer an empty drawer
            return (
              <button
                key={f.key}
                type="button"
                className="pa__chip"
                aria-pressed={filter === f.key}
                aria-controls={statusId}
                onClick={() => {
                  setFilter(f.key);
                  setActive(null);
                }}
              >
                {f.label}
                {f.key === "all" && <span aria-hidden="true"> {pad(n)}</span>}
              </button>
            );
          })}
        </div>
        <p className="pa__hint" aria-hidden="true">
          {hint.split(" ").slice(0, -3).join(" ")} <i>{hint.split(" ").slice(-3).join(" ")}</i> ↓
        </p>
      </div>

      <p className="pa-visually-hidden" id={statusId} role="status" aria-live="polite">
        {visibleCount} {visibleCount === 1 ? "project" : "projects"} shown
      </p>

      {drawers.map((group, d) => {
        const start = d * perDrawer;
        return (
          <div className="pa-drawer" key={d} style={{ "--n": group.length }}>
            <div className="pa-drawer__files">
              {group.map((project, j) => {
                const i = start + j;
                const { lean, shift } = leanFor(i, start, group.length);
                return (
                  <ArchiveFile
                    key={project.id}
                    project={project}
                    index={i}
                    slot={j}
                    active={active === i}
                    hidden={!isVisible(project)}
                    lean={lean}
                    shift={shift}
                    opening={opening?.index === i}
                    onActivate={onActivate}
                    onDeactivate={onDeactivate}
                    onOpen={onOpen}
                    coverRef={(el) => {
                      if (el) coverRefs.current[project.id] = el;
                      else delete coverRefs.current[project.id];
                    }}
                  />
                );
              })}
            </div>
            <div className="pa-drawer__edge" aria-hidden="true">
              <span className="pa-drawer__handle" />
              <span className="pa-drawer__plate">{plate}</span>
              <span className="pa-drawer__ticker">
                File <b>{active != null && active >= start && active < start + group.length ? activeLabel : "—"}</b> /{" "}
                {pad(projects.length)}
              </span>
            </div>
          </div>
        );
      })}

      {opening && (
        <div className="pa-zoom" ref={zoomRef} aria-hidden="true" style={{ ...px(opening.rect) }}>
          <ArchiveCover project={opening.project} priority sizes="100vw" />
          <div className="pa-zoom__meta">
            <p>{opening.project.discipline} · {opening.project.year}</p>
            <p className="pa-zoom__title">{opening.project.title}</p>
          </div>
        </div>
      )}

      <div className="pa-cursor" ref={cursorRef} aria-hidden="true" data-state="dot" data-visible="false">
        <span className="pa-cursor__ring">
          <span className="pa-cursor__label" />
        </span>
        <span className="pa-cursor__dot" />
      </div>
    </section>
  );
}

function px(r) {
  return { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` };
}
