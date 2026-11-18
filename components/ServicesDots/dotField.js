import { DESIGN_W, DESIGN_H } from "./shapes";

/*
 * DotField: a canvas of a few thousand dots that assemble into an
 * illustration, flow into the next one and part around the pointer.
 * Framework-free: ServicesDots.jsx creates one and calls its methods.
 *
 * How it works
 * - Each illustration is drawn once into an offscreen 900×700 canvas and
 *   sampled into target points (in "design" coordinates).
 * - Dot i always goes to point i of the current illustration. Points are
 *   sorted left→right, so morphs sweep across the stage as a wave.
 * - A morph is a timed tween per dot (start time + duration + curved path),
 *   so it can be interrupted at any moment and restarts from where each dot is.
 * - The pointer pushes dots away with a damped spring that brings them back.
 * - Everything is drawn in 3 batched paths per frame (dust, ink, accent).
 * - The loop only runs while the canvas is on screen and the tab is visible.
 */

const TAU = Math.PI * 2;
const INK = 0;
const ACCENT = 1;
const DUST = 2;

// cursor physics (per second², in CSS px)
const SPRING = 60;
const DAMPING = 11;
const PUSH = 3600;
const RADIUS = 130;

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

/** Draw a shape offscreen and turn its painted pixels into up to `max` points. */
function sampleShape(draw, { rng, max, step, fontFamily }) {
  const c = document.createElement("canvas");
  c.width = DESIGN_W;
  c.height = DESIGN_H;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  draw(ctx, { ink: "#ffffff", accent: "#ff0000", fontFamily });
  const data = ctx.getImageData(0, 0, DESIGN_W, DESIGN_H).data;

  const pts = [];
  for (let y = 0; y < DESIGN_H; y += step) {
    for (let x = 0; x < DESIGN_W; x += step) {
      const o = (y * DESIGN_W + x) * 4;
      if (data[o + 3] > 128) {
        pts.push({
          x: x + (rng() - 0.5) * step, // jitter so it never looks like a grid
          y: y + (rng() - 0.5) * step,
          c: data[o + 1] < 100 ? ACCENT : INK, // red pixels → accent dots
        });
      }
    }
  }
  // random subset (even density), then sort for the left→right sweep
  for (let i = pts.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pts[i], pts[j]] = [pts[j], pts[i]];
  }
  if (pts.length > max) pts.length = max;
  pts.sort((a, b) => a.x + a.y * 0.35 - (b.x + b.y * 0.35));

  const out = { n: pts.length, x: new Float32Array(pts.length), y: new Float32Array(pts.length), c: new Uint8Array(pts.length) };
  pts.forEach((p, i) => {
    out.x[i] = p.x;
    out.y[i] = p.y;
    out.c[i] = p.c;
  });
  return out;
}

export class DotField {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {object} options
   * @param {Function[]} options.shapes      draw functions (see shapes.js)
   * @param {number}  [options.count=2600]   number of dots
   * @param {string}  [options.fontFamily]   CSS font-family for text in shapes
   * @param {{ink:string, accent:string, dust:string}} [options.colors]
   * @param {boolean} [options.reducedMotion=false]
   * @param {number}  [options.fill=0.92]    how much of the stage the art fills
   */
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.o = {
      count: 2600,
      fontFamily: "Georgia, serif",
      colors: { ink: "#f3efe6", accent: "#e5483d", dust: "rgba(243,239,230,0.1)" },
      reducedMotion: false,
      fill: 0.92,
      morph: 0.68, // seconds each dot spends travelling
      stagger: 0.42, // seconds between the first and last dot leaving
      seed: 7,
      ...options,
    };
    this.rng = mulberry32(this.o.seed);
    this.reduced = this.o.reducedMotion;
    this.ready = false;
    this.destroyed = false;
    this.assembled = false;
    this.shapeIndex = 0;
    this.pending = null; // work requested before init() finished
    this.pointer = { x: 0, y: 0, active: false };
    this.visible = false;
    this.pageVisible = typeof document === "undefined" ? true : !document.hidden;
    this.raf = 0;
    this.last = 0;
    this._frame = this._frame.bind(this);
    this._onVisibility = this._onVisibility.bind(this);
  }

  /** Waits for fonts, samples the shapes, and starts observing. */
  async init() {
    const { fontFamily, count, shapes } = this.o;
    try {
      if (document.fonts?.load) await document.fonts.load(`700 100px ${fontFamily}`);
    } catch {
      /* font failed: the canvas falls back to the next family in the list */
    }
    if (this.destroyed) return;

    const max = Math.floor(count * 0.9); // ~10% always stay as floating dust
    const step = count > 2000 ? 3 : 4;
    this.targets = shapes.map((draw) => sampleShape(draw, { rng: this.rng, max, step, fontFamily }));

    const n = count;
    const F = (len) => new Float32Array(len);
    Object.assign(this, {
      n,
      fx: F(n), fy: F(n), tx: F(n), ty: F(n), // tween from / to (design coords)
      t0: new Float64Array(n), dur: F(n), bend: F(n),
      cf: new Uint8Array(n), ct: new Uint8Array(n), // colour from / to
      offX: F(n), offY: F(n), vx: F(n), vy: F(n), // pointer spring
      r: F(n), ph: F(n), sp: F(n), // radius, breathing phase & speed
      dx: F(n), dy: F(n), // dust home positions
    });
    for (let i = 0; i < n; i++) {
      this.dx[i] = -150 + this.rng() * (DESIGN_W + 300);
      this.dy[i] = -100 + this.rng() * (DESIGN_H + 200);
      this.fx[i] = this.tx[i] = this.dx[i];
      this.fy[i] = this.ty[i] = this.dy[i];
      this.cf[i] = this.ct[i] = DUST;
      this.t0[i] = -1e9;
      this.dur[i] = 1;
      this.r[i] = 1.5 + this.rng() * 1.3;
      this.ph[i] = this.rng() * TAU;
      this.sp[i] = 0.6 + this.rng() * 0.8;
    }

    this.ready = true;
    this.resize();

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(this.canvas);
    this.io = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      this._update();
    });
    this.io.observe(this.canvas);
    document.addEventListener("visibilitychange", this._onVisibility);

    const p = this.pending;
    this.pending = null;
    if (p?.assemble) this.assemble();
    else if (p?.shape != null) this.setShape(p.shape, p.opts);
    this._update();
  }

  /** First reveal: dust flies together into the current shape. Runs once. */
  assemble() {
    if (!this.ready) return void (this.pending = { ...this.pending, assemble: true });
    if (this.assembled) return;
    this.setShape(this.shapeIndex, { duration: 1.0, stagger: 0.6 });
  }

  /** Morph to shape `index`. `instant` skips the animation. */
  setShape(index, { instant = false, duration = this.o.morph, stagger = this.o.stagger } = {}) {
    this.shapeIndex = index;
    if (!this.ready) return void (this.pending = { ...this.pending, shape: index, opts: { instant } });
    this.assembled = true;
    const now = performance.now();
    const skip = instant || this.reduced;
    const T = this.targets[index];
    const pos = { x: 0, y: 0, k: 0 };

    for (let i = 0; i < this.n; i++) {
      this._base(i, now, pos); // start from wherever the dot is right now
      this.cf[i] = pos.k < 0.5 ? this.cf[i] : this.ct[i];
      this.fx[i] = pos.x;
      this.fy[i] = pos.y;
      if (i < T.n) {
        this.tx[i] = T.x[i];
        this.ty[i] = T.y[i];
        this.ct[i] = T.c[i];
      } else {
        this.tx[i] = this.dx[i];
        this.ty[i] = this.dy[i];
        this.ct[i] = DUST;
      }
      const delay = this.ct[i] === DUST ? this.rng() * stagger : clamp(this.tx[i] / DESIGN_W, 0, 1) * stagger;
      this.dur[i] = duration * 1000;
      this.t0[i] = skip ? -1e9 : now + delay * 1000;
      this.bend[i] = (this.rng() - 0.5) * 140;
    }
    this._update(true);
  }

  /** Pointer position in viewport coordinates (clientX / clientY). */
  setPointer(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = clientX - rect.left;
    this.pointer.y = clientY - rect.top;
    this.pointer.active = true;
  }

  clearPointer() {
    this.pointer.active = false;
  }

  /**
   * Listens for mouse, pen and touch on `el`.
   * Touch: a press or a slow drag pushes the dots; vertical swipes still scroll.
   * @returns {() => void} cleanup
   */
  attachPointer(el) {
    let touchTimer = 0;
    const move = (e) => {
      if (this.reduced) return;
      if (e.pointerType === "touch" && e.buttons === 0 && e.type === "pointermove") return;
      clearTimeout(touchTimer);
      this.setPointer(e.clientX, e.clientY);
    };
    const leave = (e) => {
      if (e.pointerType === "touch") touchTimer = setTimeout(() => this.clearPointer(), 250);
      else this.clearPointer();
    };
    el.addEventListener("pointerdown", move);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", leave);
    el.addEventListener("pointercancel", leave);
    el.addEventListener("pointerleave", leave);
    return () => {
      clearTimeout(touchTimer);
      el.removeEventListener("pointerdown", move);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", leave);
      el.removeEventListener("pointercancel", leave);
      el.removeEventListener("pointerleave", leave);
    };
  }

  /** Reduced motion: finish every morph, stop breathing and pointer play. */
  setReducedMotion(reduced) {
    this.reduced = reduced;
    if (reduced && this.ready) {
      for (let i = 0; i < this.n; i++) {
        this.t0[i] = -1e9;
        this.offX[i] = this.offY[i] = this.vx[i] = this.vy[i] = 0;
      }
      this.clearPointer();
    }
    this._update(true);
  }

  /** Match the canvas to its CSS size (and device pixel ratio). */
  resize() {
    if (!this.ready) return;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.w = w;
    this.h = h;
    this.dpr = dpr;
    this.scale = Math.min(w / DESIGN_W, h / DESIGN_H) * this.o.fill;
    this.ox = (w - DESIGN_W * this.scale) / 2;
    this.oy = (h - DESIGN_H * this.scale) / 2;
    this.rs = clamp(this.scale, 0.55, 1.3); // dot size follows stage size
    this._update(true);
  }

  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.ro?.disconnect();
    this.io?.disconnect();
    document.removeEventListener("visibilitychange", this._onVisibility);
  }

  // ───────────────────────── internals ─────────────────────────

  _onVisibility() {
    this.pageVisible = !document.hidden;
    this._update();
  }

  /** Start/stop the loop. Reduced motion draws only when something changes. */
  _update(redraw = false) {
    if (!this.ready || this.destroyed) return;
    const shouldRun = this.visible && this.pageVisible && !this.reduced;
    if (shouldRun && !this.raf) {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this._frame);
    } else if (!shouldRun && this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
    if (!shouldRun && redraw) requestAnimationFrame(() => this._draw(performance.now(), 0));
  }

  /** Tween position of dot i at time `now`, in design coordinates. */
  _base(i, now, out) {
    let e = (now - this.t0[i]) / this.dur[i];
    e = e < 0 ? 0 : e > 1 ? 1 : e;
    const k = easeInOutCubic(e);
    const fx = this.fx[i];
    const fy = this.fy[i];
    const ddx = this.tx[i] - fx;
    const ddy = this.ty[i] - fy;
    out.x = fx + ddx * k;
    out.y = fy + ddy * k;
    if (k > 0 && k < 1) {
      // curved flight: push sideways, most in the middle of the trip
      const len = Math.hypot(ddx, ddy) || 1;
      const b = Math.sin(Math.PI * k) * this.bend[i];
      out.x += (-ddy / len) * b;
      out.y += (ddx / len) * b;
    }
    out.k = k;
    return out;
  }

  _frame(now) {
    this.raf = 0;
    if (this.destroyed) return;
    const dt = Math.min((now - this.last) / 1000, 1 / 30); // clamp after tab switches
    this.last = now;
    this._draw(now, dt);
    if (this.visible && this.pageVisible && !this.reduced) this.raf = requestAnimationFrame(this._frame);
  }

  _draw(now, dt) {
    if (!this.w) return;
    const { ctx, scale, ox, oy, rs, pointer, reduced } = this;
    const time = now / 1000;
    const R = RADIUS * rs;
    const R2 = R * R;
    const push = PUSH * rs;
    const breathe = reduced ? 0 : 1.6 * rs;
    const physics = !reduced && dt > 0;

    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);
    const paths = [new Path2D(), new Path2D(), new Path2D()];
    const pos = { x: 0, y: 0, k: 0 };

    for (let i = 0; i < this.n; i++) {
      this._base(i, now, pos);
      let x = ox + pos.x * scale;
      let y = oy + pos.y * scale;
      if (breathe) {
        x += Math.sin(time * this.sp[i] + this.ph[i]) * breathe;
        y += Math.cos(time * this.sp[i] * 1.3 + this.ph[i]) * breathe;
      }

      if (physics) {
        let ax = -SPRING * this.offX[i] - DAMPING * this.vx[i];
        let ay = -SPRING * this.offY[i] - DAMPING * this.vy[i];
        if (pointer.active) {
          const qx = x + this.offX[i] - pointer.x;
          const qy = y + this.offY[i] - pointer.y;
          const d2 = qx * qx + qy * qy;
          if (d2 < R2) {
            const d = Math.sqrt(d2) || 1;
            const f = (1 - d / R) ** 2 * push;
            ax += (qx / d) * f;
            ay += (qy / d) * f;
          }
        }
        this.vx[i] += ax * dt;
        this.vy[i] += ay * dt;
        this.offX[i] += this.vx[i] * dt;
        this.offY[i] += this.vy[i] * dt;
      }
      x += this.offX[i];
      y += this.offY[i];

      const c = pos.k < 0.5 ? this.cf[i] : this.ct[i];
      const r = this.r[i] * rs + (c === ACCENT ? 0.5 * rs : 0);
      const p = paths[c];
      p.moveTo(x + r, y);
      p.arc(x, y, r, 0, TAU);
    }

    const { ink, accent, dust } = this.o.colors;
    ctx.fillStyle = dust;
    ctx.fill(paths[DUST]);
    ctx.fillStyle = ink;
    ctx.fill(paths[INK]);
    ctx.fillStyle = accent;
    ctx.fill(paths[ACCENT]);
  }
}
