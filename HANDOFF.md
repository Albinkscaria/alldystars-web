# alldystars-web — handoff

Studio website for **alldystars**, a design studio in Kottayam run by Joyal K Scaria (design) and Albin K Scaria (development).

**Stack:** Next.js 16 (App Router), React 18, plain CSS (one stylesheet per page or component) and GSAP 3.13 for scroll animation. There's no CSS framework and no TypeScript.

**Hosting:** **Vercel**, deployed from the `master` branch of `github.com/Albinkscaria/alldystars-web`. Every push to `master` deploys.

> `README.md` is out of date. It describes an `AboutIntro` component that no longer exists. Trust this file and the code instead.

---

## Current state at a glance

| Page | Route | What's on it |
|---|---|---|
| Home | `/` | Preloader → dot-matrix hero → manifesto → "Five disciplines" dot section (pinned) → tech cards (9) → metrics → design-process timeline (scroll-scrubbed) → footer |
| Services | `/services` | Dot-matrix hero with a 5-link index → "design canvas" section (pinned, camera flies between 5 artboards) → CTA block → footer |
| About | `/about` | Hero → statement → vision quote → "names as windows" founders section (pinned) → CTA → footer |
| Contact | `/contact` | "Write us a letter" form (fill-in-the-blank letter that folds into an envelope and drops into a slot) → footer |
| Projects | `/projects` | Placeholder grid: "Case study coming soon". No real work has been added yet. |
| 404 | any unknown route | Custom not-found page |

Everything is responsive and was checked in Chrome from 320 px phones to 2560 px monitors. It hasn't been checked in Safari or Firefox, or on real devices.

---

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build: run this before every push
```

**Phones on the LAN:** `next.config.js` allows dev requests from `192.168.1.69`. If the machine's IP changes, add the new one there.

---

## ⚠️ Open item: the contact form doesn't deliver on the live site yet

**Live site:** letters go through **EmailJS** from the browser, but only once these three variables are set in **Vercel → Settings → Environment Variables** and the site is **redeployed**. They're inlined at build time, so a redeploy is required.

```
NEXT_PUBLIC_EMAILJS_SERVICE_ID
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
```

**EmailJS template:** it must use these variables. Set **Reply To** to `{{email}}`.

```
{{name}} {{company}} {{email}} {{services}} {{idea}} {{postscript}}
```

**Attachments:** while EmailJS is on, the "Clip a brief" option is hidden, because the free plan caps each send at 50 KB.

**Without those variables** the form posts to `app/api/contact/route.js`, which emails through **Resend**:
- **Variables:** it needs `RESEND_API_KEY` and `CONTACT_TO`, plus optional `CONTACT_FROM`.
- **No key, development:** the letter is printed in the terminal.
- **No key, production:** the route answers 503, and the letter folds back with "It didn't go through".

**Switching to Resend:** remove the EmailJS variables and add `RESEND_API_KEY` and `CONTACT_TO`. Attachments then work, up to 4 MB, because Vercel's request limit is 4.5 MB.

**Debugging live failures:** a failed send logs EmailJS's reason in the browser console.

---

## Where things live

```
app/
  layout.jsx            root layout: Open Sauce Sans (@fontsource) + globals.css
  globals.css           design tokens, header, mobile menu, CTA block, footer, marquee
  fonts.js              next/font definitions shared by the sections (see Fonts)
  template.jsx          page fade-in wrapper (opacity only; see Gotchas)
  page.jsx + Home.css   home; also holds the tech list, metrics and process timeline
  services/             page.jsx + Services.css
  about/                page.jsx (metadata + fonts) → AboutContent.jsx (client) + About.css
  contact/              page.jsx (EmailJS sender + cursor) + Contact.css
  projects/             placeholder page
  api/contact/route.js  Resend email route (honeypot, rate limit, validation)
components/
  Header/, Footer/      shared chrome (Footer uses FloatingDock for the social icons)
  Preloader/            first-visit "Design Beyond Aesthetics." screen (sessionStorage flag)
  HeroDotPrint/         dot-matrix hero (home + services). artwork.js = the hidden picture
  ServicesDots/         home "Five disciplines": ~2,600 canvas dots morph between shapes
  ServicesCanvas/       services "design canvas"; artboards/*.js hold each artboard's markup
  FoundersNames/        about founders: names in Anton, portraits revealed through letters
  ContactLetter/        contact letter form + letterMotion.js (fold, envelope, slot)
public/
  images/tech/*.svg     tech-card logos (Devicon v2.16.0 + hand-drawn Tableau/Power BI)
  founders/*.webp       founder portraits (1200×1560, upscaled from small originals)
  services/*.webp       images used inside the services artboards
  images/fonts/Aniyah.ttf, fonts/open-sauce-sans-400.woff
```

---

## Design system

**Colours:** black and white, with one accent. Tokens are in `globals.css`.
- **Ink, paper and greys:** `--ink #0A0A0A`, `--paper #FFF`, `--paper-dim #F0F0F0`, `--ink-soft #454545`, `--muted #7A7A7A`.
- **Accent:** `--coral-text #FF4433`. It's the only red. It's used for numbers, script words, small marks and section accents.
- **Script blue:** `--indigo-text #211AE0` is used for script words on About and in the hero print colours.
- **Old token names:** `--coral` and `--indigo-*` keep their old names but are **black or charcoal** now, so don't use them for colour accents.
- **Section colours:** each section scopes its own `--xx-*` variables (for example `--sc-red`, `--fn-red`, `--cl-red`), all set to the palette above.

**Fonts:**
- **Site-wide:** Open Sauce Sans for text, and **Aniyah** (self-hosted, `@font-face` in globals.css) for script words.
- **Section fonts** come from `app/fonts.js` as CSS variables, passed to each section through `className`:
  - **Crimson Text** — `--font-crimson`
  - **Inter** — `--font-inter`
  - **JetBrains Mono** — `--font-mono`
  - **Anton** — `--font-anton`, used for the founder names
  - **Pinyon Script** — `--font-script`, the handwriting in the contact letter

  Aniyah's swashes are too wide to sit inside the letter's lines, which is why the letter uses Pinyon Script.

**Header:** the site header is **fixed** and about **95 px tall at every width**. Every hero or pinned section has to clear it.

---

## How the big interactive sections work

All four pinned sections follow the same pattern:
1. A pure `render(t)` or engine function draws everything from a single number.
2. A GSAP ScrollTrigger maps scroll position to that number.

That's why scrolling backwards, reloading mid-section and resizing all land on exactly the same frame.

- **Pinning below the header:** each section measures `.site-header` and pins below it, using `start: () => \`top ${headerH}px\``.
- **Smooth scroll:** each sets `document.documentElement.style.scrollBehavior = 'auto'` while mounted, because the site's `html { scroll-behavior: smooth }` makes snapping stutter. It restores the old value on unmount.
- **Directional snap:** snap stops are spaced widely, so a "nearest stop" snap would drag ordinary scrolls back.
- **Re-measuring:** a `ResizeObserver` on `document.body` calls `ScrollTrigger.refresh()` when the page height really changes, for example after fonts or images load.
- **Reduced motion:** with `prefers-reduced-motion`, nothing pins or scrubs, and the buttons switch states instantly.
- **Full text for assistive tech:** every section has a visually hidden block with the complete text for screen readers and search engines.

Specific behaviour:
- **HeroDotPrint:** Canvas 2D. `artwork.js` draws a greyscale picture: white means big, bright dots and black means none. Edit that function to change what the cursor reveals. It has a separate phone layout.
- **ServicesDots (home):** the shapes live in `shapes.js`. It moves one discipline per scroll step.
- **ServicesCanvas (services):** the timeline is in `canvasEngine.js`. `/services#brand|web|graphic|data|business` deep-links to an artboard; the home page's "Explore …" links use these.
- **FoundersNames (about):** `namesEngine.js` measures glyph stems on a canvas and stacks the layout on phones and portrait tablets. It doesn't pin on screens under 500 px tall.
- **ContactLetter:**
  - `/contact?service=<slug>` pre-ticks a service; the Services page's "Start a … project" links use this.
  - On screens over 900 px, a sealed "fresh letter" envelope appears after delivery.
  - The services list must match `ALLOWED_SERVICES` in the API route.

---

## Gotchas learned the hard way

- **Fixed positioning:** don't give `.page-transition`, or any ancestor of the header or a pinned section, a `transform`. It turns `position: fixed` into positioning relative to that ancestor.
- **Sideways scrolling:** `.page-transition` uses `overflow-x: clip`, not `hidden`, because `hidden` breaks sticky and pinned sections. It stops decorative bleed (the tilted marquee, glows) from letting phones scroll sideways.
- **Script headlines:** script lines (Aniyah) must never wrap, or their swashes run through the next line. The heroes size these lines in `em` and cap them with `vw` so they fit the screen.
- **Testing first visits:** the preloader stores `adly-preloaded` in `sessionStorage`. Incognito windows always see it. Test fresh visits with a clean browser context.
- **Line endings:** files are LF in git. The working tree has CRLF in places, so expect "LF will be replaced by CRLF" warnings. They're harmless.
- **Vercel limits:** request bodies over 4.5 MB fail, which is why the attachment cap is 4 MB. Netlify Forms was tried and removed, because the site runs on Vercel.

---

## Known gaps and ideas

- **Contact form:** needs EmailJS or Resend set up on Vercel; see the section above.
- **Projects page:** placeholders only. Add real case studies.
- **Founder photos:** upscaled from 536 px originals. Original camera photos at 1200 px or wider would look sharper.
- **Tableau and Power BI logos:** simplified drawings. Replace `public/images/tech/tableau.svg` and `powerbi.svg` with the official assets if needed.
- **Favicon:** none, so `/favicon.ico` returns 404.
- **Social links:** the LinkedIn link in the footer and contact dock is `#`.
- **Browser and device coverage:** not tested in Safari or Firefox, or on real phones (especially touch scrolling on the pinned sections).
- **README.md:** out of date; rewrite it or point it at this file.

---

## Recent history (newest first)

| Commit | Change |
|---|---|
| `b75b3bb` | Dot-matrix hero replaces the background videos (videos deleted) |
| `9eb7b6f` | Contact form sends through EmailJS |
| `12271c3` | Back to the `/api/contact` route for Vercel; 4 MB attachments |
| `92fc917` | Smoother letter fold and drop |
| `946a101` | Tableau and Power BI tech cards; full-width footer wordmark; centred footer links |
| `7ee46d0` | "Names as windows" founders section; "Write us a letter" contact page |
| `149750d` | Services design canvas, home dot section, process timeline, responsive pass |
