/**
 * The archive's content. Edit this file to add / open / seal projects.
 *
 * status:
 *   "live"   – a published case study. Needs `href` (/projects/<id>; that page is
 *              app/projects/[slug]/page.jsx). Shows its cover peeking out of the file.
 *   "sealed" – not public yet. Shows red tape (`seal`) and an "opening soon" stamp on hover.
 *   "cta"    – the "your brand" file that links to the contact page. Keep one, last.
 *
 * category: one of the FILTERS keys (the site's own disciplines).
 * tone: "grey" | "paper" | "dark" | "silver" | "red"   (folder card stock)
 *
 * cover (live only):
 *   { src: "/work/acme/cover.jpg", alt: "…", position: "left center" }  -> uses next/image
 *   `position` picks which part of the image shows when the cover crops it
 *   (CSS object-position; default "center"). Images live in /public/work/<id>/.
 *   omit `src` to show the built-in sample poster until the real image is ready.
 */
export const FILTERS = [
  { key: "all", label: "All" },
  { key: "brand", label: "Brand" },
  { key: "web", label: "Web" },
  { key: "graphic", label: "Graphic" },
  { key: "data", label: "Data" },
];

export const PROJECTS = [
  {
    id: "cbse-maths-world",
    status: "live",
    category: "web",
    tab: "Web design",
    discipline: "Web design · Education",
    year: "2026",
    title: "CBSE Maths World",
    href: "/projects/cbse-maths-world",
    cover: {
      src: "/work/cbse-maths-world/cover.png",
      alt: "CBSE Maths World website home page: “Master CBSE Mathematics with Confidence”, with the tutor’s portrait",
      position: "left center",
    },
    tone: "paper",
  },
  {
    id: "safeland-international",
    status: "live",
    category: "web",
    tab: "Web design",
    discipline: "Web design · Study abroad",
    year: "2026",
    title: "Safeland International",
    href: "/projects/safeland-international",
    cover: {
      src: "/work/safeland-international/cover.png",
      alt: "Safeland International website home page: “Kerala's Best German Consultancy.” over a view of Munich",
      position: "center",
    },
    tone: "grey",
  },
  {
    id: "graphic-design-01",
    status: "sealed",
    category: "graphic",
    tab: "Graphic",
    discipline: "Graphic design",
    year: "2026",
    title: "Sealed file",
    seal: "Under NDA",
    stamp: "Under NDA",
    tone: "dark",
  },
  {
    id: "data-analytics-01",
    status: "sealed",
    category: "data",
    tab: "Data",
    discipline: "Data analytics",
    year: "2026",
    title: "Sealed file",
    seal: "Launching soon",
    stamp: "Opening soon",
    tone: "silver",
  },
  {
    id: "your-brand",
    status: "cta",
    category: null, // always visible
    tab: "Your brand",
    discipline: "Next in line",
    year: "2027",
    title: "This file could be yours.",
    href: "/contact",
    cta: "Start a project",
    tone: "red",
  },
];
