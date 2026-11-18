import { anton, crimson, inter, mono } from '../fonts';
import AboutContent from './AboutContent';

export const metadata = {
	title: 'About — alldystars',
	description: 'We are a team of passionate designers, creative thinkers, and problem-solvers dedicated to transforming ideas into meaningful visual experiences.',
};

export default function AboutPage() {
	return <AboutContent fontClassName={`${anton.variable} ${crimson.variable} ${inter.variable} ${mono.variable}`} />;
}
