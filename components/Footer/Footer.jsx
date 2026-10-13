import Link from 'next/link';
import FloatingDock from '@/components/FloatingDock/FloatingDock';

const socialLinks = [
	{
		title: 'Instagram',
		href: 'https://instagram.com/alldystars',
		icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/></svg>',
	},
	{
		title: 'LinkedIn',
		href: '#',
		icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="7.5" cy="6.8" r="0.9" fill="currentColor" stroke="none"/><line x1="7.5" y1="10" x2="7.5" y2="16.5"/><path d="M11 16.5v-4c0-1.4 1-2.4 2.3-2.4S15.5 11.1 15.5 12.5v4"/><line x1="11" y1="10" x2="11" y2="16.5"/></svg>',
	},
];

export default function Footer() {
	return (
		<footer className="site-footer">
			<div className="footer-top">
				<div className="footer-links">
					<Link href="/">Home</Link>
					<Link href="/projects">Work</Link>
					<Link href="/services">Services</Link>
					<Link href="/about">About</Link>
					<Link href="/contact">Contact</Link>
				</div>
				<div className="footer-social">
					<FloatingDock items={socialLinks} />
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
