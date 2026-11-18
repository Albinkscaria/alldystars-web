@AGENTS.md

# alldystars-web — working notes for Claude

Studio site for alldystars, built with Next.js 16 App Router, React 18, plain CSS and GSAP 3.13. It's hosted on **Vercel** and deploys from `master`. Read `HANDOFF.md` for the full picture: pages, components and open items.

## Commands
- **`npm run dev`:** runs at http://localhost:3000. The user usually has it running already, so check before starting another.
- **`npm run build`:** run it after every change. It must show "Compiled successfully" with no errors before you report work as done.
- **Pushing:** commit and push only when the user asks. They deploy by pushing to `master`; Vercel builds from GitHub.

## Rules for this codebase
- **Site palette:** black and white plus the coral accent `#FF4433` (`--coral-text`). The script blue `#211AE0` (`--indigo-text`) is used sparingly.
  - When the user supplies outside code, map its colours to this palette. Their reds (for example `#E5483D`) become `#FF4433`, and blue-tinted greys become neutral greys.
  - `--coral` and `--indigo-*` are black or charcoal now; don't use them as accents.
- **Fonts:**
  - **Body text:** Open Sauce Sans.
  - **Script words:** Aniyah, which is very wide, so script lines must never wrap; size them in `em` and cap them with `vw`.
  - **Section fonts:** come from `app/fonts.js` as CSS variables, passed through a section's `className`.
- **Fixed header:** about 95 px tall at every width. Heroes and pinned sections must clear it. Pinned sections measure `.site-header` rather than hard-coding 95.
- **Pinned and scroll-scrubbed sections** (GSAP ScrollTrigger) must:
  - set `scrollBehavior = 'auto'` on `<html>` while mounted, and restore it on unmount;
  - use a function `start` that includes the header height;
  - use `invalidateOnRefresh`;
  - refresh when `document.body`'s height changes;
  - use directional snap;
  - skip pinning under `prefers-reduced-motion`.

  Copy the pattern in `components/ServicesCanvas/ServicesCanvas.jsx`.
- **No transforms on page wrappers:** never put a `transform` on `.page-transition` or another ancestor of fixed or pinned elements.
- **Sideways overflow:** use `overflow-x: clip` (not `hidden`) for sideways bleed, so sticky and pinned sections keep working.
- **Scoped CSS:** each component scopes its CSS under one prefix (`.sc-`, `.sd-`, `.fn-`, `.cl-`, `.hdp-`). Keep new styles scoped the same way.
- **Responsive:** every visual change must work from 320 px phones to 2560 px screens, including phones held sideways. Check for sideways overflow and overlapping text.
- **Read before using Next APIs:** check `node_modules/next/dist/docs/` before using any Next.js API (see AGENTS.md).

## Contact form
- **Live sender:** EmailJS from the browser when the `NEXT_PUBLIC_EMAILJS_*` variables are set. Otherwise it uses `app/api/contact/route.js` (Resend), which prints letters to the terminal in development.
- **Keep lists in sync:** the `SERVICES` list in `ContactLetter.jsx` must match `ALLOWED_SERVICES` in the route.
- **Attachment cap:** 4 MB, because of Vercel's 4.5 MB request limit.

## Verifying work
- **Use real Playwright checks, not assumptions.** Playwright is a dev dependency. Write scripts in the session's scratchpad (not the repo), run them with `NODE_PATH=<repo>/node_modules`, and look at the screenshots.
- **Skip the preloader in tests:** add `sessionStorage.setItem('adly-preloaded','1')` via `addInitScript`. To test what a first-time or incognito visitor sees, use a fresh context without it.
- **Report honestly:** say exactly what was and wasn't tested (the browsers, sizes and live site).

## Editing notes
- **Line endings:** files are LF in git, but some are CRLF in the working tree. Scripted edits must preserve each file's line endings.
- **Git Bash paths:** Git Bash rewrites arguments that start with `/`, such as `/services`, into Windows paths. Avoid passing bare URL paths as command-line arguments.
- **Design direction:** the home hero stays centred (eyebrow, headline with a script line, paragraph, two buttons). Don't redesign it into a split layout.
