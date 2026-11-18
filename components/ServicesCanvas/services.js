import brand from "./artboards/brand";
import website from "./artboards/website";
import graphic from "./artboards/graphic";
import data from "./artboards/data";
import business from "./artboards/business";

/** Image paths used inside the artboards (files live in /public/services). */
export const ASSETS = {
  graphic: "/services/graphic-art.webp",
  website: "/services/website-shot.webp",
};

/**
 * The five services. Titles, descriptions and "included" items are the live
 * site's own copy. `client` / `clientSub` describe the sample work drawn on the
 * artboard; `note` is the hand-off note pinned when the artboard finishes, at
 * `noteAt` (artboard coordinates, 600 × 600). `id` is the /services#<id> deep
 * link (the homepage's "Explore …" links and the hero index use these).
 */
export const SERVICES = [
  {
    id: "brand",
    slug: "brand-identity",
    name: "Brand Identity",
    title: ["Brand Identity &", "Design"],
    description:
      "Build a brand people remember. Everything your business needs to establish a distinctive and professional identity.",
    included: ["Logo Design", "Brand Strategy", "Visual Identity Design", "Rebranding"],
    client: "Kova Coffee Roasters",
    clientSub: "Fort Kochi · brand identity & packaging",
    swatch: "#0A0A0A",
    note: "Logo pack exported · SVG · PNG · favicon",
    noteAt: [300, 580],
    artboard: brand,
  },
  {
    id: "web",
    slug: "website-design",
    name: "Website Design",
    title: ["Website", "Design"],
    description:
      "Where clean interfaces meet exceptional user experience. Designing digital products that are intuitive, engaging, and built to perform.",
    included: ["Custom Website Design", "Landing Page Design", "E-commerce Design", "Dashboard Design"],
    client: "Monsoon",
    clientSub: "Slow travel in Kerala · website",
    swatch: "#FF4433",
    note: "Hero built in Next.js · responsive ✓",
    noteAt: [250, 566],
    artboard: website,
  },
  {
    id: "graphic",
    slug: "graphic-design",
    name: "Graphic Design",
    title: ["Graphic", "Design"],
    description:
      "Design that speaks before words do. Visual storytelling that strengthens marketing and communication.",
    included: [
      "Brochures & Flyers",
      "Posters & Banners",
      "Menus & Catalogs",
      "Business Presentations",
      "Marketing Materials",
      "Event Branding",
    ],
    client: "Editorial illustration",
    clientSub: "Geometric vector portrait",
    swatch: "#9A9A9A",
    note: "Print file ready · A2 · CMYK · 3 mm bleed",
    noteAt: [300, 566],
    artboard: graphic,
  },
  {
    id: "data",
    slug: "data-analytics",
    name: "Data Analytics",
    title: ["Data", "Analytics"],
    description: "Turn raw numbers into direction. Dashboards and reporting that show you what's working.",
    included: ["Data Dashboards", "Reporting Automation", "Performance Tracking", "Data Visualization"],
    client: "Kova Coffee Roasters",
    clientSub: "Sales dashboard · November 2026",
    swatch: "#0A0A0A",
    note: "Synced with Google Sheets · daily, 8:00 AM",
    noteAt: [250, 584],
    artboard: data,
  },
  {
    id: "business",
    slug: "business-analytics",
    name: "Business Analytics",
    title: ["Business", "Analytics"],
    description:
      "Decisions backed by evidence, not guesswork. Market and performance insight that sharpens strategy before you spend.",
    included: ["Market Research", "KPI Frameworks", "Growth Strategy", "Competitor Insights"],
    client: "Monsoon",
    clientSub: "Growth strategy · 2027 plan",
    swatch: "#FF4433",
    note: "Strategy deck v2 · sent to client",
    noteAt: [342, 362],
    artboard: business,
  },
];
