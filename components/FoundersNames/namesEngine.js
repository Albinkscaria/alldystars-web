/**
 * Layout + rendering for the "names as windows" founders section.
 *
 * Scroll position `p` runs from 0 (all names) to N (last founder open):
 *   p = 0 → names;  p = 1 → founder 1 open;  p = 2 → founder 2 open; …
 * Between two founders the open portrait folds back into its letter first,
 * then the next letter opens.
 *
 * render(p, intro) is a pure function of its inputs, so scrubbing backwards,
 * reloading mid-section and resizing all land on exactly the same frame.
 */

const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, k) => a + (b - a) * k;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const setAttrs = (el, attrs) => {
  for (const k in attrs) el.setAttribute(k, attrs[k]);
};

/** How open founder i is (0..1) at scroll position p. */
export function openness(i, p, count) {
  const open = i === 0 ? clamp(p) : clamp((p - i - 0.5) / 0.5);
  const close = i === count - 1 ? 0 : clamp((p - (i + 1)) / 0.5);
  return open * (1 - close);
}

/**
 * Measures a glyph's left stem and cap height by drawing it on a canvas.
 * Returns pixel values for the given font and size.
 */
function measureStem(font, ch, size) {
  const w = Math.ceil(size * 1.5);
  const h = Math.ceil(size * 1.4);
  const ox = Math.round(size * 0.2);
  const base = Math.round(size * 1.2);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.font = `${size}px ${font}`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(ch, ox, base);
  const data = ctx.getImageData(0, 0, w, h).data;
  const ink = (x, y) => data[(y * w + x) * 4 + 3] > 128;

  let top = -1;
  for (let y = 0; y < base && top < 0; y++) {
    for (let x = 0; x < w; x++) {
      if (ink(x, y)) {
        top = y;
        break;
      }
    }
  }
  if (top < 0) return { x0: 0, w: size * 0.18, cap: size * 0.72 };

  // Scan a row a little below the middle of the letter: the first ink run is the stem.
  const row = Math.round(lerp(top, base, 0.45));
  let x0 = -1;
  let x1 = -1;
  for (let x = 0; x < w; x++) {
    if (ink(x, row)) {
      if (x0 < 0) x0 = x;
      x1 = x;
    } else if (x0 >= 0) break;
  }
  return { x0: x0 - ox, w: x1 - x0 + 1, cap: base - top };
}

export function createNamesEngine({ root, founders }) {
  const count = founders.length;
  const q = (sel) => root.querySelector(sel);
  const svg = q(".fn-svg");
  const head = q(".fn-head");
  const foot = q(".fn-foot");
  const fades = [...root.querySelectorAll("[data-fn-fade]")];
  const parts = founders.map((_, i) => {
    const chapter = q(`[data-fn-chapter="${i}"]`);
    return {
      mask: q(`[data-fn-mask="${i}"]`),
      maskBg: q(`[data-fn-maskbg="${i}"]`),
      group: q(`[data-fn-group="${i}"]`),
      word: q(`[data-fn-word="${i}"]`),
      stem: q(`[data-fn-stem="${i}"]`),
      layer: q(`[data-fn-layer="${i}"]`),
      base: q(`[data-fn-base="${i}"]`),
      image: q(`[data-fn-image="${i}"]`),
      meta: q(`[data-fn-meta="${i}"]`),
      cap: q(`[data-fn-cap="${i}"]`),
      chapter,
      lines: chapter ? [...chapter.querySelectorAll(".fn-li")] : [],
    };
  });

  let L = null; // current layout
  let onTop = -1;

  function placeChapter(part, x, width, availTop, availBottom, centreOn) {
    const ch = part.chapter;
    ch.style.left = `${x}px`;
    ch.style.width = `${width}px`;
    ch.classList.remove("is-tight", "is-tighter", "is-tightest");
    const avail = availBottom - availTop;
    for (const cls of ["is-tight", "is-tighter", "is-tightest"]) {
      if (ch.offsetHeight <= avail) break;
      ch.classList.add(cls);
    }
    const hgt = ch.offsetHeight;
    const top = centreOn ? centreOn.y + (centreOn.h - hgt) / 2 : availTop;
    ch.style.top = `${Math.round(clamp(top, availTop, Math.max(availTop, availBottom - hgt)))}px`;
  }

  function layout() {
    const W = root.clientWidth;
    const H = root.clientHeight;
    if (!W || !H) return;
    // phones, and portrait tablets (768×1024 ≈ 0.83): portrait on top, story below
    const mobile = W < 768 || W / H < 0.9;
    root.classList.toggle("is-stacked", mobile);

    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const pad = Math.round(clamp(W * 0.044, 20, 64));
    const headBottom = head.offsetTop + head.offsetHeight;
    const footTop = foot.offsetTop;
    const font = getComputedStyle(parts[0].word).fontFamily;

    // 1. Size the names: as big as the free band and the width allow.
    const probe = 200;
    const ratios = founders.map((f, i) => {
      const w = parts[i].word;
      w.setAttribute("font-size", probe);
      w.setAttribute("x", 0);
      w.setAttribute("y", probe);
      return w.getComputedTextLength() / probe;
    });
    const capRatio = measureStem(font, founders[0].word[founders[0].stem], probe).cap / probe;
    const gap = Math.round(clamp(H * 0.03, 12, 32));
    const bandTop = headBottom + (mobile ? 22 : 18);
    const bandBottom = footTop - (mobile ? 22 : 18);
    const bandH = bandBottom - bandTop;
    const maxW = mobile ? W - pad * 2 : (W - pad * 2) * 0.64;
    const fs = Math.max(
      24,
      Math.min((bandH - gap * (count - 1)) / (count * capRatio), maxW / Math.max(...ratios), 560)
    );
    const capH = fs * capRatio;
    const blockH = capH * count + gap * (count - 1);
    const top = bandTop + Math.max(0, (bandH - blockH) / (mobile ? 2 : 2.4));

    // 2. Place the names (alternating left / right) and find each opening stem.
    const words = founders.map((f, i) => {
      const el = parts[i].word;
      const width = ratios[i] * fs;
      const x = i % 2 === 0 ? pad : W - pad - width;
      const baseline = top + capH * (i + 1) + gap * i;
      setAttrs(el, { "font-size": fs, x, y: baseline });
      const ink = measureStem(font, f.word[f.stem], fs);
      const sx = el.getStartPositionOfChar(f.stem).x + ink.x0;
      return {
        box: { x, y: baseline - capH, w: width, h: capH },
        stem: { x: sx, y: baseline - capH, w: ink.w, h: capH },
      };
    });

    // 3. The open portrait frame: sized so the image is never shown much larger than it is.
    const stackedFrame = (aspect, share) => {
      const fh = Math.min(H * share, (W - pad * 2) / aspect, 640);
      const fw = fh * aspect;
      return { x: (W - fw) / 2, y: Math.max(16, pad * 0.8), w: fw, h: fh };
    };
    const frames = founders.map((f, i) => {
      const aspect = f.image.aspect;
      if (mobile) return stackedFrame(aspect, 0.44);
      const fh = Math.min(H * 0.78, footTop - 72, 760, (W * 0.5 - pad) / aspect);
      const fw = fh * aspect;
      // Story column + gap + portrait form one group, centred in the stage, so
      // on wide screens they stay together instead of drifting to opposite edges.
      const textW = Math.min(560, W * 0.5 - pad - 40);
      const gutter = Math.max(24, Math.min(clamp(W * 0.06, 48, 120), W - pad * 2 - textW - fw));
      const left = Math.max(pad, (W - (textW + gutter + fw)) / 2);
      const photoRight = i % 2 === 0;
      const x = photoRight ? left + textW + gutter : left;
      const textX = photoRight ? left : left + fw + gutter;
      return { x, y: Math.max(16, (footTop - 30 - fh) / 2), w: fw, h: fh, textX, textW };
    });

    // 4. Furniture around the names and the open spreads.
    founders.forEach((f, i) => {
      const p = parts[i];
      const { box } = words[i];
      const fr = frames[i];
      if (p.meta) {
        const left = i % 2 === 0;
        const mx = left ? box.x + box.w + 48 : pad;
        const room = left ? W - pad - mx : box.x - 48 - pad;
        const show = !mobile && room >= 230;
        p.meta.hidden = !show;
        if (show) {
          p.meta.style.left = `${mx}px`;
          p.meta.style.top = `${box.y + 6}px`;
          p.meta.style.width = `${Math.min(room, 300)}px`;
        }
      }
      if (p.cap) {
        p.cap.style.left = `${fr.x}px`;
        p.cap.style.top = `${fr.y + fr.h + 12}px`;
        p.cap.style.width = `${fr.w}px`;
      }
      if (p.chapter) {
        if (mobile) {
          // Stacked: if the full story doesn't fit under the portrait, shrink the
          // portrait step by step (down to ~30% of the stage) before placeChapter
          // starts dropping lines (skills, then bio, then quote).
          for (const share of [0.44, 0.4, 0.36, 0.33, 0.3]) {
            frames[i] = stackedFrame(f.image.aspect, share);
            const f2 = frames[i];
            placeChapter(p, pad, W - pad * 2, f2.y + f2.h + 44, footTop - 16, null);
            if (!p.chapter.classList.contains("is-tight")) break;
          }
          const f2 = frames[i];
          if (p.cap) {
            // a narrow phone portrait is too thin for "NAME · 01 · TAG" on one line:
            // give the caption at least 300px (screen allowing), centred under the photo
            const cw = Math.max(f2.w, Math.min(W - pad * 2, 300));
            p.cap.style.left = `${f2.x + (f2.w - cw) / 2}px`;
            p.cap.style.top = `${f2.y + f2.h + 12}px`;
            p.cap.style.width = `${cw}px`;
          }
        } else {
          placeChapter(p, fr.textX, fr.textW, 24, footTop - 16, fr);
        }
      }
      setAttrs(p.mask, { x: 0, y: 0, width: W, height: H });
      setAttrs(p.maskBg, { x: 0, y: 0, width: W, height: H });
    });

    L = { W, H, words, frames };
    root.classList.add("is-ready");
  }

  /* Founder i at openness k: the stem stretches into the frame, the rest of the name dissolves. */
  function morph(i, k, nameOpacity) {
    const f = founders[i];
    const p = parts[i];
    const { box, stem } = L.words[i];
    const fr = L.frames[i];
    const e = easeInOut(clamp(k));

    setAttrs(p.stem, {
      x: lerp(stem.x, fr.x, e),
      y: lerp(stem.y, fr.y, e),
      width: lerp(stem.w, fr.w, e),
      height: lerp(stem.h, fr.h, e),
    });
    p.stem.style.opacity = k > 0.002 ? 1 : nameOpacity;

    const cx = stem.x + stem.w / 2;
    const cy = stem.y + stem.h / 2;
    const s = 1 + 0.18 * easeOut(clamp(k * 1.6));
    p.group.setAttribute("transform", `translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`);
    p.group.style.opacity = nameOpacity;

    // Photo: fills the word (face across the letters) → fills the frame.
    const ih = box.w / f.image.aspect;
    const from = { x: box.x, y: box.y + box.h * 0.5 - ih * f.image.focusY, w: box.w, h: ih };
    const img = {
      x: lerp(from.x, fr.x, e),
      y: lerp(from.y, fr.y, e),
      width: lerp(from.w, fr.w, e),
      height: lerp(from.h, fr.h, e),
    };
    setAttrs(p.image, img);
    setAttrs(p.base, img);
  }

  function reveal(part, v) {
    // staggered line reveal for the open spread
    const n = part.lines.length;
    part.lines.forEach((el, j) => {
      const t = easeOut(clamp(v * 1.7 - (j / Math.max(1, n - 1)) * 0.7));
      el.style.transform = t >= 1 ? "" : `translate3d(0, ${(1 - t) * 105}%, 0)`;
      el.style.opacity = t;
    });
    part.chapter.style.visibility = v > 0 ? "visible" : "hidden";
  }

  const fadeTo = (el, v, dy = 0) => {
    el.style.opacity = v;
    el.style.transform = dy ? `translate3d(0, ${dy}px, 0)` : "";
    el.style.visibility = v > 0.001 ? "visible" : "hidden";
  };

  /**
   * @param {number} p      0..N scroll position (see top of file)
   * @param {number} intro  0..1 entrance (names rise into place)
   * @returns {number}      index of the open founder (0-based), or -1 for the names view
   */
  function render(p, intro = 1) {
    if (!L) return -1;
    const rise = easeOut(clamp(intro));
    const ks = founders.map((_, i) => openness(i, p, count));

    let top = -1;
    let topK = 0;
    ks.forEach((k, i) => {
      // a name dissolves when it opens, and steps back while another one is open
      const own = 1 - easeOut(clamp((k - 0.1) / 0.75));
      const other = Math.max(0, ...ks.filter((_, j) => j !== i));
      const away = 1 - easeOut(clamp((other - 0.05) / 0.6));
      morph(i, k, Math.min(own, away));
      const enter = easeOut(clamp(intro * 1.3 - i * 0.3));
      parts[i].layer.style.opacity = enter;
      if (k > topK) {
        topK = k;
        top = i;
      }
      if (parts[i].chapter) reveal(parts[i], clamp((k - 0.55) / 0.45));
      if (parts[i].cap) fadeTo(parts[i].cap, clamp((k - 0.8) / 0.2));
      if (parts[i].meta && !parts[i].meta.hidden) {
        fadeTo(parts[i].meta, (1 - clamp(p * 3)) * easeOut(clamp(intro * 1.4 - 0.3 - i * 0.2)));
      }
    });

    // the opening founder is drawn above the others
    if (top >= 0 && top !== onTop) {
      svg.appendChild(parts[top].layer);
      onTop = top;
    }
    svg.style.transform = rise < 1 ? `translate3d(0, ${(1 - rise) * 40}px, 0)` : "";

    const furniture = (1 - clamp(p * 3)) * rise;
    fades.forEach((el) => fadeTo(el, furniture, (1 - rise) * 14));

    const nearest = Math.round(clamp(p, 0, count));
    return nearest - 1;
  }

  function destroy() {
    root.classList.remove("is-ready", "is-stacked");
  }

  return { layout, render, destroy };
}
