"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import Blank from "./Blank";
import { createLetterMotion } from "./letterMotion";
import "./contact-letter.css";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// keep in sync with ALLOWED_SERVICES in app/api/contact/route.js
export const SERVICES = ["Brand identity", "Website design", "Graphic design", "Data analytics", "Business analytics"];
// /contact?service=<slug> (the Services page's "Start a … project" links) ticks that service
const SERVICE_SLUGS = {
  "brand-identity": "Brand identity",
  "website-design": "Website design",
  "graphic-design": "Graphic design",
  "data-analytics": "Data analytics",
  "business-analytics": "Business analytics",
};
export const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ACCEPT = ".pdf,.doc,.docx,.ppt,.pptx,.key,.txt,.md,.png,.jpg,.jpeg,.webp,.zip";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const NOTES = {
  name: "← how should we address you?",
  email: "← we’ll need this to write back",
  emailBad: "← that doesn’t look like an email",
  idea: "a line or two is plenty — what are you making?",
  file: "← that file is over 8 MB",
  send: "It didn’t go through — please try again.",
};
const EMPTY = { name: "", company: "", email: "", idea: "", ps: "" };

const Star = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 2l2.6 6.6L21 9.3l-5 4.4 1.6 6.8L12 17l-5.6 3.5L8 13.7 3 9.3l6.4-.7z" />
  </svg>
);
const Clip = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M20.5 11.5 12.4 19.6a5 5 0 0 1-7.1-7.1l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4l7.8-7.8" />
  </svg>
);
const formatSize = (b) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

async function defaultSend(endpoint, formData) {
  const res = await fetch(endpoint, { method: "POST", body: formData });
  if (!res.ok) return false;
  const data = await res.json().catch(() => ({}));
  return data.ok !== false;
}

/**
 * Contact page: "Write us a letter".
 *
 * @param {object}   props
 * @param {string}   [props.endpoint]   POST target (multipart form data), default /api/contact
 * @param {Function} [props.onSubmit]   optional (formData) => Promise<boolean>; replaces the default fetch
 * @param {string[]} [props.services]   the "help with" options
 * @param {string}   [props.recipient]  who the letter is addressed to
 * @param {string}   [props.email]      plain email shown under the steps, for people who'd rather not use the form
 * @param {string}   [props.className]  extra classes on the section (e.g. next/font variables)
 */
export default function ContactLetter({
  endpoint = "/api/contact",
  onSubmit,
  services = SERVICES,
  recipient = "The AlldyStars desk",
  email,
  className = "",
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const f = (name) => `${uid}-${name}`;

  const [values, setValues] = useState(EMPTY);
  const [picked, setPicked] = useState([]);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [phase, setPhase] = useState("write"); // write | sending | done
  const [signed, setSigned] = useState(""); // the name as signed (updates when the name field is left)
  const [today, setToday] = useState({ long: "", mark: "" });
  const [sent, setSent] = useState(null);
  const [status, setStatus] = useState("");

  const refs = {
    desk: useRef(null),
    letter: useRef(null),
    content: useRef(null),
    envelope: useRef(null),
    flap: useRef(null),
    seal: useRef(null),
    postmark: useRef(null),
    stamp: useRef(null),
    slot: useRef(null),
    done: useRef(null),
    next: useRef(null),
    nextFlap: useRef(null),
    nextSheet: useRef(null),
    nextSeal: useRef(null),
  };
  const fields = { name: useRef(null), email: useRef(null), idea: useRef(null) };
  const dropRef = useRef(null);
  const fileRef = useRef(null);
  const motion = useRef(null);
  const latest = useRef({});

  const trimmed = { name: values.name.trim(), email: values.email.trim(), idea: values.idea.trim() };
  const complete = Boolean(trimmed.name && EMAIL_RE.test(trimmed.email) && trimmed.idea);
  latest.current = { complete, phase };

  // Date is client-only so the server and client HTML always match.
  useEffect(() => {
    const d = new Date();
    setToday({
      long: d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
      mark: `${String(d.getDate()).padStart(2, "0")} · ${String(d.getMonth() + 1).padStart(2, "0")}`,
    });
  }, []);

  // Arriving from a "Start a … project" link: tick that service.
  useEffect(() => {
    const wanted = SERVICE_SLUGS[new URLSearchParams(window.location.search).get("service")];
    if (wanted && services.includes(wanted)) setPicked((p) => (p.includes(wanted) ? p : [...p, wanted]));
    // read once on arrival
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useIsomorphicLayoutEffect(() => {
    const r = Object.fromEntries(Object.entries(refs).map(([k, v]) => [k, v.current]));
    motion.current = createLetterMotion({
      ...r,
      canDrag: () => latest.current.complete && latest.current.phase === "write",
      onDragSend: () => submitRef.current(),
    });
    return () => motion.current?.destroy();
    // refs are stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase === "write") motion.current?.setStamp(complete);
  }, [complete, phase]);

  // Delivered (and the thanks line rendered): a sealed next letter arrives on larger screens.
  useEffect(() => {
    if (phase === "done") motion.current?.showNext();
  }, [phase, sent]);

  const set = (key) => (v) => {
    setValues((s) => ({ ...s, [key]: v }));
    if (errors[key] || (key === "email" && errors.email)) setErrors((e) => ({ ...e, [key]: undefined, send: undefined }));
  };
  const toggle = (s) => setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const pickFile = (e) => {
    const chosen = e.target.files?.[0] || null;
    e.target.value = "";
    if (!chosen) return;
    if (chosen.size > MAX_FILE_BYTES) {
      setFile(null);
      setErrors((x) => ({ ...x, file: NOTES.file }));
      return;
    }
    setErrors((x) => ({ ...x, file: undefined }));
    setFile(chosen);
  };

  function validate() {
    const e = {};
    if (!trimmed.name) e.name = NOTES.name;
    if (!trimmed.email) e.email = NOTES.email;
    else if (!EMAIL_RE.test(trimmed.email)) e.email = NOTES.emailBad;
    if (!trimmed.idea) e.idea = NOTES.idea;
    return e;
  }

  async function submit(ev) {
    ev?.preventDefault();
    if (phase !== "write") return;
    const e = validate();
    if (Object.keys(e).length) {
      setErrors((x) => ({ ...x, ...e, send: undefined }));
      motion.current?.shake(dropRef.current);
      const first = ["name", "idea", "email"].find((k) => e[k]);
      fields[first]?.current?.focus({ preventScroll: false });
      setStatus(`Almost there: ${Object.values(e).map((n) => n.replace(/^[←↑↓→]\s*/, "")).join("; ")}.`);
      return;
    }
    const form = new FormData();
    form.set("name", trimmed.name);
    form.set("company", values.company.trim());
    form.set("email", trimmed.email);
    form.set("idea", trimmed.idea);
    form.set("postscript", values.ps.trim());
    picked.forEach((s) => form.append("services", s));
    if (file) form.set("attachment", file);
    form.set("website", ev?.target?.elements?.website?.value || ""); // honeypot

    setSigned(trimmed.name);
    setErrors({});
    setPhase("sending");
    setStatus("Sending your letter…");
    const request = Promise.resolve(onSubmit ? onSubmit(form) : defaultSend(endpoint, form)).then(Boolean, () => false);
    const ok = await motion.current.post(request);
    if (ok) {
      setSent({ first: trimmed.name.split(/\s+/)[0], email: trimmed.email });
      setPhase("done");
      setStatus("Delivered. Your letter is on our desk.");
    } else {
      setPhase("write");
      setErrors({ send: NOTES.send });
      setStatus(NOTES.send);
    }
  }
  const submitRef = useRef(submit);
  submitRef.current = () => submit();

  function writeAnother() {
    setValues(EMPTY);
    setPicked([]);
    setFile(null);
    setErrors({});
    setSigned("");
    setSent(null);
    setPhase("write");
    setStatus("");
    motion.current?.reset();
    requestAnimationFrame(() => {
      fields.name.current?.focus({ preventScroll: true });
      // the fresh letter starts at the top of the desk: bring it into view if it's above the screen
      const top = refs.letter.current?.getBoundingClientRect().top ?? 0;
      if (top < 100) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: window.scrollY + top - 130, behavior: reduce ? "auto" : "smooth" });
      }
    });
  }

  async function openNext() {
    const ok = await motion.current?.openNext();
    if (ok) writeAnother();
  }

  const signature = signed || "";
  const from = signed || trimmed.name;

  return (
    <section className={`cl ${className}`} aria-labelledby={f("title")}>
      <div className="cl-amb" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>

      <div className="cl-intro">
        <p className="cl-eyebrow">Contact</p>
        <h1 className="cl-title" id={f("title")}>
          Let’s build something <span className="cl-script">remarkable.</span>
        </h1>
        <p className="cl-lede">
          Write to us the way you’d write to a friend. Fill in the blanks, sign it, and drop it in the slot — it lands straight on our desk.
        </p>
        <ol className="cl-steps">
          <li>
            <b>01</b>Fill in the blanks
          </li>
          <li>
            <b>02</b>Sign and drop it in the slot
          </li>
          <li>
            <b>03</b>We read it and write back ourselves
          </li>
        </ol>
        {email && (
          <p className="cl-email">
            Prefer email? <a href={`mailto:${email}`}>{email}</a>
          </p>
        )}
      </div>

      <div className={`cl-desk is-${phase}`} ref={refs.desk}>
        <form className="cl-letter" ref={refs.letter} onSubmit={submit} noValidate aria-label="Your letter to AlldyStars">
          <div className="cl-sheen" aria-hidden="true" />
          <div className="cl-content" ref={refs.content}>
            <div className="cl-head">
              <p className="cl-to">
                To — <b>{recipient}</b>
                <br />
                <span suppressHydrationWarning>{today.long || " "}</span>
              </p>
              <div className="cl-stampbox" aria-hidden="true">
                <span className="cl-stamp-ph">
                  Place
                  <br />
                  stamp
                  <br />
                  here
                </span>
                <span className="cl-stamp-w" ref={refs.stamp}>
                  <span className="cl-stamp">
                    <span className="cl-stamp-in">
                      <Star />
                      <small>ALLDYSTARS</small>
                    </span>
                  </span>
                </span>
              </div>
            </div>

            {file && (
              <div className="cl-att" data-no-drag>
                <span className="cl-att-clip" aria-hidden="true">
                  <Clip />
                </span>
                <span className="cl-att-ext" aria-hidden="true">
                  {(file.name.split(".").pop() || "file").slice(0, 4).toUpperCase()}
                </span>
                <span className="cl-att-meta">
                  <b title={file.name}>{file.name}</b>
                  <i>{formatSize(file.size)} · clipped</i>
                </span>
                <button type="button" className="cl-att-x" onClick={() => setFile(null)} aria-label={`Remove ${file.name}`}>
                  ×
                </button>
              </div>
            )}

            <div className="cl-copy">
              <p>Hi AlldyStars,</p>
              <p>
                I’m{" "}
                <Blank
                  ref={fields.name}
                  id={f("name")}
                  name="name"
                  label="Your name"
                  placeholder="your name"
                  autoComplete="name"
                  minWidth="210px"
                  value={values.name}
                  onChange={set("name")}
                  onBlur={() => setSigned(values.name.trim())}
                  note={errors.name}
                  required
                />{" "}
                from{" "}
                <span className="cl-nobr">
                <Blank
                  id={f("company")}
                  name="company"
                  label="Company or project (optional)"
                  placeholder="company or project"
                  autoComplete="organization"
                  minWidth="200px"
                  value={values.company}
                  onChange={set("company")}
                />
                ,
                </span>
              </p>
              <fieldset className="cl-services">
                <legend>and I’d love your help with</legend>
                <div className="cl-chips">
                  {services.map((s) => (
                    <label key={s} className="cl-chip">
                      <input type="checkbox" name="services" value={s} checked={picked.includes(s)} onChange={() => toggle(s)} />
                      <span>{s}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <p className="cl-lbl" id={f("idea-lbl")}>
                Here’s the idea:
              </p>
              <Blank
                ref={fields.idea}
                id={f("idea")}
                name="idea"
                label="Here’s the idea"
                placeholder="Tell us what you’re making, who it’s for, and what “great” looks like…"
                multiline
                className="cl-idea"
                value={values.idea}
                onChange={set("idea")}
                note={errors.idea}
                required
              />
              <p>
                You can write back to me at{" "}
                <span className="cl-nobr">
                <Blank
                  ref={fields.email}
                  id={f("email")}
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  label="Your email"
                  placeholder="your email"
                  minWidth="250px"
                  value={values.email}
                  onChange={set("email")}
                  note={errors.email}
                  required
                />
                .
                </span>
              </p>
              <p className="cl-signrow">
                Warmly,{" "}
                <span className="cl-sig" aria-hidden="true" key={signature}>
                  {signature}
                </span>
              </p>
              <div className="cl-ps">
                <span className="cl-ps-lbl" aria-hidden="true">
                  P.S.
                </span>
                <Blank
                  id={f("ps")}
                  name="postscript"
                  label="P.S. — anything else (optional)"
                  placeholder="Anything else? Links, deadlines, a little backstory — this space is yours."
                  multiline
                  className="cl-psfield"
                  value={values.ps}
                  onChange={set("ps")}
                />
              </div>
            </div>

            {/* honeypot: hidden from people, tempting to bots */}
            <input className="cl-hp" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />

            <div className="cl-foot">
              <div className="cl-clipwrap">
                <input ref={fileRef} id={f("file")} className="cl-file" type="file" accept={ACCEPT} onChange={pickFile} aria-describedby={errors.file ? f("file-note") : undefined} />
                <label htmlFor={f("file")} className="cl-clip">
                  <Clip />
                  {file ? "Clip a different brief" : "Clip a brief"} <em>optional</em>
                </label>
                {errors.file && (
                  <span className="cl-pen cl-pen-file" id={f("file-note")}>
                    {errors.file}
                  </span>
                )}
              </div>
              <button ref={dropRef} type="submit" className={`cl-drop${complete ? "" : " is-off"}`} disabled={phase !== "write"}>
                Drop it in the slot
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M8 2v11M3.5 8.5 8 13l4.5-4.5" />
                </svg>
              </button>
            </div>
            {errors.send && (
              <p className="cl-pen cl-pen-send" role="alert">
                {errors.send}
              </p>
            )}
          </div>

          <div className="cl-env" ref={refs.envelope} aria-hidden="true">
            <span className="cl-flap" ref={refs.flap} />
            <span className="cl-addr">
              <b>{recipient}</b>
              {from ? `From ${from}` : ""}
            </span>
            <span className="cl-stamp cl-stamp-sm">
              <span className="cl-stamp-in">
                <Star />
              </span>
            </span>
            <span className="cl-seal" ref={refs.seal}>
              <Star />
            </span>
          </div>
          <span className="cl-postmark" ref={refs.postmark} aria-hidden="true">
            <i />
            <span>
              DELIVERED
              <br />★ {today.mark} ★<br />
              ALLDYSTARS
            </span>
          </span>
        </form>

        <div className="cl-done" ref={refs.done} aria-hidden={phase !== "done"}>
          <span className="cl-done-seal" aria-hidden="true">
            <Star />
          </span>
          <p className="cl-done-k">Delivered</p>
          <h2 className="cl-done-h">
            It’s on our <em>desk.</em>
          </h2>
          {sent && (
            <p className="cl-done-p">
              Thanks, <b>{sent.first}</b>. We read every letter ourselves and we’ll write back to <b>{sent.email}</b>.
            </p>
          )}
          <button type="button" className="cl-again" onClick={writeAnother} tabIndex={phase === "done" ? 0 : -1}>
            Write another letter
          </button>
        </div>

        {/* larger screens: a sealed letter arrives above the delivered message; opening it starts a fresh one */}
        <button
          type="button"
          className="cl-next"
          ref={refs.next}
          onClick={openNext}
          tabIndex={phase === "done" ? 0 : -1}
          aria-label="Open a fresh letter"
        >
          <span className="cl-next-in" aria-hidden="true">
            <span className="cl-next-sheet" ref={refs.nextSheet} />
            <span className="cl-next-body">
              <span className="cl-addr">
                <b>A fresh letter</b>
                Click to open
              </span>
            </span>
            <span className="cl-next-flap" ref={refs.nextFlap}>
              <span className="cl-next-tri" />
              <span className="cl-seal cl-next-seal" ref={refs.nextSeal}>
                <Star />
              </span>
            </span>
            {/* above the flap, so the closed flap never covers it */}
            <span className="cl-stamp cl-stamp-sm">
              <span className="cl-stamp-in">
                <Star />
              </span>
            </span>
          </span>
        </button>

        <div className="cl-box" aria-hidden="true">
          <div className="cl-slot" ref={refs.slot}>
            <span className="cl-glow" />
          </div>
          <p className="cl-slot-lbl">
            <span className="cl-slot-name">LETTERS · ALLDYSTARS</span>
            <span className="cl-slot-hint">RELEASE TO SEND ↓</span>
          </p>
        </div>
      </div>

      <p className="cl-sr" role="status" aria-live="polite">
        {status}
      </p>
    </section>
  );
}
