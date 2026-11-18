"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { createDotPrint, PALETTES } from "./dotPrint";
import { drawStudioArtwork } from "./artwork";
import "./hero-dot-print.css";

/**
 * Landing hero: a dot-matrix print. A hidden artwork lives in the dots and the
 * cursor (or finger) prints it in colour. Replaces the background video.
 *
 * The section fills at least one screen and grows if its content needs more;
 * the copy starts below the site's fixed header (--hdp-top, set by the page).
 *
 * @param {object}   props
 * @param {string}   [props.eyebrow]
 * @param {string}   [props.titleTop]      first headline line
 * @param {string}   [props.titleScript]   the script line
 * @param {number}   [props.scriptWidth]   the script line's width in ems of its own font
 *                                         (shrinks it to fit narrow screens; Aniyah
 *                                         "visually stunning" ≈ 10.65)
 * @param {string}   [props.titleBottom]   last headline line
 * @param {string}   [props.lede]
 * @param {{label:string, href:string}} [props.primary]
 * @param {{label:string, href:string}} [props.secondary]
 * @param {string[]|"foil"|"sunset"|"signal"} [props.palette]  colours the artwork prints in
 * @param {Function} [props.artwork]       (ctx, W, H) => void — draw the hidden picture
 * @param {string}   [props.hint]          small prompt at the bottom ("" to hide)
 * @param {boolean}  [props.autopilot]     on touch screens, drift over the artwork when idle
 * @param {React.ReactNode} [props.children] extra content under the buttons (e.g. an index)
 * @param {string}   [props.className]     extra classes (e.g. next/font variables)
 */
export default function HeroDotPrint({
  eyebrow = "BRAND · WEB · PRINT · MOTION",
  titleTop = "We turn ideas into",
  titleScript = "visually stunning",
  scriptWidth = 10.65,
  titleBottom = "designs.",
  lede = "A creative studio that turns ambitious ideas into brands, sites, and campaigns people actually remember.",
  primary = { label: "Start a project", href: "/contact" },
  secondary = { label: "View our work", href: "/projects" },
  palette = "foil",
  artwork = drawStudioArtwork,
  hint = "Move to print the picture",
  autopilot = true,
  children,
  className = "",
}) {
  const heroRef = useRef(null);
  const canvasRef = useRef(null);
  const artRef = useRef(artwork);
  artRef.current = artwork;
  const colours = Array.isArray(palette) ? palette : PALETTES[palette] || PALETTES.foil;
  const paletteKey = colours.join(",");

  useEffect(() => {
    const engine = createDotPrint({
      host: heroRef.current,
      canvas: canvasRef.current,
      drawArtwork: (ctx, W, H) => artRef.current(ctx, W, H),
      palette: paletteKey.split(","),
      autopilot,
    });
    // fonts change the copy's size → the hero's size → re-sample
    let alive = true;
    document.fonts?.ready.then(() => alive && engine.relayout());
    if (process.env.NODE_ENV !== "production") window.__dotPrint = engine;
    return () => {
      alive = false;
      engine.destroy();
    };
  }, [paletteKey, autopilot]);

  return (
    <section className={`hdp ${className}`} ref={heroRef} style={{ "--hdp-script-w": scriptWidth }} aria-labelledby="hdp-title">
      <canvas className="hdp-canvas" ref={canvasRef} aria-hidden="true" />
      <div className="hdp-copy">
        <p className="hdp-eyebrow">{eyebrow}</p>
        <h1 className="hdp-title" id="hdp-title">
          <span className="hdp-line">{titleTop}</span>
          <span className="hdp-script">
            <span>{titleScript}</span>
          </span>
          <span className="hdp-line">{titleBottom}</span>
        </h1>
        {lede && <p className="hdp-lede">{lede}</p>}
        {(primary || secondary) && (
          <div className="hdp-ctas">
            {primary && (
              <Link className="hdp-btn" href={primary.href}>
                {primary.label} <span aria-hidden="true">→</span>
              </Link>
            )}
            {secondary && (
              <Link className="hdp-link" href={secondary.href}>
                {secondary.label}
              </Link>
            )}
          </div>
        )}
        {children}
      </div>
      {hint && (
        <p className="hdp-hint" aria-hidden="true">
          <i />
          <span className="hdp-hint-fine">{hint}</span>
          <span className="hdp-hint-touch">Drag to print the picture</span>
        </p>
      )}
    </section>
  );
}
