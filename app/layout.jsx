import './globals.css';

export const metadata = {
	title: 'alldystars — Design Beyond Aesthetics',
	description: 'We turn ideas into visually stunning designs. Brand identity, web design, graphic design, packaging, illustration, motion and creative consulting.',
};

export default function RootLayout({ children }) {
	return (
		<html lang="en" data-scroll-behavior="smooth">
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
				<link
					href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400&family=Inter:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&family=Petit+Formal+Script&display=swap"
					rel="stylesheet"
				/>
			</head>
			<body>{children}</body>
		</html>
	);
}
