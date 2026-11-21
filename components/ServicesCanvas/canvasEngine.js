/*
 * Canvas engine for the "Five disciplines. One studio." services section.
 *
 * Everything is a pure function of one number: the timeline time `t` (seconds).
 * render(t) places the camera, builds each artboard up to that point, moves the
 * cursor and the ambient light. Scroll (or a button) only decides `t`, so the
 * section scrubs forwards and backwards perfectly and never drifts out of sync.
 *
 * No framework code here — ServicesCanvas.jsx owns React state and ScrollTrigger.
 */

export const GAP = 700; // distance between artboards on the canvas (artboard = 600 × 600)
// Short intro + flights, long builds: reaching a card is quick, and the work
// on it then builds at a comfortable pace (the scroll snap glides fast at first
// and slows over the build; see ServicesCanvas.jsx).
export const T = { head: 0.3, intro: 1.1, move: 0.9, build: 4.4, after: 0.6, fill: 0.35 };
const PER = T.move + T.build + T.after;

/** Camera arrives on artboard k. */
export const tArrive = (k) => T.intro + k * PER + T.move;
/** Artboard k fully built, hand-off note visible. */
export const tFinished = (k) => tArrive(k) + T.build + 0.55;

export function timelineDuration(count) {
  return T.intro + count * PER + 0.3;
}

const HEAD = { x: -960, y: 290, z: 0.86 }; // close on the headline
const OVER = { x: 1080, y: 300, z: 0.28 }; // the whole canvas
const camFor = (k) => ({ x: k * GAP + 300, y: 300, z: 1 });

// ambient light blobs: base position (1920×1080 space), drift speed, phase
const AMBIENT = [
  [180, 120, 0.11, 0],
  [1180, 520, 0.08, 1.7],
  [560, 640, 0.13, 3.1],
  [1400, -120, 0.07, 4.2],
  [-100, 620, 0.1, 5.3],
];

const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const eo = (t) => 1 - Math.pow(1 - t, 3);
const back = (t) => (t <= 0 ? 0 : 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2));
const lerp = (a, b, p) => a + (b - a) * p;

function formatCount(node, value) {
  const dec = Number(node.dataset.dec || 0);
  const fixed = Number(value.toFixed(dec));
  return node.dataset.comma
    ? fixed.toLocaleString("en-IN", { minimumFractionDigits: dec, maximumFractionDigits: dec })
    : fixed.toFixed(dec);
}

/** Read one build step's markup once, up front. */
function parseStep(el) {
  const box = el.dataset.box.split(",").map(Number);
  Object.assign(el.style, {
    left: `${box[0]}px`,
    top: `${box[1]}px`,
    width: `${box[2]}px`,
    height: `${box[3]}px`,
    transformOrigin: el.dataset.origin || "0 0",
  });
  const tws = [...el.querySelectorAll(".tw")].map((n) => ({ n, text: n.dataset.text || "" }));
  return {
    el,
    box,
    tool: el.dataset.tool || "move",
    mode: el.dataset.mode || "none",
    first: el.firstElementChild,
    tws,
    total: tws.reduce((sum, t) => sum + t.text.length, 0),
    stagger: [...el.querySelectorAll(".s")],
    bars: [...el.querySelectorAll(".sb")],
    fades: [...el.querySelectorAll(".f, .fl")],
    lines: [...el.querySelectorAll(".d")].map((p) => ({ p, len: p.getTotalLength ? p.getTotalLength() : 0 })),
    counts: [...el.querySelectorAll(".c")],
  };
}

/** Draw one build step at progress p (0 → 1). */
function applyStep(s, p) {
  const { el, mode } = s;
  el.style.opacity = p > 0 ? "1" : "0";
  el.style.transform = "";
  el.style.clipPath = "";
  if (mode === "grow") el.style.transform = `scale(${eo(p)})`;
  else if (mode === "pop") el.style.transform = `scale(${back(clamp(p * 1.3))})`;
  else if (mode === "fade") {
    el.style.opacity = String(eo(p));
    el.style.transform = `translateY(${(1 - eo(p)) * 12}px)`;
  } else if (mode === "iris") {
    const q = eio(p);
    el.style.clipPath = `circle(${q * 75}% at 47% 46%)`;
    if (s.first) s.first.style.transform = `scale(${1.12 - 0.12 * q})`;
  }

  if (s.total) {
    let n = Math.round(p * s.total);
    s.tws.forEach((t) => {
      const k = Math.min(n, t.text.length);
      if (t.n.textContent.length !== k) t.n.textContent = t.text.slice(0, k);
      n -= k;
    });
  }
  const ns = s.stagger.length;
  s.stagger.forEach((c, j) => {
    const q = eo(seg(p, (j / ns) * 0.75, (j / ns) * 0.75 + 0.3));
    c.style.opacity = String(q);
    c.style.transform = `translateY(${(1 - q) * 10}px) scale(${0.94 + 0.06 * q})`;
  });
  const nb = s.bars.length;
  s.bars.forEach((c, j) => {
    const q = eo(seg(p, (j / nb) * 0.6, (j / nb) * 0.6 + 0.4));
    c.style.transformOrigin = "bottom";
    c.style.transform = `scaleY(${q})`;
  });
  s.lines.forEach(({ p: path, len }, j) => {
    const q = eio(seg(p, j * 0.08, 0.82));
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len * (1 - q)}`;
  });
  s.fades.forEach((f) => (f.style.opacity = String(eo(seg(p, 0.62, 1)))));
  s.counts.forEach((c) => {
    const text = formatCount(c, Number(c.dataset.to) * eo(seg(p, 0.15, 1)));
    if (c.textContent !== text) c.textContent = text;
  });
}

/**
 * @param {object} o
 * @param {HTMLElement} o.root            the pinned stage (.sc-stage)
 * @param {(k:number)=>void} o.onIndex    current service changed
 * @param {(done:number)=>void} o.onProgress  number of finished build steps on the current artboard
 */
export function createCanvasEngine({ root, onIndex, onProgress }) {
  const q = (s) => root.querySelector(s);
  const world = q(".sc-world");
  const cursor = q(".sc-cursor");
  const zoomEl = q("[data-sc-zoom]");
  const panel = q(".sc-panel");
  const tools = [...root.querySelectorAll("[data-sc-tool]")];
  const blobs = [...root.querySelectorAll(".sc-amb i")];

  const boards = [...root.querySelectorAll(".sc-ab")].map((ab) => ({
    fill: ab.querySelector(".sc-fill"),
    sel: ab.querySelector(".sc-sel"),
    selLabel: ab.querySelector(".sc-sel b"),
    note: ab.querySelector(".sc-note"),
    steps: [...ab.querySelectorAll(".el")].map(parseStep),
  }));
  const count = boards.length;
  const duration = timelineDuration(count);

  let view = { cx: 0, cy: 0, fit: 1, w: 1920, h: 1080 };
  let lastIndex = -1;
  let lastDone = -1;
  let lastTool = "";
  let time = 0;

  /** Measure the free area between the floating panels; the camera centres in it. */
  function layout() {
    const r = root.getBoundingClientRect();
    const box = (sel) => {
      const el = q(sel);
      if (!el || el.offsetParent === null) return null;
      const b = el.getBoundingClientRect();
      return { left: b.left - r.left, right: b.right - r.left, top: b.top - r.top, bottom: b.bottom - r.top, width: b.width };
    };
    const top = box(".sc-top");
    const left = box(".sc-left");
    const side = box(".sc-panel");
    let L = left ? left.right : 0;
    let R = r.width;
    let B = r.height;
    if (side) {
      if (side.width < r.width * 0.6) R = side.left; // side panel
      else B = side.top; // bottom sheet (phones)
    }
    const Tt = top ? top.bottom : 0;
    const availW = Math.max(120, R - L);
    const availH = Math.max(120, B - Tt);
    view = {
      cx: L + availW / 2,
      cy: Tt + availH / 2 + 8,
      fit: Math.min(1, (availW - 32) / 660, (availH - 40) / 690),
      w: r.width,
      h: r.height,
    };
  }

  function camera(t) {
    if (t < T.intro) {
      const p = eio(seg(t, T.head, T.intro - 0.1));
      return { k: 0, x: lerp(HEAD.x, OVER.x, p), y: lerp(HEAD.y, OVER.y, p), z: lerp(HEAD.z, OVER.z, p) };
    }
    const u = t - T.intro;
    const k = Math.min(count - 1, Math.floor(u / PER));
    const r = u - k * PER;
    const from = k === 0 ? OVER : camFor(k - 1);
    const to = camFor(k);
    if (r < T.move) {
      const p = eio(r / T.move);
      const dip = k === 0 ? 0 : 0.42 * Math.sin(Math.PI * p); // pull back mid-flight
      return { k, x: lerp(from.x, to.x, p), y: 300, z: lerp(from.z, to.z, p) * (1 - dip) };
    }
    return { k, ...to };
  }

  function render(t) {
    time = t;
    const cam = camera(t);
    const k = cam.k;
    const z = cam.z * view.fit;
    world.style.transform = `translate3d(${view.cx - cam.x * z}px, ${view.cy - cam.y * z}px, 0) scale(${z})`;
    if (zoomEl) zoomEl.textContent = `${Math.round(cam.z * 100)}%`;

    // ambient light drifts with the timeline (no extra animation loop)
    const sx = view.w / 1920;
    const sy = view.h / 1080;
    blobs.forEach((b, i) => {
      const [x, y, f, ph] = AMBIENT[i % AMBIENT.length];
      b.style.transform = `translate3d(${(x + Math.sin(t * f * 2 + ph) * 140) * sx}px, ${(y + Math.cos(t * f * 1.6 + ph) * 110) * sy}px, 0)`;
    });

    let tool = "move";
    let cur = null;
    boards.forEach((bd, i) => {
      const b = t - tArrive(i);
      const n = bd.steps.length;
      const slot = (T.build - T.fill) / n;
      bd.fill.style.transform = `scale(${eo(seg(b, 0, T.fill))})`;
      let selected = null;
      bd.steps.forEach((s, j) => {
        const a0 = T.fill + j * slot;
        const p = seg(b, a0, a0 + slot * 0.92);
        applyStep(s, p);
        if (i === k && b >= a0 && b < a0 + slot) {
          selected = s;
          tool = s.tool;
          const qq = eo(p);
          const [x, y, w, h] = s.box;
          if (s.mode === "iris") {
            const rr = eio(p) * 315;
            cur = [Math.min(590, 282 + rr), Math.min(590, 276 + rr)];
          } else if (s.total) cur = [x + Math.min(w, 40 + w * qq), y + Math.min(h, 60)];
          else cur = [x + w * qq, y + h * qq];
        }
      });
      if (selected) {
        const [x, y, w, h] = selected.box;
        bd.sel.style.cssText = `display:block;left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
        bd.selLabel.textContent = `${w} × ${h}`;
      } else bd.sel.style.display = "none";
      if (i === k && b >= 0 && b < T.fill) {
        tool = "frame";
        const p = eo(seg(b, 0, T.fill));
        cur = [600 * p, 600 * p];
      }
      const np = eo(seg(b, T.build + 0.15, T.build + 0.5));
      bd.note.style.opacity = String(np);
      bd.note.style.transform = `translateY(${(1 - np) * 10}px)`;
      if (i === k && b > T.build) tool = "comment";
    });

    if (tool !== lastTool) {
      tools.forEach((el) => el.classList.toggle("is-on", el.dataset.scTool === tool));
      lastTool = tool;
    }

    // design cursor (hidden on the intro and when idle off-screen)
    const showIdle = t >= tArrive(0) - 0.2;
    const pos = cur || (showIdle ? [-150, 470] : null);
    if (pos) {
      const sxp = view.cx + (k * GAP + pos[0] - cam.x) * z;
      const syp = view.cy + (pos[1] - cam.y) * z;
      cursor.style.opacity = "1";
      cursor.style.transform = `translate3d(${sxp}px, ${syp}px, 0)`;
    } else cursor.style.opacity = "0";

    if (panel) panel.style.opacity = k === 0 && t < tArrive(0) ? String(seg(t, T.intro, tArrive(0))) : "1";

    if (k !== lastIndex) {
      lastIndex = k;
      lastDone = -1;
      onIndex?.(k);
    }
    const included = Number(root.querySelectorAll(".sc-ab")[k]?.dataset.included || 4);
    const b = t - tArrive(k);
    // -1 before the camera arrives (nothing is being built yet)
    const done = b < 0 ? -1 : Math.floor(clamp((b - T.fill) / (T.build - T.fill)) * included);
    if (done !== lastDone) {
      lastDone = done;
      onProgress?.(done);
    }
  }

  return {
    layout,
    render,
    duration,
    get time() {
      return time;
    },
    destroy() {
      boards.length = 0;
    },
  };
}
