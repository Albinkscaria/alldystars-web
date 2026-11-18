/**
 * Dot-matrix "print": a grid of dots over the hero. A hidden artwork lives in
 * the grid; wherever the pointer goes, the dots swell and light up in colour
 * to match it, leaving a wake that slowly cools back to grey.
 *
 * Plain Canvas 2D — no WebGL. The resting grid is cached in an offscreen
 * bitmap; each frame only redraws the warm dots, and the loop sleeps when
 * nothing is moving.
 */

const TAU = Math.PI * 2;
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const hexToRgb = (h) => {
  const n = parseInt(h.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export const PALETTES = {
  // site coral → hot pink → violet → the site's indigo (holographic foil)
  foil: ["#FF4433", "#FF2D6F", "#8B5CFF", "#211AE0"],
  // coral → orange → gold
  sunset: ["#FF4433", "#FF6B2C", "#FFB020"],
  // the site coral alone
  signal: ["#FF4433", "#FF4433"],
};

export function createDotPrint({
  host, // element that receives pointer events (the hero section)
  canvas,
  drawArtwork, // (ctx, W, H) => void, white = full dot
  palette = PALETTES.foil,
  gap = 13, // dot pitch, px
  radius = 235, // reach of the pointer, px
  linger = 1.9, // seconds for the print to cool (time constant)
  base = "#c6c6c6", // resting dot colour (neutral grey, site palette)
  autopilot = true, // touch screens: drift over the artwork when nobody is touching
}) {
  const ctx = canvas.getContext("2d");
  const stops = palette.map(hexToRgb);
  const baseRgb = hexToRgb(base);
  const ink = [118, 118, 118]; // dots outside the artwork darken towards this
  const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mqHover = window.matchMedia("(hover: hover) and (pointer: fine)");

  let W = 0, H = 0, dpr = 1, cols = 0, rows = 0;
  let val = new Float32Array(0); // artwork brightness per dot
  let heat = new Float32Array(0); // current warmth per dot
  let baseLayer = null; // cached resting grid
  let raf = 0, last = 0, clock = 0;
  let visible = true;
  let destroyed = false;

  const P = { x: 0, y: 0, tx: 0, ty: 0, on: false, moved: 0 };
  let lastInput = -1e9; // ms timestamp of the last real pointer input

  /* ---------- layout ---------- */
  function layout() {
    const r = host.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    cols = Math.ceil(W / gap);
    rows = Math.ceil(H / gap);
    heat = new Float32Array(cols * rows);

    // sample the hidden artwork once per layout
    const art = document.createElement("canvas");
    art.width = W;
    art.height = H;
    const a = art.getContext("2d", { willReadFrequently: true });
    a.fillStyle = "#000";
    a.fillRect(0, 0, W, H);
    drawArtwork(a, W, H);
    const d = a.getImageData(0, 0, W, H).data;
    val = new Float32Array(cols * rows);
    for (let j = 0; j < rows; j++) {
      const py = Math.min(H - 1, Math.round(j * gap + gap / 2));
      for (let i = 0; i < cols; i++) {
        const px = Math.min(W - 1, Math.round(i * gap + gap / 2));
        val[j * cols + i] = d[(py * W + px) * 4] / 255;
      }
    }

    // cache the resting grid (with a faint hint of the artwork)
    baseLayer = document.createElement("canvas");
    baseLayer.width = canvas.width;
    baseLayer.height = canvas.height;
    const b = baseLayer.getContext("2d");
    b.setTransform(dpr, 0, 0, dpr, 0, 0);
    b.fillStyle = base;
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const v = val[j * cols + i];
        b.beginPath();
        b.arc(i * gap + gap / 2, j * gap + gap / 2, 0.95 + v * 0.35, 0, TAU);
        b.fill();
      }
    }
    if (mqReduce.matches) printStill();
    draw();
  }

  /* reduced motion: show the artwork softly, once, with no movement */
  function printStill() {
    for (let n = 0; n < val.length; n++) heat[n] = val[n] > 0.04 ? 0.38 : 0;
  }

  /* ---------- colour along the gradient (position + slow drift) ---------- */
  function colourAt(x, y) {
    if (stops.length === 1) return stops[0];
    let t = (x / W) * 0.55 + (y / H) * 0.45 + clock * 0.035;
    t = t - Math.floor(t);
    t = t < 0.5 ? t * 2 : (1 - t) * 2; // mirror so it flows back and forth
    const s = t * (stops.length - 1);
    const k = Math.min(stops.length - 2, Math.floor(s));
    const f = s - k;
    const A = stops[k], B = stops[k + 1];
    return [A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f, A[2] + (B[2] - A[2]) * f];
  }

  /* ---------- simulation ---------- */
  function step(dt, live = P.on) {
    const k = 1 - Math.exp(-dt * 14);
    P.x += (P.tx - P.x) * k;
    P.y += (P.ty - P.y) * k;
    const cool = Math.exp(-dt / linger);
    const rr = radius / gap;
    const ci = P.x / gap, cj = P.y / gap;
    // only cells near the pointer can warm up
    const i0 = Math.max(0, Math.floor(ci - rr * 1.3)), i1 = Math.min(cols - 1, Math.ceil(ci + rr * 1.3));
    const j0 = Math.max(0, Math.floor(cj - rr * 1.3)), j1 = Math.min(rows - 1, Math.ceil(cj + rr * 1.3));
    let warm = 0;
    for (let n = 0; n < heat.length; n++) {
      const h = heat[n] * cool;
      heat[n] = h < 0.004 ? 0 : h;
      if (h > warm) warm = h;
    }
    if (live) {
      for (let j = j0; j <= j1; j++) {
        for (let i = i0; i <= i1; i++) {
          const dx = i + 0.5 - ci, dy = j + 0.5 - cj;
          const d2 = (dx * dx + dy * dy) / (rr * rr);
          if (d2 < 1.6) {
            const f = Math.exp(-d2 * 2.4);
            const n = j * cols + i;
            if (f > heat[n]) heat[n] = f;
            if (f > warm) warm = f;
          }
        }
      }
    }
    return warm;
  }

  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (baseLayer) ctx.drawImage(baseLayer, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const n = j * cols + i;
        const h = heat[n];
        if (h < 0.01) continue;
        const v = val[n];
        const x = i * gap + gap / 2, y = j * gap + gap / 2;
        const art = v > 0.04;
        const r = 0.95 + v * 0.35 + h * (art ? 0.4 + v * 5.4 : 0.55);
        const to = art ? colourAt(x, y) : ink;
        const m = art ? clamp01(h * 1.25) : h * 0.8;
        ctx.fillStyle = `rgb(${(baseRgb[0] + (to[0] - baseRgb[0]) * m) | 0},${(baseRgb[1] + (to[1] - baseRgb[1]) * m) | 0},${(baseRgb[2] + (to[2] - baseRgb[2]) * m) | 0})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();
      }
    }
  }

  /* ---------- touch autopilot: drift over the artwork ---------- */
  function autopilotTarget(t) {
    const cx = W * 0.5, cy = H * 0.5;
    P.tx = cx + Math.sin(t * 0.37) * W * 0.36 + Math.sin(t * 0.91) * W * 0.06;
    P.ty = cy + Math.sin(t * 0.53 + 1.2) * H * 0.34;
  }

  /* ---------- loop ---------- */
  function frame(now) {
    raf = 0;
    if (destroyed) return;
    const dt = Math.min(0.05, (now - (last || now)) / 1000) || 1 / 60;
    last = now;
    clock += dt;
    const piloting = autopilot && !mqHover.matches && now - lastInput > 3000;
    if (piloting) {
      P.on = true;
      autopilotTarget(clock);
    }
    // a resting cursor stops printing after a moment, so everything can cool and sleep
    const live = P.on && (piloting || now - lastInput < 1200);
    const warm = step(dt, live);
    draw();
    const settling = Math.abs(P.tx - P.x) + Math.abs(P.ty - P.y) > 0.5;
    // sleep when nothing is warm, nothing is moving and nobody is piloting
    if (visible && !document.hidden && (warm > 0 || settling || piloting)) raf = requestAnimationFrame(frame);
  }
  function wake() {
    if (!raf && visible && !document.hidden && !mqReduce.matches && !destroyed) {
      last = 0;
      raf = requestAnimationFrame(frame);
    }
  }

  /* ---------- input ---------- */
  function onMove(e) {
    const r = host.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    if (!P.on) {
      P.x = x;
      P.y = y;
    }
    P.tx = x;
    P.ty = y;
    P.on = true;
    lastInput = performance.now();
    wake();
  }
  function onLeave(e) {
    if (e.pointerType === "touch") return; // keep the print while the finger lifts
    P.on = false;
    wake();
  }
  host.addEventListener("pointermove", onMove, { passive: true });
  host.addEventListener("pointerdown", onMove, { passive: true });
  host.addEventListener("pointerleave", onLeave, { passive: true });

  const ro = new ResizeObserver(() => {
    layout();
    wake();
  });
  ro.observe(host);

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) wake();
  });
  io.observe(host);

  const onVis = () => !document.hidden && wake();
  document.addEventListener("visibilitychange", onVis);
  const onReduce = () => {
    if (mqReduce.matches) {
      cancelAnimationFrame(raf);
      raf = 0;
      printStill();
      draw();
    } else {
      heat.fill(0);
      draw();
      wake();
    }
  };
  mqReduce.addEventListener?.("change", onReduce);

  layout();
  wake();

  return {
    relayout: () => {
      layout();
      wake();
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerdown", onMove);
      host.removeEventListener("pointerleave", onLeave);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      mqReduce.removeEventListener?.("change", onReduce);
    },
    /** for tests / recordings: drive one frame by hand */
    _tick(x, y, on, dt) {
      P.tx = x;
      P.ty = y;
      if (!P.on && on) {
        P.x = x;
        P.y = y;
      }
      P.on = on;
      clock += dt;
      step(dt);
      draw();
    },
  };
}
