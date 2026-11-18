import { Crimson_Text, Inter, JetBrains_Mono, Lora } from 'next/font/google';

// Section-specific typefaces (the About "Chronicle" newspaper and the home
// "Five disciplines" dot section). Each is exposed as a CSS variable only;
// the site's main font stays Open Sauce Sans. Defined once here so both
// pages share the same self-hosted font files.
export const crimson = Crimson_Text({ subsets: ['latin'], weight: ['400', '700'], style: ['normal', 'italic'], variable: '--font-crimson', display: 'swap' });
export const lora = Lora({ subsets: ['latin'], variable: '--font-lora', display: 'swap' });
export const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400'], variable: '--font-mono', display: 'swap' });
export const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
