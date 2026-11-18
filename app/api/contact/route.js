/**
 * POST /api/contact — receives a letter from the contact page and emails it.
 *
 * Email goes out through Resend's HTTP API (no SDK needed). Set these in .env.local
 * locally, and in Netlify under Site configuration → Environment variables:
 *   RESEND_API_KEY=re_...
 *   CONTACT_TO=hello@yourdomain.com          (where letters arrive; comma-separate for several)
 *   CONTACT_FROM="AlldyStars <letters@yourdomain.com>"   (a sender on a domain verified in Resend)
 *
 * Without RESEND_API_KEY the letter is logged to the server console in development,
 * and the route answers 503 in production so a misconfiguration is never silent.
 */

export const runtime = "nodejs";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LIMITS = { name: 120, company: 160, email: 200, idea: 6000, postscript: 4000 };
// keep in sync with SERVICES in components/ContactLetter/ContactLetter.jsx
const ALLOWED_SERVICES = new Set(["Brand identity", "Website design", "Graphic design", "Data analytics", "Business analytics"]);

// Best-effort rate limit (per server instance): 5 letters per IP per 10 minutes.
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 5;
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const json = (body, status = 200) => Response.json(body, { status });

export async function POST(request) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: "Invalid form data." }, 400);
  }

  // Honeypot: real people never fill this in. Pretend it worked.
  if (String(form.get("website") || "").trim()) return json({ ok: true });

  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
  if (limited(ip)) return json({ ok: false, error: "Too many letters — please try again in a few minutes." }, 429);

  const field = (k) => String(form.get(k) || "").trim().slice(0, LIMITS[k]);
  const letter = {
    name: field("name"),
    company: field("company"),
    email: field("email"),
    idea: field("idea"),
    postscript: field("postscript"),
    services: form.getAll("services").map(String).filter((s) => ALLOWED_SERVICES.has(s)),
  };
  if (!letter.name || !letter.idea || !EMAIL_RE.test(letter.email)) {
    return json({ ok: false, error: "Name, idea and a valid email are required." }, 422);
  }

  let attachment = null;
  const file = form.get("attachment");
  if (file && typeof file === "object" && file.size > 0) {
    if (file.size > MAX_FILE_BYTES) return json({ ok: false, error: "The attachment is over 8 MB." }, 413);
    const buf = Buffer.from(await file.arrayBuffer());
    attachment = { filename: String(file.name || "brief").slice(0, 120), content: buf.toString("base64") };
  }

  const subject = `New letter from ${letter.name}${letter.company ? ` (${letter.company})` : ""}`;
  const text = [
    `Hi AlldyStars,`,
    ``,
    `I’m ${letter.name}${letter.company ? ` from ${letter.company}` : ""}.`,
    letter.services.length ? `I’d love your help with: ${letter.services.join(", ")}.` : "",
    ``,
    `Here’s the idea:`,
    letter.idea,
    ``,
    `You can write back to me at ${letter.email}.`,
    ``,
    `Warmly,`,
    letter.name,
    letter.postscript ? `\nP.S. ${letter.postscript}` : "",
  ]
    .filter((l) => l !== null)
    .join("\n");
  const html = `<div style="font-family:Georgia,serif;font-size:16px;line-height:1.6;color:#0A0A0A">
<p>Hi AlldyStars,</p>
<p>I’m <b>${esc(letter.name)}</b>${letter.company ? ` from <b>${esc(letter.company)}</b>` : ""}.</p>
${letter.services.length ? `<p>I’d love your help with: <b>${letter.services.map(esc).join(", ")}</b>.</p>` : ""}
<p>Here’s the idea:</p><p style="white-space:pre-wrap">${esc(letter.idea)}</p>
<p>You can write back to me at <a href="mailto:${esc(letter.email)}">${esc(letter.email)}</a>.</p>
<p>Warmly,<br>${esc(letter.name)}</p>
${letter.postscript ? `<p style="white-space:pre-wrap"><b style="color:#FF4433">P.S.</b> ${esc(letter.postscript)}</p>` : ""}
</div>`;

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[contact] RESEND_API_KEY not set — letter not emailed:\n" + text + (attachment ? `\n[attachment: ${attachment.filename}]` : ""));
      return json({ ok: true, dev: true });
    }
    console.error("[contact] RESEND_API_KEY is not set");
    return json({ ok: false, error: "Contact form is not configured." }, 503);
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || "AlldyStars <onboarding@resend.dev>",
        to: (process.env.CONTACT_TO || "").split(",").map((s) => s.trim()).filter(Boolean),
        reply_to: letter.email,
        subject,
        text,
        html,
        attachments: attachment ? [attachment] : undefined,
      }),
    });
    if (!res.ok) {
      console.error("[contact] Resend error", res.status, await res.text().catch(() => ""));
      return json({ ok: false, error: "Could not send right now." }, 502);
    }
    return json({ ok: true });
  } catch (err) {
    console.error("[contact] send failed", err);
    return json({ ok: false, error: "Could not send right now." }, 502);
  }
}
