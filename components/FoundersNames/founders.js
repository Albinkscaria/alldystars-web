/**
 * Founders shown in the "names as windows" section.
 *
 * word       the name set in display type; the portrait shows through its letters
 * stem       index of the letter in `word` whose stem opens into the portrait
 *            (use a letter with a straight left stem: L, I, B, D, E, F, H, K, N, P, R)
 * image      greyscale portrait; `aspect` = width / height; `focusY` = height of the
 *            face as a fraction of the image (0 top, 1 bottom) — the face is centred
 *            inside the letters at that point
 * spread     the copy in the open spread; `about` is the full text for screen readers and SEO
 */
export const FOUNDERS = [
  {
    id: "joyal",
    word: "JOYAL",
    stem: 4, // the L
    name: "Joyal K Scaria",
    role: "Co-founder & Creative Director",
    side: "The design side",
    teaser: "Brand, illustration and art direction — the design side of AlldyStars.",
    quote: "Ideas become impact when they are shaped with purpose.",
    bio: "An award-winning artist, graphic designer and creative director with a passion for transforming ideas into meaningful visual experiences. A background in Information Technology & Data Analysis means the work is visually compelling and strategically effective.",
    about:
      "Joyal is an award-winning artist, graphic designer and creative director with a passion for transforming ideas into meaningful visual experiences. With a background in Information Technology & Data Analysis and years of experience in Art & Design, Joyal brings together technical knowledge and artistic thinking to create solutions that are both visually compelling and strategically effective.",
    skills: ["Brand identity", "Illustration", "Art direction"],
    tag: "Design",
    image: { src: "/founders/joyal-names.webp", aspect: 0.769, focusY: 0.33 },
  },
  {
    id: "albin",
    word: "ALBIN",
    stem: 3, // the I
    name: "Albin K Scaria",
    role: "Co-founder & Developer",
    side: "The build side",
    teaser: "Python, PHP, WordPress and Flutter — the build side of AlldyStars.",
    quote: "A design signed off in Figma ships as a working product.",
    bio: "Albin leads the development side of the studio, building the technical foundation that turns AlldyStars’ creative work into fast, functional, production-ready digital experiences.",
    about:
      "Albin leads the development side of the studio, building the technical foundation that turns AlldyStars’ creative work into fast, functional, production-ready digital experiences. A toolkit spanning Python, PHP, WordPress and Flutter means a design signed off in Figma ships as a working product, not a static mock-up.",
    skills: ["Python", "PHP", "WordPress", "Flutter"],
    tag: "Build",
    image: { src: "/founders/albin-names.webp", aspect: 0.769, focusY: 0.36 },
  },
];

export const STATS = [
  { value: "2700", suffix: "+", label: "designs shipped" },
  { value: "20", suffix: "+", label: "projects delivered" },
  { value: "10", suffix: "+", label: "clients" },
];
