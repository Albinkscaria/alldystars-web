"use client";

import Link from "next/link";
import ArchiveCover from "./ArchiveCover";

const pad = (n) => String(n).padStart(2, "0");

/**
 * One file in the drawer.
 * The whole folder is clickable for live / cta files (stretched link), but the
 * only focusable element is the real <Link>, so keyboard + screen readers get
 * a single, clearly labelled action per project.
 */
export default function ArchiveFile({
  project,
  index,
  slot,
  active,
  hidden,
  lean,
  shift,
  opening,
  onActivate,
  onDeactivate,
  onOpen,
  coverRef,
}) {
  const { status, tone, tab, discipline, year, title } = project;
  const isLive = status === "live";
  const isCta = status === "cta";
  const isSealed = status === "sealed";
  const headingId = `pa-file-${project.id}`;

  const cursor = isSealed ? "Sealed" : isCta ? "Start" : "Pull";
  const cursorTone = isSealed || isCta ? "dark" : "red";

  const handleClick = (e) => {
    if (!isLive) return;
    // lets the case study's Close button go back here, to the same scroll position
    try {
      sessionStorage.setItem("pa-opened", project.id);
    } catch {}
    if (!onOpen) return;
    // let the browser handle new-tab / modified clicks
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    onOpen(e, project, index);
  };

  return (
    <article
      className={`pa-file pa-file--${status} pa-tone--${tone}`}
      style={{ "--i": index, "--slot": slot, "--lean": `${lean}deg`, "--shift": `${shift}cqi` }}
      data-active={active ? "true" : undefined}
      data-hidden={hidden ? "true" : undefined}
      data-opening={opening ? "true" : undefined}
      data-cursor={cursor}
      data-cursor-tone={cursorTone}
      aria-labelledby={headingId}
      aria-hidden={hidden ? "true" : undefined}
      inert={hidden ? true : undefined}
      onPointerEnter={(e) => e.pointerType === "mouse" && onActivate(index)}
      onPointerLeave={(e) => e.pointerType === "mouse" && onDeactivate(index)}
      onFocus={() => onActivate(index)}
      onClick={(e) => {
        // the whole folder is a hit area for its single link (mouse / touch convenience)
        if (isSealed || e.target.closest("a")) return;
        const link = e.currentTarget.querySelector(".pa-file__link");
        if (link) link.click();
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) onDeactivate(index);
      }}
    >
      <div className="pa-file__back" aria-hidden="true" />
      <p className="pa-file__tab" aria-hidden="true">
        <b>{pad(index + 1)}</b>
        {tab}
      </p>

      {isLive && (
        <div className="pa-file__cover" ref={coverRef}>
          <ArchiveCover project={project} />
        </div>
      )}

      <div className="pa-file__front">
        <p className="pa-file__meta">
          <span>{discipline}</span>
          <span>{year}</span>
        </p>
        <h3 className="pa-file__title" id={headingId}>
          {title}
        </h3>

        {isLive && (
          <Link href={project.href} className="pa-file__link pa-btn" data-cursor="Open" onClick={handleClick}>
            Open case study <span aria-hidden="true">→</span>
          </Link>
        )}
        {isCta && (
          <Link href={project.href} className="pa-file__link pa-btn pa-btn--ink" data-cursor="Start">
            {project.cta || "Start a project"} <span aria-hidden="true">→</span>
          </Link>
        )}
        {isSealed && (
          <>
            <p className="pa-file__tape">
              <span className="pa-visually-hidden">Status: </span>
              {project.seal || "Launching soon"}
            </p>
            <span className="pa-file__stamp" aria-hidden="true">
              {project.stamp || "Opening soon"}
              <small>✦ alldystars ✦</small>
            </span>
          </>
        )}
      </div>
    </article>
  );
}
