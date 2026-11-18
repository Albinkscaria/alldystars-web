import gsap from "gsap";

/**
 * All motion for the letter: hover tilt + sheen, drag-to-send, the stamp,
 * the "not yet" shake, and the post sequence (fold → envelope → postmark →
 * through the slot), including folding back open if sending fails, and the
 * sealed "next letter" that arrives afterwards on larger screens.
 *
 * Every animation goes through GSAP so transforms never fight each other.
 */
const REST_ROTATION = -1.2;
const DRAG_MAX = 90; // px the letter can be pulled down
const DRAG_SEND = 52; // px past which releasing sends it

export function createLetterMotion({ desk, letter, content, envelope, flap, seal, postmark, stamp, slot, done, next, nextFlap, nextSheet, nextSeal, canDrag, onDragSend }) {
  const reduce = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const cleanups = [];
  let busy = false; // folding / posting: no tilt or drag
  let foldTl = null;

  gsap.set(letter, { rotation: reduce() ? 0 : REST_ROTATION, transformPerspective: 1600, transformOrigin: "50% 50%" });
  gsap.set([envelope, seal, postmark, done], { autoAlpha: 0 });
  gsap.set(flap, { rotationX: 178, transformOrigin: "50% 0%", transformPerspective: 900 });
  if (next) {
    gsap.set(next, { autoAlpha: 0 });
    gsap.set(nextFlap, { rotationX: 0, transformOrigin: "50% 0%", transformPerspective: 700, zIndex: 3 });
  }

  /* ---------- hover tilt + light sheen ---------- */
  // a fresh tween each move (overwrite) — safe alongside the drag and fold tweens on the same element
  const tilt = (x, y) => gsap.to(letter, { rotationX: x, rotationY: y, duration: 0.6, ease: "power3.out", overwrite: "auto" });
  const onMove = (e) => {
    if (busy || dragging || reduce() || !finePointer()) return;
    const r = letter.getBoundingClientRect();
    const u = (e.clientX - r.left) / r.width - 0.5;
    const v = (e.clientY - r.top) / r.height - 0.5;
    tilt(-v * 4, u * 5);
    letter.style.setProperty("--sx", `${(u + 0.5) * 100}%`);
    letter.style.setProperty("--sy", `${(v + 0.5) * 100}%`);
    letter.classList.add("is-lit");
  };
  const onLeave = () => {
    if (busy || dragging) return;
    tilt(0, 0);
    letter.classList.remove("is-lit");
  };
  letter.addEventListener("pointermove", onMove);
  letter.addEventListener("pointerleave", onLeave);
  cleanups.push(() => {
    letter.removeEventListener("pointermove", onMove);
    letter.removeEventListener("pointerleave", onLeave);
  });

  /* ---------- drag the letter down into the slot (mouse / pen) ---------- */
  let dragging = false;
  let startY = 0;
  let pulled = 0;
  const interactive = "input, textarea, button, label, a, select, [data-no-drag]";
  const onDown = (e) => {
    if (busy || e.button !== 0 || e.pointerType === "touch" || e.target.closest(interactive)) return;
    if (!canDrag()) return;
    dragging = true;
    startY = e.clientY;
    pulled = 0;
    letter.setPointerCapture(e.pointerId);
    letter.classList.add("is-grabbed");
    letter.classList.remove("is-lit");
    e.preventDefault();
  };
  const onDrag = (e) => {
    if (!dragging) return;
    const dy = Math.max(0, e.clientY - startY);
    pulled = DRAG_MAX * (1 - Math.exp(-dy / DRAG_MAX)); // rubber band
    const k = pulled / DRAG_MAX;
    gsap.to(letter, { y: pulled, scale: 1 - k * 0.06, rotation: (reduce() ? 0 : REST_ROTATION) + k * 2.2, rotationX: k * 6, rotationY: 0, duration: 0.25, ease: "power2.out", overwrite: "auto" });
    if (pulled > DRAG_SEND) desk.dataset.hot = ""; else delete desk.dataset.hot;
  };
  const onUp = (e) => {
    if (!dragging) return;
    dragging = false;
    letter.classList.remove("is-grabbed");
    if (letter.hasPointerCapture(e.pointerId)) letter.releasePointerCapture(e.pointerId);
    const send = pulled > DRAG_SEND;
    delete desk.dataset.hot;
    if (send) onDragSend();
    else gsap.to(letter, { y: 0, scale: 1, rotation: reduce() ? 0 : REST_ROTATION, rotationX: 0, rotationY: 0, duration: 0.6, ease: "elastic.out(1, 0.6)", overwrite: "auto" });
  };
  letter.addEventListener("pointerdown", onDown);
  letter.addEventListener("pointermove", onDrag);
  letter.addEventListener("pointerup", onUp);
  letter.addEventListener("pointercancel", onUp);
  cleanups.push(() => {
    letter.removeEventListener("pointerdown", onDown);
    letter.removeEventListener("pointermove", onDrag);
    letter.removeEventListener("pointerup", onUp);
    letter.removeEventListener("pointercancel", onUp);
  });

  /* ---------- the stamp: sticks on once the letter is complete ---------- */
  let stamped = false;
  function setStamp(on) {
    if (on === stamped) return;
    stamped = on;
    gsap.killTweensOf(stamp);
    if (on && !reduce()) {
      gsap.fromTo(
        stamp,
        { autoAlpha: 1, x: 240, y: -200, rotation: 38, scale: 1.5 },
        { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.65, ease: "back.out(1.5)" }
      );
    } else if (on) {
      gsap.set(stamp, { autoAlpha: 1, x: 0, y: 0, rotation: 0, scale: 1 });
    } else {
      gsap.to(stamp, { autoAlpha: 0, scale: 0.85, duration: 0.25, ease: "power2.in" });
    }
  }
  gsap.set(stamp, { autoAlpha: 0 });

  function shake(el) {
    if (reduce()) return;
    gsap.fromTo(el, { x: 0 }, { keyframes: { x: [-8, 8, -6, 6, -3, 3, 0] }, duration: 0.45, ease: "none" });
  }

  /* ---------- posting ---------- */
  const play = (tl) => new Promise((resolve) => tl.eventCallback("onComplete", resolve).play());
  const rewind = (tl) => new Promise((resolve) => tl.eventCallback("onReverseComplete", resolve).reverse());

  function lock() {
    desk.style.height = `${desk.offsetHeight}px`;
    desk.dataset.locked = ""; // keeps the slot where it was while the letter leaves the flow
    const box = { left: letter.offsetLeft, top: letter.offsetTop, width: letter.offsetWidth, height: letter.offsetHeight };
    gsap.set(letter, { position: "absolute", margin: 0, ...box });
    return box;
  }
  function unlock() {
    gsap.set(letter, { clearProps: "position,margin,left,top,width,height,clipPath" });
    desk.style.height = "";
    delete desk.dataset.locked;
  }

  // the slot's top edge in desk coordinates
  const slotTop = () => slot.getBoundingClientRect().top - desk.getBoundingClientRect().top;
  // the dark opening inside the slot bar (see .cl-slot::before: 14px in from each side, 9px down)
  const OPENING_INSET_X = 14;
  const OPENING_TOP = 9;
  const openingWidth = () => slot.offsetWidth - OPENING_INSET_X * 2;

  /** Put the "Delivered" message just above the slot, where the visitor is already looking
      (the desk is still as tall as the letter was, so its top can be far off-screen). */
  function placeDone() {
    // anchored by its bottom edge, so the "Thanks, …" line React adds a moment later
    // grows it upwards instead of pushing it down over the slot
    done.style.top = "auto";
    done.style.bottom = `${desk.offsetHeight - slotTop() + 48}px`;
  }

  // where the envelope sits, in desk coordinates
  function envelopeBox(start) {
    const w = Math.min(440, start.width * 0.72, openingWidth() - 12); // always fits through the opening
    const h = w * 0.595;
    const left = (desk.offsetWidth - w) / 2;
    return { w, h, left, foldTop: start.top + (start.height - h) / 2, readyTop: slotTop() - h - 40 };
  }

  function buildFold(start) {
    const env = envelopeBox(start);
    const tl = gsap.timeline({ paused: true });
    tl.to(content, { autoAlpha: 0, duration: 0.3, ease: "power1.out" }, 0)
      .to(letter, { left: env.left, top: env.foldTop, width: env.w, height: env.h, y: 0, scale: 1, rotation: 0, rotationX: 0, rotationY: 0, duration: 0.85, ease: "power3.inOut" }, 0.1)
      .to(envelope, { autoAlpha: 1, duration: 0.4, ease: "power1.out" }, 0.45)
      .to(flap, { rotationX: 0, duration: 0.45, ease: "power2.inOut" }, 0.95)
      .fromTo(seal, { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: "back.out(2.2)" }, 1.3)
      .fromTo(postmark, { autoAlpha: 0, scale: 1.6, rotation: -14 }, { autoAlpha: 1, scale: 0.88, duration: 0.16, ease: "power2.in" }, 1.55)
      // carry it over the slot with a little sway
      .to(letter, { top: env.readyTop, duration: 0.7, ease: "power2.inOut" }, 1.9)
      .to(letter, { keyframes: { rotation: [0, -2.5, 0] }, duration: 0.7, ease: "sine.inOut" }, 1.9);
    return { tl, env };
  }

  function clipToSlot() {
    // the envelope disappears at the top edge of the dark opening, as if fed into it
    const mouth = slotTop() + OPENING_TOP;
    const top = parseFloat(letter.style.top) + gsap.getProperty(letter, "y");
    const cut = Math.max(0, top + letter.offsetHeight - mouth);
    letter.style.clipPath = `inset(0 -80px ${cut}px -80px)`;
  }

  /**
   * Fold the letter, wait for `request` (a promise of true/false), then drop it
   * through the slot — or open it back up if sending failed.
   * Resolves to the request's result.
   */
  async function post(request) {
    busy = true;
    letter.classList.remove("is-lit");
    if (reduce()) {
      const ok = await request.catch(() => false);
      if (ok) {
        await new Promise((r) => gsap.to(letter, { autoAlpha: 0, duration: 0.25, onComplete: r }));
        placeDone();
        gsap.to(done, { autoAlpha: 1, duration: 0.3 });
        // no animation leads the eye here, so bring the message into view if it isn't
        const r = done.getBoundingClientRect();
        if (r.top < 100 || r.bottom > window.innerHeight) done.scrollIntoView({ block: "center" });
      }
      busy = false;
      return ok;
    }
    const start = lock();
    const { tl, env } = buildFold(start);
    foldTl = tl;
    await play(tl);
    const ok = await request.catch(() => false);
    if (!ok) {
      await rewind(tl);
      unlock();
      gsap.set(letter, { rotation: REST_ROTATION, y: 0, scale: 1 });
      foldTl = null;
      busy = false;
      return false;
    }
    // in front of the slot's top lip while it goes in (the slot is drawn after the letter)
    desk.dataset.posting = "";
    gsap.set(letter, { transformOrigin: "50% 100%" });
    await new Promise((resolve) => {
      gsap
        .timeline({ onComplete: resolve })
        // settle onto the opening, then slide in, tipping back slightly as it goes
        .to(letter, { top: slotTop() + OPENING_TOP - env.h + 6, duration: 0.25, ease: "power2.out", onUpdate: clipToSlot })
        .to(letter, { y: env.h + 24, rotationX: 16, duration: 0.85, ease: "power2.in", onUpdate: clipToSlot })
        .add(() => (desk.dataset.swallowing = ""), 0.2)
        .add(() => delete desk.dataset.swallowing, 1.3)
        .set(letter, { autoAlpha: 0 })
        .add(placeDone)
        .fromTo(done, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" }, "+=0.1");
    });
    delete desk.dataset.posting;
    desk.style.minHeight = desk.style.height;
    desk.style.height = "";
    busy = false;
    return true;
  }

  /* ---------- the next letter (larger screens only) ---------- */
  // Once the delivered message is in place, a sealed envelope drops into the
  // empty space above it. Opening it gives the visitor a fresh, blank letter.
  let opening = false;
  function resetNext() {
    if (!next) return;
    gsap.killTweensOf([next, nextFlap, nextSheet, nextSeal]);
    gsap.set(next, { autoAlpha: 0, y: 0, rotation: 0 });
    gsap.set(nextFlap, { rotationX: 0, zIndex: 3 });
    gsap.set(nextSheet, { yPercent: 0 });
    gsap.set(nextSeal, { autoAlpha: 1, scale: 1 });
    next.style.top = "";
    opening = false;
  }
  function showNext() {
    if (!next || !window.matchMedia("(min-width: 901px)").matches) return;
    resetNext();
    // sits above "It's on our desk", only if the space really is there
    const top = done.offsetTop - next.offsetHeight - 56;
    if (top < 24) return;
    next.style.top = `${top}px`;
    // After sending, the page is usually scrolled down to the slot, so this space is
    // above the screen: glide up just enough to watch the new letter arrive (the
    // delivered message stays in view below it).
    const above = next.getBoundingClientRect().top - 120;
    if (above < 0) window.scrollTo({ top: window.scrollY + above, behavior: reduce() ? "auto" : "smooth" });
    if (reduce()) gsap.set(next, { autoAlpha: 1, rotation: -3 });
    else gsap.fromTo(next, { autoAlpha: 0, y: -70, rotation: -10 }, { autoAlpha: 1, y: 0, rotation: -3, duration: 0.9, ease: "back.out(1.3)", delay: 0.2 });
  }
  /** Break the seal, lift the flap and slide the blank sheet out. Resolves when it's done. */
  function openNext() {
    if (!next || opening) return Promise.resolve(false);
    opening = true;
    if (reduce()) return Promise.resolve(true);
    return new Promise((resolve) => {
      gsap
        .timeline({ onComplete: () => resolve(true) })
        .to(next, { rotation: 0, y: -6, duration: 0.25, ease: "power2.out" })
        .to(nextSeal, { autoAlpha: 0, scale: 0.4, duration: 0.2, ease: "power2.in" }, 0)
        .to(nextFlap, { rotationX: 178, duration: 0.5, ease: "power2.inOut" }, 0.15)
        .set(nextFlap, { zIndex: 0 }, 0.4) // past upright: the open flap goes behind the sheet
        .to(nextSheet, { yPercent: -58, duration: 0.5, ease: "power2.out" }, 0.55)
        .to(next, { autoAlpha: 0, y: -30, duration: 0.35, ease: "power1.in" }, 1.15);
    });
  }

  /** Back to a fresh, blank letter after "Write another letter". */
  function reset() {
    resetNext();
    foldTl?.kill();
    foldTl = null;
    busy = false;
    stamped = false;
    gsap.set(stamp, { autoAlpha: 0 });
    gsap.set([envelope, seal, postmark], { autoAlpha: 0 });
    gsap.set(flap, { rotationX: 178 });
    gsap.set(content, { autoAlpha: 1 });
    unlock();
    delete desk.dataset.posting;
    desk.style.minHeight = "";
    done.style.top = "";
    done.style.bottom = "";
    gsap.set(letter, { transformOrigin: "50% 50%" });
    gsap.to(done, { autoAlpha: 0, duration: 0.2 });
    // visible straight away (so the name field can take focus), then eases up into place
    gsap.set(letter, { visibility: "inherit" });
    gsap.fromTo(
      letter,
      { opacity: 0, y: 40, scale: 1, rotation: reduce() ? 0 : REST_ROTATION, rotationX: 0, rotationY: 0 },
      { opacity: 1, y: 0, duration: reduce() ? 0 : 0.7, ease: "power3.out", overwrite: "auto" }
    );
  }

  function destroy() {
    cleanups.forEach((fn) => fn());
    foldTl?.kill();
    gsap.killTweensOf([letter, content, envelope, flap, seal, postmark, stamp, done]);
    if (next) gsap.killTweensOf([next, nextFlap, nextSheet, nextSeal]);
  }

  return { setStamp, shake, post, reset, destroy, showNext, openNext };
}
