import '@fontsource/open-sauce-sans/500.css';
import '@fontsource/open-sauce-sans/600.css';
import '@fontsource/open-sauce-sans/700.css';
import './globals.css';

export const metadata = {
	title: 'alldystars — Design Beyond Aesthetics',
	description: 'We turn ideas into visually stunning designs. Brand identity, web design, graphic design, packaging, illustration, motion and creative consulting.',
};

export default function RootLayout({ children }) {
	return (
		<html lang="en" data-scroll-behavior="smooth">
			<body>{children}</body>
		</html>
	);
}
