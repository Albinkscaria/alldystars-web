'use client';

import { useEffect, useRef } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import './Services.css';

const icon = {
	brand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.6"/></svg>',
	web: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3 9h18M6.5 7h.01M9.5 7h.01"/></svg>',
	graphic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M4 20l4-1 11-11-3-3L5 16l-1 4z"/></svg>',
	data: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18"/><path d="M7 20v-6M12 20V8M17 20v-10"/></svg>',
	business: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v9h9"/></svg>',
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
	{ id: 'data', n: '04', t: 'Data Analytics', icon: icon.data,
		d: 'Turn raw numbers into direction. Dashboards and reporting that show you what’s working and what to fix next.',
		subs: ['Data Dashboards', 'Reporting Automation', 'Performance Tracking', 'Data Visualization'] },
	{ id: 'business', n: '05', t: 'Business Analytics', icon: icon.business,
		d: 'Decisions backed by evidence, not guesswork. Market and performance insight that sharpens strategy before you spend.',
		subs: ['Market Research', 'KPI Frameworks', 'Growth Strategy', 'Competitor Insights'] },
];

export default function ServicesPage() {
	const dotRef = useRef(null);
	const labelRef = useRef(null);

	useEffect(() => {
		const video = document.querySelector('.page-hero-video');
		if (video) {
			if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
				video.pause();
				video.removeAttribute('autoplay');
			} else {
				const p = video.play();
				if (p && typeof p.catch === 'function') {
					p.catch((err) => console.warn('services hero video autoplay was blocked:', err));
				}
			}
		}

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
				<div className="page-hero-video-wrap" aria-hidden="true">
					<video
						className="page-hero-video"
						autoPlay
						muted
						loop
						playsInline
						preload="auto"
						onError={(e) => console.error('services hero video failed to load/decode:', e.currentTarget.error)}
					>
						<source src="/video/service_page.mp4" type="video/mp4" />
					</video>
					<div className="page-hero-video-scrim" />
				</div>

				<div className="eyebrow reveal">Services — Full Index</div>
				<h1>
					<span className="write-line" style={{ animationDelay: '0s' }}>Every way we turn</span>
					<span className="write-line" style={{ animationDelay: '.55s' }}><span className="script">ideas</span> into work</span>
					<span className="write-line" style={{ animationDelay: '1.1s' }}>you can ship.</span>
				</h1>
				<p className="reveal">Five disciplines, each broken down into the exact deliverables you can brief us on. No package tiers, no guesswork — pick a category, see what&rsquo;s inside.</p>
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
