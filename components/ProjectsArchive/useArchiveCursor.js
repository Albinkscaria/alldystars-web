"use client";

import { useEffect } from "react";

/**
 * Custom cursor for the archive: a small dot that grows into a labelled ring
 * ("Pull", "Open", "Sealed", "Start") over anything with [data-cursor].
 * It also drives the 3D tilt of the active cover (--tx / --ty on the cover).
 *
 * Mouse / trackpad only, never with prefers-reduced-motion. A single rAF loop
 * that sleeps when the cursor has settled. Everything is cleaned up on unmount.
 */
export default function useArchiveCursor(rootRef, cursorRef) {
  useEffect(() => {
    const root = rootRef.current;
    const cursor = cursorRef.current;
    if (!root || !cursor || typeof window === "undefined") return undefined;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return undefined;

    root.classList.add("pa--cursor");
    const ring = cursor.querySelector(".pa-cursor__ring");
    const label = cursor.querySelector(".pa-cursor__label");

    let x = -100;
    let y = -100;
    let tx = x;
    let ty = y;
    let raf = 0;
    let inside = false;
    let tiltEl = null;

    const tick = () => {
      raf = 0;
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1) raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const setLabel = (target) => {
      const el = target && target.closest ? target.closest("[data-cursor]") : null;
      if (el && root.contains(el)) {
        const file = el.closest(".pa-file");
        label.textContent = el.dataset.cursor;
        cursor.dataset.tone = (file && file.dataset.cursorTone) || "red";
        cursor.dataset.state = "label";
      } else {
        cursor.dataset.state = "dot";
      }
    };

    const tilt = (e) => {
      const file = e.target.closest ? e.target.closest(".pa-file--live[data-active]") : null;
      const cover = file ? file.querySelector(".pa-file__cover") : null;
      if (tiltEl && tiltEl !== cover) {
        tiltEl.style.removeProperty("--tx");
        tiltEl.style.removeProperty("--ty");
      }
      tiltEl = cover;
      if (!cover) return;
      const r = file.getBoundingClientRect();
      const nx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      const ny = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      cover.style.setProperty("--tx", nx.toFixed(3));
      cover.style.setProperty("--ty", ny.toFixed(3));
    };

    const onMove = (e) => {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX;
      ty = e.clientY;
      if (!inside) {
        inside = true;
        x = tx;
        y = ty;
        cursor.dataset.visible = "true";
      }
      setLabel(e.target);
      tilt(e);
      wake();
    };
    const onLeave = () => {
      inside = false;
      cursor.dataset.visible = "false";
      cursor.dataset.state = "dot";
      if (tiltEl) {
        tiltEl.style.removeProperty("--tx");
        tiltEl.style.removeProperty("--ty");
        tiltEl = null;
      }
    };
    const onDown = () => ring.animate([{ scale: 1 }, { scale: 0.86 }, { scale: 1 }], { duration: 260, easing: "ease-out" });

    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave, { passive: true });
    root.addEventListener("pointerdown", onDown, { passive: true });

    return () => {
      root.classList.remove("pa--cursor");
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("pointerdown", onDown);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [rootRef, cursorRef]);
}
