"use client";

import { useEffect, useId, useRef, useState } from "react";
import useCardTilt from "./useCardTilt";
import "./manifesto-cards.css";

const DEFAULT_ROWS = [
  { label: "Problem", value: "Solved", mark: "check" },
  { label: "Trust", value: "Built", mark: "check" },
  { label: "Growth", value: "Accelerated", mark: "up" },
];

function Mark({ type }) {
  if (type === "up") {
    return (
      <svg className="mc-row__mark" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path d="M8 13.5V3M3.5 7.5 8 3l4.5 4.5" />
      </svg>
    );
  }
  return (
    <svg className="mc-row__mark" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M2.5 8.5 6.2 12 13.5 4.5" />
    </svg>
  );
}

/**
 * Manifesto section, "Every card has two sides".
 * Front of the card = aesthetics, back of the card = business.
 *
 * @param {string} [props.className]  extra classes (e.g. next/font variables)
 */
export default function ManifestoCards({
  id = "manifesto",
  kicker = "01 / Manifesto",
  titleTop = "Design beyond",
  titleTopScript = "aesthetics.",
  titleBottom = "Business beyond",
  titleBottomScript = "expectations.",
  body = (
    <>
      We create brands, digital experiences, and visual communications that don’t just look exceptional — they{" "}
      <strong>solve problems, build trust, and accelerate business growth.</strong> Every pixel, every interaction, and
      every detail is crafted with purpose, so your brand stands out in an increasingly competitive world.
    </>
  ),
  front = { script: "first impression", name: "alldystars", line: "Creative studio · Kottayam" },
  back = {
    eyebrow: "The other side",
    meta: "No. 01 / 2026",
    rows: DEFAULT_ROWS,
    footnote: "Every card has two sides",
    script: "beyond expectations.",
  },
  labels = { front: "Aesthetics", back: "Business" },
  className = "",
}) {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const [inView, setInView] = useState(false);
  const headingId = useId();
  const backId = useId();

  useCardTilt(stageRef);

  // one-shot entrance when the section scrolls into view
  useEffect(() => {
    const el = sectionRef.current;
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
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const rows = back.rows ?? DEFAULT_ROWS;

  return (
    <section
      id={id}
      ref={sectionRef}
      className={`mc ${className}`}
      data-inview={inView ? "true" : "false"}
      aria-labelledby={headingId}
    >
      <div className="mc__inner">
        <div className="mc__copy">
          <p className="mc__kicker">{kicker}</p>
          <h2 className="mc__title" id={headingId}>
            <span className="mc__line">
              <span className="mc__line-in">{titleTop}</span>
            </span>
            <span className="mc__line mc__line--script">
              <em className="mc__line-in">{titleTopScript}</em>
            </span>
            <span className="mc__line">
              <span className="mc__line-in">{titleBottom}</span>
            </span>
            <span className="mc__line mc__line--script">
              <em className="mc__line-in">{titleBottomScript}</em>
            </span>
          </h2>
          <p className="mc__body">{body}</p>
        </div>

        <figure className="mc__stage" ref={stageRef} aria-describedby={backId}>
          <figcaption className="mc-visually-hidden">
            Two sides of an alldystars business card: the front shows the aesthetics, the back shows the business
            results.
          </figcaption>

          {/* FRONT: aesthetics */}
          <div className="mc-card mc-card--front">
            <div className="mc-card__tilt" data-mc-tilt="">
              <div className="mc-card__face mc-front" aria-hidden="true">
                <span className="mc-front__star" />
                <span className="mc-front__script">{front.script}</span>
                <span className="mc-front__name">{front.name}</span>
                <span className="mc-front__line">{front.line}</span>
              </div>
            </div>
          </div>

          {/* BACK: business */}
          <div className="mc-card mc-card--back">
            <div className="mc-card__tilt" data-mc-tilt="">
              <div className="mc-card__face mc-back" id={backId}>
                <div className="mc-back__head">
                  <span>{back.eyebrow}</span>
                  <span>{back.meta}</span>
                </div>
                <ul className="mc-back__rows">
                  {rows.map((r, i) => (
                    <li className="mc-row" key={r.label} style={{ "--i": i }}>
                      <span className="mc-row__label">{r.label}</span>
                      <span className="mc-row__value">{r.value}</span>
                      <Mark type={r.mark} />
                    </li>
                  ))}
                </ul>
                <div className="mc-back__foot">
                  <span className="mc-back__note">{back.footnote}</span>
                  <span className="mc-back__script">{back.script}</span>
                </div>
              </div>
            </div>
          </div>

          <p className="mc-label mc-label--front" aria-hidden="true">
            <span>Front</span>
            {labels.front}
          </p>
          <p className="mc-label mc-label--back" aria-hidden="true">
            <span>Back</span>
            {labels.back}
          </p>
        </figure>
      </div>
    </section>
  );
}
