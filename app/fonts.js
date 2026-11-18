import { Anton, Crimson_Text, Inter, JetBrains_Mono, Pinyon_Script } from 'next/font/google';

// Section-specific typefaces (the About "names as windows" founders section
// and the home/services discipline sections). Each is exposed as a CSS
// variable only; the site's main font stays Open Sauce Sans. Defined once
// here so every page shares the same self-hosted font files.
export const crimson = Crimson_Text({ subsets: ['latin'], weight: ['400', '700'], style: ['normal', 'italic'], variable: '--font-crimson', display: 'swap' });
export const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-mono', display: 'swap' });
export const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
// handwriting on the contact letter (red-pen notes, signature); Aniyah's wide
// swashes don't fit inside a letter's lines
export const script = Pinyon_Script({ subsets: ['latin'], weight: '400', variable: '--font-script', display: 'swap' });
export const anton = Anton({ subsets: ['latin'], weight: '400', variable: '--font-anton', display: 'swap' });
