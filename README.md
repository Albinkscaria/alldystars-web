# alldystars-web

This is the full site as real Next.js pages: Home, Services, Projects, About —
one project, shared Header/Footer, real routes instead of separate .html files.

## Folder map

```
alldystars-web/
├── app/
│   ├── layout.jsx          root layout — loads fonts, wraps every page
│   ├── globals.css         design tokens + shared header/footer/marquee/cta styles
│   ├── page.jsx            Home            → /
│   ├── Home.css
│   ├── services/
│   │   ├── page.jsx        Services        → /services
│   │   └── Services.css
│   ├── projects/
│   │   ├── page.jsx        Projects        → /projects
│   │   └── Projects.css
│   └── about/
│       ├── page.jsx        About           → /about
│       └── About.css
├── components/
│   ├── Header/Header.jsx
│   ├── Footer/Footer.jsx
│   └── AboutIntro/
│       ├── AboutIntro.jsx      the loader/trail/FLIP intro effect
│       ├── AboutExtras.jsx     founders + CTA + footer, below the intro
│       └── about-intro.css
├── lib/aboutIntro/
│   ├── trail.js
│   ├── fakeProgress.js
│   ├── textLinesReveal.js
│   ├── gsapAnimation.js
│   └── utils.js
├── package.json
└── jsconfig.json
```

## How to run it

1. Install dependencies (from inside this folder):
   ```
   npm install
   ```

2. Start the dev server:
   ```
   npm run dev
   ```

3. Open:
   ```
   http://localhost:3000
   ```
   - `/` — Home
   - `/services` — Services index
   - `/projects` — Projects (placeholder slots — see note below)
   - `/about` — the loader → trail-reveal → Enter → FLIP intro, then founders/CTA

## Before this looks fully real

- **Photos**: `AboutIntro.jsx` references `/images/about/intro-hero.jpg` and
  `/images/about/studio-1.jpg`. Add real photos at those paths under `public/images/about/`
  (create the folders) — until then those two boxes render as empty coral/indigo panels.
- **Projects**: `/projects` is intentionally empty placeholder slots — no invented
  client work. Swap the content in `app/projects/page.jsx` once real case studies exist.
- **Email**: every CTA button currently points to `mailto:hello@alldystars.com` —
  update if the real studio inbox is different.

## If you get an import error like "Can't resolve '@/lib/...'"

Your project needs the `@/` path alias pointed at the repo root. This is already set up
in `jsconfig.json` above — if you scaffolded the project with `create-next-app` and it
generated its own `jsconfig.json` or `tsconfig.json`, make sure it has the same
`"paths": { "@/*": ["./*"] }` entry, or just merge the one from this repo in.
