'use client';

import { useEffect, useRef } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import './Services.css';

const icon = {
	brand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.6"/></svg>',
	web: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3 9h18M6.5 7h.01M9.5 7h.01"/></svg>',
	graphic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M4 20l4-1 11-11-3-3L5 16l-1 4z"/></svg>',
	product: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/></svg>',
	motion: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="12" cy="12" r="9"/><path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none"/></svg>',
	illus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="8" cy="8" r="3"/><path d="M2 20l6-8 4 5 3-4 7 7"/></svg>',
	consult: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>',
};

const categories = [
	{ id: 'brand', n: '01', t: 'Brand Identity & Design', icon: icon.brand,
		d: 'Build a brand people remember. Everything your business needs to establish a distinctive and professional identity.',
		subs: ['Logo Design', 'Brand Strategy', 'Visual Identity Design', 'Rebranding'] },
	{ id: 'web', n: '02', t: 'Website Design', icon: icon.web,
		d: 'Where clean interfaces meet exceptional user experience. Designing digital products that are intuitive, engaging, and built to perform.',
		subs: ['Custom Website Design', 'Landing Page Design', 'E-commerce Design', 'Dashboard Design'] },
	{ id: 'graphic', n: '03', t: 'Graphic Design', icon: icon.graphic,
		d: 'Design that speaks before words do. Visual storytelling that strengthens marketing and communication.',
		subs: ['Brochures & Flyers', 'Posters & Banners', 'Menus & Catalogs', 'Business Presentations', 'Marketing Materials', 'Event Branding'] },
	{ id: 'product', n: '04', t: 'Product & Packaging Design', icon: icon.product,
		d: 'Design that wins attention on every shelf. Helping products create unforgettable first impressions.',
		subs: ['Product Packaging', 'Label Design', 'Box & Carton Design', 'Product Mockups', 'Retail Packaging'] },
	{ id: 'motion', n: '05', t: 'Motion Graphics & Interactive Design', icon: icon.motion,
		d: 'Bringing ideas to life through motion. Dynamic visuals that capture attention and improve engagement.',
		subs: ['Motion Graphics', 'Video Editing', 'Logo Animation', 'Animated Presentations'] },
	{ id: 'illustration', n: '06', t: 'Illustration & Visual Assets', icon: icon.illus,
		d: 'Custom artwork that makes your brand unmistakable. Unique visuals designed exclusively for your business.',
		subs: ['Custom Artwork', 'Character Design', 'Vector Artwork', 'Digital Artwork'] },
	{ id: 'consulting', n: '07', t: 'Creative Consulting', icon: icon.consult,
		d: 'Outside perspective when you need it. Structured feedback and direction that sharpens decisions before you commit budget.',
		subs: ['Design Audits', 'Brand Workshops', 'UX Reviews', 'Competitor Analysis', 'Visual Direction'] },
];

export default function ServicesPage() {
	const dotRef = useRef(null);
	const labelRef = useRef(null);

	useEffect(() => {
		const io = new IntersectionObserver((entries) => {
			entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
		}, { threshold: 0.12 });
		document.querySelectorAll('.services-page .reveal').forEach(el => io.observe(el));

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

		const hoverTargets = document.querySelectorAll('.services-page .cta-block, .services-page .sub-pill');
		function onEnter(el) {
			if (el.classList.contains('cta-block')) { label.textContent = 'SEND'; label.classList.add('show'); dot.style.opacity = 0; }
			else { dot.style.width = '28px'; dot.style.height = '28px'; dot.style.background = 'var(--coral)'; }
		}
		function onLeave() { label.classList.remove('show'); dot.style.opacity = 1; dot.style.width = '10px'; dot.style.height = '10px'; dot.style.background = 'var(--ink)'; }
		hoverTargets.forEach(el => { el.addEventListener('mouseenter', () => onEnter(el)); el.addEventListener('mouseleave', onLeave); });

		return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
	}, []);

	return (
		<div className="services-page">
			<div className="cursor-dot" ref={dotRef}></div>
			<div className="cursor-label" ref={labelRef}></div>
			<svg className="grain" width="100%" height="100%">
				<filter id="noiseFilter2"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" /></filter>
				<rect width="100%" height="100%" filter="url(#noiseFilter2)" />
			</svg>

			<Header active="Services" />

			<section className="page-hero">
				<div className="eyebrow reveal">Services — Full Index</div>
				<h1 className="reveal">Every way we turn <span className="script">ideas</span> into work you can ship.</h1>
				<p className="reveal">Seven disciplines, each broken down into the exact deliverables you can brief us on. No package tiers, no guesswork — pick a category, see what&rsquo;s inside.</p>
				<div className="index-nav reveal">
					{categories.map(c => <a key={c.id} href={`#${c.id}`}>{c.n} {c.t}</a>)}
				</div>
			</section>

			{categories.map(cat => (
				<section key={cat.id} id={cat.id} className="category">
					<div className="cat-left reveal">
						<div className="cat-num">{cat.n} / {String(categories.length).padStart(2, '0')}</div>
						<div className="cat-icon" dangerouslySetInnerHTML={{ __html: cat.icon }} />
						<h2 className="cat-title">{cat.t}</h2>
						<p className="cat-desc">{cat.d}</p>
					</div>
					<div className="subgrid reveal">
						{cat.subs.map(s => <span key={s} className="sub-pill">{s}</span>)}
					</div>
				</section>
			))}

			<div className="cta-block reveal">
				<h2>Design with<br />ALLDYSTARS</h2>
				<div className="quote">Ideas become impact when shaped with purpose.</div>
				<a href="mailto:hello@alldystars.com" className="cta-btn">Start a Project →</a>
			</div>

			<Footer />
		</div>
	);
}
