import Link from 'next/link';

export default function Footer() {
	return (
		<footer className="site-footer">
			<div className="footer-top">
				<div className="footer-links">
					<Link href="/">Home</Link>
					<Link href="/projects">Work</Link>
					<Link href="/services">Services</Link>
					<Link href="/about">About</Link>
					<Link href="/#contact">Contact</Link>
				</div>
				<div className="footer-social">
					<a href="https://instagram.com/alldystars" target="_blank" rel="noopener noreferrer">Instagram</a>
					<a href="#" target="_blank" rel="noopener noreferrer">LinkedIn</a>
				</div>
			</div>
			<div className="footer-quote">Ideas become impact when shaped with purpose.</div>
			<div className="footer-word">ALLDYSTARS</div>
			<div className="footer-bottom">
				<a href="#">Privacy Policy</a>
				<span>© 2026 alldystars. All Rights Reserved.</span>
			</div>
		</footer>
	);
}
