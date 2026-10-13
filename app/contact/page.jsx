'use client';

import { useEffect, useRef } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import FloatingDock from '@/components/FloatingDock/FloatingDock';
import './Contact.css';

const icon = {
	email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
	pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-7.4 7-12a7 7 0 10-14 0c0 4.6 7 12 7 12z"/><circle cx="12" cy="9" r="2.4"/></svg>',
	clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.4 2"/></svg>',
};

const methods = [
	{ id: 'email', label: 'Email', value: 'hello@alldystars.com', href: 'mailto:hello@alldystars.com', icon: icon.email },
	{ id: 'studio', label: 'Studio', value: 'Kottayam, Kerala', href: null, icon: icon.pin },
	{ id: 'hours', label: 'Response Time', value: 'Within 24 hours', href: null, icon: icon.clock },
];

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

export default function ContactPage() {
	const dotRef = useRef(null);
	const labelRef = useRef(null);

	useEffect(() => {
		const io = new IntersectionObserver((entries) => {
			entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
		}, { threshold: 0.12 });
		document.querySelectorAll('.contact-page .reveal').forEach(el => io.observe(el));

		const dot = dotRef.current, label = labelRef.current;
		let mx = 0, my = 0, dx = 0, dy = 0, raf;
		function onMove(e) { mx = e.clientX; my = e.clientY; }
		window.addEventListener('mousemove', onMove);
		function loop() {
			dx += (mx - dx) * 0.35; dy += (my - dy) * 0.35;
			if (dot) { dot.style.left = dx + 'px'; dot.style.top = dy + 'px'; }
			if (label) { label.style.left = mx + 'px'; label.style.top = my + 'px'; }
			raf = requestAnimationFrame(loop);
		}
		loop();

		const hoverTargets = document.querySelectorAll('.contact-page .cta-block, .contact-page .contact-card');
		function onEnter(el) {
			if (el.classList.contains('cta-block')) { label.textContent = 'SEND'; label.classList.add('show'); dot.style.opacity = 0; }
			else { dot.style.width = '28px'; dot.style.height = '28px'; dot.style.background = 'var(--coral)'; }
		}
		function onLeave() { label.classList.remove('show'); dot.style.opacity = 1; dot.style.width = '10px'; dot.style.height = '10px'; dot.style.background = 'var(--ink)'; }
		hoverTargets.forEach(el => { el.addEventListener('mouseenter', () => onEnter(el)); el.addEventListener('mouseleave', onLeave); });

		return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
	}, []);

	return (
		<div className="contact-page">
			<div className="cursor-dot" ref={dotRef}></div>
			<div className="cursor-label" ref={labelRef}></div>
			<svg className="grain" width="100%" height="100%">
				<filter id="noiseFilter3"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" /></filter>
				<rect width="100%" height="100%" filter="url(#noiseFilter3)" />
			</svg>

			<Header active="Contact" />

			<section className="page-hero">
				<div className="eyebrow reveal">Get In Touch</div>
				<h1 className="reveal">Let&rsquo;s build something <span className="script">remarkable</span></h1>
				<p className="reveal">Have a project in mind, or just want to say hello? Tell us a little about what you&rsquo;re working on — we read every message and reply ourselves, usually within a day.</p>
			</section>

			<section className="contact-methods">
				<div className="contact-grid">
					{methods.map((m, i) => {
						const Tag = m.href ? 'a' : 'div';
						return (
							<Tag key={m.id} href={m.href || undefined} className={`contact-card reveal${i ? ' reveal-delay-1' : ''}`}>
								<div className="contact-icon" dangerouslySetInnerHTML={{ __html: m.icon }} />
								<div className="contact-label">{m.label}</div>
								<div className="contact-value">{m.value}</div>
							</Tag>
						);
					})}
				</div>
			</section>

			<div className="cta-block reveal">
				<h2>Ready to start<br />your project?</h2>
				<div className="quote">Ideas become impact when shaped with purpose.</div>
				<a href="mailto:hello@alldystars.com" className="cta-btn">Say hello →</a>
				<div className="contact-social"><FloatingDock items={socialLinks} /></div>
			</div>

			<Footer />
		</div>
	);
}
