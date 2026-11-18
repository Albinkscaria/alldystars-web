/**
 * The hidden artwork, drawn as greyscale brightness (white = full dot, black = no dot).
 * The dot grid samples this image; the cursor "prints" it.
 *
 * It fills the whole hero so the cursor prints colour wherever it goes:
 *  - a soft flowing field everywhere (low brightness → small coloured dots)
 *  - design motifs around the copy (bright → big dots): the alldystars star,
 *    a pen nib, "Aa", a pen curve with anchor points, a bar chart, a browser
 *    window, a donut chart, a ruler and sparkles
 *  - the middle, behind the headline, stays dim so the words stay readable
 * Phones get their own arrangement: motifs above and below the copy.
 *
 * Swap this function to hide anything else in the dots: your full logo,
 * a halftone portrait (ctx.drawImage of a greyscale photo), a project…
 *
 * @param {CanvasRenderingContext2D} x  context to draw on (already filled black)
 * @param {number} W  width in CSS px
 * @param {number} H  height in CSS px
 */
export function drawStudioArtwork(x, W, H) {
  const narrow = W < 760;
  const u = Math.min(W, H);

  field(x, W, H, narrow);

  if (narrow) {
    // top band (between the header and the eyebrow) and bottom band (under the buttons)
    star(x, W * 0.8, H * 0.2, Math.min(W * 0.17, H * 0.09), -0.18);
    letters(x, W * 0.2, H * 0.24, Math.min(W * 0.2, H * 0.11));
    penCurve(x, [W * 0.34, H * 0.15], [W * 0.66, H * 0.17], u * 0.1);
    sparkle(x, W * 0.5, H * 0.24, u * 0.035);
    nib(x, W * 0.17, H * 0.88, Math.min(W * 0.2, H * 0.1));
    bars(x, W * 0.62, H * 0.95, W * 0.32, H * 0.11);
    donut(x, W * 0.42, H * 0.87, Math.min(W * 0.08, H * 0.045));
    sparkle(x, W * 0.88, H * 0.8, u * 0.04);
    sparkle(x, W * 0.08, H * 0.74, u * 0.03);
    return;
  }

  // left side
  letters(x, W * 0.11, H * 0.33, Math.min(H * 0.17, W * 0.09));
  nib(x, W * 0.12, H * 0.62, Math.min(H * 0.24, W * 0.12));
  browser(x, W * 0.04, H * 0.78, W * 0.2, H * 0.17);
  // right side
  bars(x, W * 0.8, H * 0.38, W * 0.15, H * 0.2);
  star(x, W * 0.86, H * 0.6, Math.min(H * 0.17, W * 0.1), -0.18);
  donut(x, W * 0.86, H * 0.86, Math.min(H * 0.08, W * 0.05));
  // top: a pen path with its anchor points, under the header line
  penCurve(x, [W * 0.24, H * 0.17], [W * 0.76, H * 0.15], H * 0.07);
  // bottom: a ruler along the edge
  ruler(x, W * 0.3, H * 0.95, W * 0.4);
  // sparkles in the gaps
  [[0.3, 0.25], [0.7, 0.27], [0.27, 0.82], [0.73, 0.8], [0.04, 0.12], [0.96, 0.13], [0.5, 0.88]].forEach(([a, b], i) =>
    sparkle(x, W * a, H * b, u * (i % 2 ? 0.024 : 0.032))
  );
}

/* ---------- the soft field: flowing waves everywhere, dimmer behind the copy ---------- */
function field(x, W, H, narrow) {
  // diagonal waves of brightness
  x.save();
  x.lineCap = "round";
  const bands = narrow ? 9 : 11;
  for (let k = 0; k < bands; k++) {
    const y0 = (H / (bands - 1)) * k;
    x.beginPath();
    for (let i = 0; i <= 40; i++) {
      const px = (W / 40) * i;
      const py = y0 + Math.sin(i * 0.32 + k * 0.9) * H * 0.045 - (px / W) * H * 0.08;
      if (i) x.lineTo(px, py);
      else x.moveTo(px, py);
    }
    x.strokeStyle = `rgba(255,255,255,${k % 2 ? 0.13 : 0.19})`;
    x.lineWidth = H * (narrow ? 0.03 : 0.035);
    x.stroke();
  }
  // soft light from the corners
  [[0, 0], [W, 0], [0, H], [W, H]].forEach(([cx, cy]) => {
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.45);
    g.addColorStop(0, "rgba(255,255,255,0.14)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, W, H);
  });
  x.restore();

  // keep the middle (headline, paragraph, buttons) dim so the words read clearly
  x.save();
  const cx = W / 2;
  const cy = H * (narrow ? 0.52 : 0.5);
  const rx = W * (narrow ? 0.6 : 0.3);
  const ry = H * (narrow ? 0.26 : 0.3);
  x.translate(cx, cy);
  x.scale(rx / ry, 1);
  const g = x.createRadialGradient(0, 0, 0, 0, 0, ry);
  g.addColorStop(0, "rgba(0,0,0,0.75)");
  g.addColorStop(0.7, "rgba(0,0,0,0.55)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = g;
  x.beginPath();
  x.arc(0, 0, ry, 0, Math.PI * 2);
  x.fill();
  x.restore();
}

/* ---------- motifs ---------- */

/** the alldystars star, faceted like cut glass, lit from the top-left */
function star(x, sx, sy, R, rot) {
  x.save();
  x.translate(sx, sy);
  x.rotate(rot);
  x.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? R * 0.46 : R;
    if (i) x.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    else x.moveTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  x.closePath();
  const gr = x.createLinearGradient(-R, -R, R, R);
  gr.addColorStop(0, "#fff");
  gr.addColorStop(0.55, "#bdbdbd");
  gr.addColorStop(1, "#474747");
  x.fillStyle = gr;
  x.fill();
  x.strokeStyle = "rgba(0,0,0,.55)";
  x.lineWidth = R * 0.05;
  for (let i = 0; i < 10; i += 2) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    x.beginPath();
    x.moveTo(0, 0);
    x.lineTo(Math.cos(a) * R * 0.97, Math.sin(a) * R * 0.97);
    x.stroke();
  }
  x.restore();
}

/** a designer's pen nib */
function nib(x, nx, ny, S) {
  x.save();
  x.translate(nx, ny);
  x.rotate(-0.62);
  x.beginPath();
  x.moveTo(0, -S * 0.95);
  x.bezierCurveTo(S * 0.42, -S * 0.55, S * 0.48, -S * 0.05, S * 0.36, S * 0.3);
  x.lineTo(S * 0.3, S * 0.62);
  x.lineTo(-S * 0.3, S * 0.62);
  x.lineTo(-S * 0.36, S * 0.3);
  x.bezierCurveTo(-S * 0.48, -S * 0.05, -S * 0.42, -S * 0.55, 0, -S * 0.95);
  x.closePath();
  const gr = x.createLinearGradient(-S * 0.5, 0, S * 0.5, 0);
  gr.addColorStop(0, "#5a5a5a");
  gr.addColorStop(0.45, "#fff");
  gr.addColorStop(1, "#6e6e6e");
  x.fillStyle = gr;
  x.fill();
  x.fillStyle = "#000";
  x.beginPath();
  x.arc(0, -S * 0.12, S * 0.09, 0, Math.PI * 2); // breather hole
  x.fill();
  x.fillRect(-S * 0.012, -S * 0.95, S * 0.024, S * 0.84); // slit
  x.fillStyle = "#3a3a3a";
  x.fillRect(-S * 0.34, S * 0.62, S * 0.68, S * 0.16); // collar
  x.restore();
}

/** "Aa" — a type specimen */
function letters(x, cx, cy, size) {
  x.save();
  x.fillStyle = "#f2f2f2";
  x.font = `700 ${size}px Georgia, "Times New Roman", serif`;
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.fillText("Aa", cx, cy);
  x.fillStyle = "#9a9a9a";
  x.fillRect(cx - size * 0.62, cy + size * 0.48, size * 1.24, size * 0.06); // baseline rule
  x.restore();
}

/** a pen path with handles and square anchor points, like a vector tool */
function penCurve(x, [x0, y0], [x1, y1], bend) {
  x.save();
  const mx = (x0 + x1) / 2;
  const c1 = [x0 + (mx - x0) * 0.6, y0 - bend];
  const c2 = [x1 - (x1 - mx) * 0.6, y1 + bend];
  x.strokeStyle = "#e6e6e6";
  x.lineWidth = Math.max(6, bend * 0.22);
  x.lineCap = "round";
  x.beginPath();
  x.moveTo(x0, y0);
  x.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], x1, y1);
  x.stroke();
  // handles
  x.strokeStyle = "#8a8a8a";
  x.lineWidth = Math.max(3, bend * 0.08);
  [[x0, y0, c1], [x1, y1, c2]].forEach(([ax, ay, c]) => {
    x.beginPath();
    x.moveTo(ax, ay);
    x.lineTo(c[0], c[1]);
    x.stroke();
    x.fillStyle = "#cfcfcf";
    x.beginPath();
    x.arc(c[0], c[1], bend * 0.16, 0, Math.PI * 2);
    x.fill();
  });
  // anchor squares
  x.fillStyle = "#fff";
  const s = bend * 0.34;
  [[x0, y0], [x1, y1]].forEach(([ax, ay]) => x.fillRect(ax - s / 2, ay - s / 2, s, s));
  x.restore();
}

/** a rising bar chart with a trend line; (x0, base) is its bottom-left */
function bars(x, x0, base, w, h) {
  x.save();
  const heights = [0.35, 0.55, 0.45, 0.75, 1];
  const bw = (w / heights.length) * 0.66;
  heights.forEach((v, i) => {
    x.fillStyle = i === heights.length - 1 ? "#fff" : `rgb(${150 + i * 18},${150 + i * 18},${150 + i * 18})`;
    x.fillRect(x0 + (w / heights.length) * i, base - h * v, bw, h * v);
  });
  x.strokeStyle = "#fff";
  x.lineWidth = Math.max(4, w * 0.025);
  x.lineJoin = "round";
  x.beginPath();
  heights.forEach((v, i) => {
    const px = x0 + (w / heights.length) * i + bw / 2;
    const py = base - h * v - h * 0.12;
    if (i) x.lineTo(px, py);
    else x.moveTo(px, py);
  });
  x.stroke();
  x.restore();
}

/** a browser window with a hero block and three cards; (x0, y0) is its top-left */
function browser(x, x0, y0, w, h) {
  x.save();
  x.strokeStyle = "#e0e0e0";
  x.lineWidth = Math.max(4, w * 0.025);
  x.strokeRect(x0, y0, w, h);
  x.fillStyle = "#e0e0e0";
  x.fillRect(x0, y0, w, h * 0.14); // title bar
  x.fillStyle = "#bdbdbd";
  x.fillRect(x0 + w * 0.08, y0 + h * 0.24, w * 0.5, h * 0.28); // hero block
  x.fillStyle = "#fff";
  x.fillRect(x0 + w * 0.66, y0 + h * 0.32, w * 0.24, h * 0.12); // button
  x.fillStyle = "#9a9a9a";
  [0, 1, 2].forEach((i) => x.fillRect(x0 + w * (0.08 + i * 0.29), y0 + h * 0.62, w * 0.24, h * 0.28));
  x.restore();
}

/** a donut chart with one slice pulled out */
function donut(x, cx, cy, r) {
  x.save();
  x.lineWidth = r * 0.42;
  x.strokeStyle = "#a8a8a8";
  x.beginPath();
  x.arc(cx, cy, r, -0.2, Math.PI * 1.6);
  x.stroke();
  x.strokeStyle = "#fff";
  x.beginPath();
  x.arc(cx + r * 0.12, cy - r * 0.08, r, Math.PI * 1.62, Math.PI * 1.94);
  x.stroke();
  x.restore();
}

/** a ruler: a bar with tick marks */
function ruler(x, x0, y, w) {
  x.save();
  x.fillStyle = "#cfcfcf";
  x.fillRect(x0, y, w, Math.max(6, w * 0.012));
  x.fillStyle = "#e8e8e8";
  const n = 24;
  for (let i = 0; i <= n; i++) {
    const t = i % 4 === 0 ? 0.06 : 0.03;
    x.fillRect(x0 + (w / n) * i - 2, y - w * t, 4, w * t);
  }
  x.restore();
}

/** a four-point sparkle */
function sparkle(x, cx, cy, r) {
  x.save();
  x.fillStyle = "#f4f4f4";
  x.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const rr = i % 2 ? r * 0.28 : r;
    x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  x.closePath();
  x.fill();
  x.restore();
}
