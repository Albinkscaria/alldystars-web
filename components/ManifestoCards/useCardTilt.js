"use client";

import { useEffect } from "react";

/**
 * Subtle 3D tilt for the business cards, driven by the pointer.
 *
 * - Fine pointers only (mouse / trackpad); touch devices keep the static pose.
 * - Values are eased with a lerp in a single rAF loop that sleeps once settled.
 * - Writes CSS custom properties only (--mc-rx, --mc-ry, --mc-gx, --mc-gy), so
 *   all rendering stays in CSS on the compositor (transform / background-position).
 * - Respects prefers-reduced-motion and pauses while the section is off-screen.
 */
export default function useCardTilt(stageRef, { maxTilt = 7, ease = 0.12 } = {}) {
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof window === "undefined") return undefined;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return undefined;

    const cards = Array.from(stage.querySelectorAll("[data-mc-tilt]"));
    if (!cards.length) return undefined;

    // per-card state: current and target values
    const state = cards.map(() => ({ rx: 0, ry: 0, gx: 50, gy: 50, trx: 0, try: 0, tgx: 50, tgy: 50 }));
    let raf = 0;
    let visible = true;

    const write = (el, s) => {
      el.style.setProperty("--mc-rx", `${s.rx.toFixed(3)}deg`);
      el.style.setProperty("--mc-ry", `${s.ry.toFixed(3)}deg`);
      el.style.setProperty("--mc-gx", `${s.gx.toFixed(2)}%`);
      el.style.setProperty("--mc-gy", `${s.gy.toFixed(2)}%`);
    };

    const tick = () => {
      raf = 0;
      let moving = false;
      state.forEach((s, i) => {
        s.rx += (s.trx - s.rx) * ease;
        s.ry += (s.try - s.ry) * ease;
        s.gx += (s.tgx - s.gx) * ease;
        s.gy += (s.tgy - s.gy) * ease;
        if (
          Math.abs(s.trx - s.rx) > 0.01 ||
          Math.abs(s.try - s.ry) > 0.01 ||
          Math.abs(s.tgx - s.gx) > 0.05 ||
          Math.abs(s.tgy - s.gy) > 0.05
        ) {
          moving = true;
        }
        write(cards[i], s);
      });
      if (moving && visible) raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!raf && visible) raf = requestAnimationFrame(tick);
    };

    const onMove = (e) => {
      cards.forEach((card, i) => {
        const r = card.getBoundingClientRect();
        const s = state[i];
        const inside =
          e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        // the hovered card tilts strongly, the other one follows gently
        const k = inside ? 1 : 0.25;
        const nx = Math.max(-1, Math.min(1, ((e.clientX - (r.left + r.width / 2)) / r.width) * 2));
        const ny = Math.max(-1, Math.min(1, ((e.clientY - (r.top + r.height / 2)) / r.height) * 2));
        s.try = nx * maxTilt * k;
        s.trx = -ny * maxTilt * k;
        s.tgx = 50 + nx * 40;
        s.tgy = 50 + ny * 40;
      });
      wake();
    };
    const onLeave = () => {
      state.forEach((s) => {
        s.trx = 0;
        s.try = 0;
        s.tgx = 50;
        s.tgy = 50;
      });
      wake();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) wake();
        else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0 }
    );
    io.observe(stage);

    stage.addEventListener("pointermove", onMove, { passive: true });
    stage.addEventListener("pointerleave", onLeave, { passive: true });

    return () => {
      io.disconnect();
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
      cards.forEach((c) => ["--mc-rx", "--mc-ry", "--mc-gx", "--mc-gy"].forEach((p) => c.style.removeProperty(p)));
    };
  }, [stageRef, maxTilt, ease]);
}
