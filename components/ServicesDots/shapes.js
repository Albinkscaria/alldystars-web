/*
 * The five discipline illustrations, drawn once into an offscreen 900×700
 * canvas and then sampled into dots. Paint with `ink` for cream dots and
 * `accent` for red dots; anything transparent stays empty.
 *
 * To add or change a discipline, add a draw function here and reference its
 * id from the `shape` field of a service in ServicesDots.jsx.
 */

export const DESIGN_W = 900;
export const DESIGN_H = 700;

const TAU = Math.PI * 2;

// ctx.roundRect is missing in older Safari/Firefox — small fallback.
function roundRect(ctx, x, y, w, h, r) {
  if (ctx.roundRect) return ctx.roundRect(x, y, w, h, r);
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function dot(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

export const SHAPES = {
  /** Brand: a type specimen "Aa." with a red full stop and underline. */
  brand(ctx, { ink, accent, fontFamily }) {
    ctx.fillStyle = ink;
    ctx.font = `700 560px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("Aa", 410, 520);
    ctx.fillStyle = accent;
    dot(ctx, 770, 488, 40);
    ctx.fillRect(150, 585, 620, 14);
  },

  /** Website: browser window, hero block, red button, three cards. */
  web(ctx, { ink, accent }) {
    ctx.strokeStyle = ink;
    ctx.lineWidth = 14;
    ctx.beginPath();
    roundRect(ctx, 60, 70, 780, 560, 22);
    ctx.stroke();
    ctx.fillStyle = ink;
    ctx.fillRect(60, 130, 780, 10);
    [0, 1, 2].forEach((i) => {
      ctx.fillStyle = i === 0 ? accent : ink;
      dot(ctx, 100 + i * 34, 101, 11);
    });
    ctx.fillStyle = ink;
    ctx.fillRect(120, 190, 420, 150);
    ctx.fillRect(120, 370, 330, 14);
    ctx.fillRect(120, 400, 250, 14);
    ctx.fillStyle = accent;
    ctx.beginPath();
    roundRect(ctx, 600, 240, 180, 56, 28);
    ctx.fill();
    ctx.fillStyle = ink;
    [120, 350, 580].forEach((x) => ctx.fillRect(x, 450, 200, 140));
  },

  /** Graphic: a Swiss-style poster — red sun, bars, a tilted square, a title. */
  graphic(ctx, { ink, accent }) {
    ctx.fillStyle = accent;
    dot(ctx, 560, 250, 175);
    ctx.fillStyle = ink;
    ctx.fillRect(110, 60, 80, 560);
    ctx.save();
    ctx.translate(400, 400);
    ctx.rotate(0.62);
    ctx.fillRect(-28, -280, 56, 560);
    ctx.restore();
    ctx.save();
    ctx.translate(300, 140);
    ctx.rotate(0.3);
    ctx.fillRect(-50, -50, 100, 100);
    ctx.restore();
    ctx.fillRect(470, 510, 330, 34);
    ctx.fillRect(470, 566, 220, 14);
    ctx.fillRect(470, 592, 260, 14);
  },

  /** Data: bar chart with a red trend line. */
  data(ctx, { ink, accent }) {
    const heights = [150, 230, 190, 320, 410, 370];
    const top = (v) => 610 - v - 70;
    const cx = (i) => 169 + i * 118;
    ctx.fillStyle = ink;
    ctx.fillRect(80, 610, 760, 8);
    ctx.fillRect(80, 80, 8, 538);
    heights.forEach((v, i) => ctx.fillRect(130 + i * 118, 610 - v, 78, v));
    ctx.strokeStyle = accent;
    ctx.lineWidth = 12;
    ctx.lineJoin = "round";
    ctx.beginPath();
    heights.forEach((v, i) => (i ? ctx.lineTo(cx(i), top(v)) : ctx.moveTo(cx(i), top(v))));
    ctx.stroke();
    ctx.fillStyle = accent;
    heights.forEach((v, i) => dot(ctx, cx(i), top(v), 16));
  },

  /** Business: donut chart with one red slice pulled out, plus a legend. */
  business(ctx, { ink, accent }) {
    const cx = 360;
    const cy = 350;
    const outer = 250;
    const inner = 145;
    const a0 = -1.1; // the red slice runs from a1 to a0
    const a1 = a0 - 0.98;
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.arc(cx, cy, outer, a0, a1 + TAU);
    ctx.arc(cx, cy, inner, a1 + TAU, a0, true);
    ctx.fill();
    const mid = (a0 + a1) / 2;
    const ox = cx + Math.cos(mid) * 36;
    const oy = cy + Math.sin(mid) * 36;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(ox, oy, outer, a1, a0);
    ctx.arc(ox, oy, inner, a0, a1, true);
    ctx.fill();
    [0, 1, 2, 3].forEach((i) => {
      ctx.fillStyle = i === 3 ? accent : ink;
      ctx.fillRect(700, 230 + i * 90, 26, 26);
      ctx.fillStyle = ink;
      ctx.fillRect(745, 236 + i * 90, [120, 90, 120, 70][i], 14);
    });
  },
};
