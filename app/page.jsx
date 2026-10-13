'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import Preloader from '@/components/Preloader/Preloader';
import LoopingVideo from '@/components/LoopingVideo/LoopingVideo';
import './Home.css';

const icon = {
	brand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.6"/></svg>',
	web: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3 9h18M6.5 7h.01M9.5 7h.01"/></svg>',
	graphic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 20l4-1 11-11-3-3L5 16l-1 4z"/></svg>',
	data: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18"/><path d="M7 20v-6M12 20V8M17 20v-10"/></svg>',
	business: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v9h9"/></svg>',
};

const bentoData = [
	{ c: 'p1 ink',     n: '01', id: 'brand', t: 'Brand Identity & Design', d: 'Logo, brand strategy, visual identity systems and rebranding.', i: icon.brand,
		img: '/images/services/brand_design.png',
		subs: ['Logo Design', 'Brand Strategy', 'Visual Identity Design', 'Rebranding'] },
	{ c: 'p2 coral',   n: '02', id: 'web', t: 'Web Design', d: 'Custom sites, landing pages, e-commerce and dashboard design.', i: icon.web,
		img: '/images/services/website_design.png',
		subs: ['Custom Website Design', 'Landing Page Design', 'E-commerce Design', 'Dashboard Design'] },
	{ c: 'p3 paper',   n: '03', id: 'graphic', t: 'Graphic Design', d: 'Brochures, posters, menus, presentations, event branding.', i: icon.graphic,
		img: '/images/services/graphic_design.png',
		subs: ['Brochures & Flyers', 'Posters & Banners', 'Menus & Catalogs', 'Business Presentations', 'Marketing Materials', 'Event Branding'] },
	{ c: 'p4 indigo',  n: '04', id: 'data', t: 'Data Analytics', d: 'Data pipelines, dashboards, reporting and performance tracking.', i: icon.data,
		subs: ['Data Dashboards', 'Reporting Automation', 'Performance Tracking', 'Data Visualization'] },
	{ c: 'p5 outline', n: '05', id: 'business', t: 'Business Analytics', d: 'Market research, KPI frameworks, and growth strategy insights.', i: icon.business,
		subs: ['Market Research', 'KPI Frameworks', 'Growth Strategy', 'Competitor Insights'] },
];

const techList = [
	{ name: 'Python', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c-1.5 0-3 .3-3 2v2.5h6V7H7.5C5.5 7 4 8.2 4 10.5v3C4 15.8 5.5 17 7.5 17H9v-2.3c0-2 1.7-3.7 3.7-3.7H17c1.8 0 3-1.2 3-3v-2C20 3.2 18.5 2 16.5 2H12z"/><path d="M12 22c1.5 0 3-.3 3-2v-2.5H9V17h4.5c2 0 3.5-1.2 3.5-3.5v-3c0-2.3-1.5-3.5-3.5-3.5H15v2.3c0 2-1.7 3.7-3.7 3.7H7c-1.8 0-3 1.2-3 3v2c0 1.8 1.5 3 3.5 3H12z"/><circle cx="8.5" cy="5" r=".6" fill="currentColor" stroke="none"/><circle cx="15.5" cy="19" r=".6" fill="currentColor" stroke="none"/></svg>' },
	{ name: 'PHP', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="9" ry="5.5"/><path d="M9 15V9h2.3c1.4 0 2.2.8 2.2 2s-.8 2-2.2 2H9"/></svg>' },
	{ name: 'WordPress', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M4.6 10l3 8.5M8.7 9.3L12 18.5m3.3-9.2l-2.2 6.2M19.4 10l-3.4 8.7M6 9h2.2M14 9h2.4"/></svg>' },
	{ name: 'Flutter', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M14.5 3L5 12.5 8.5 16 19 5.5h-7L14.5 3z"/><path d="M8.5 16L12 19.5h7l-6-6-4.5 4.5z"/></svg>' },
	{ name: 'Figma', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M9 3h3.5a2.5 2.5 0 010 5H9V3z"/><path d="M9 8h3.5a2.5 2.5 0 010 5H9V8z"/><path d="M9 13a2.5 2.5 0 100 5 2.5 2.5 0 000-5z"/><circle cx="14.5" cy="15.5" r="2.5"/></svg>' },
	{ name: 'Photoshop', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M7 16V8h2.3c1.5 0 2.4.9 2.4 2.2S10.8 12.4 9.3 12.4H7"/><path d="M13.5 16c1 .5 3 .5 3-1s-3-1-3-2.5 2-1.5 3-1"/></svg>' },
	{ name: 'Canva', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="12" r="9"/><circle cx="15" cy="12" r="4"/></svg>' },
];
const metrics = [ { v: 20, l: 'Projects' }, { v: 10, l: 'Clients' }, { v: 2700, l: 'Designs Delivered' }, { v: 5, l: 'Years' } ];
const process = [
	{ n: '01', t: 'Discover', d: 'Understanding your business, audience and goals.',
		icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-5.6-5.6"/></svg>' },
	{ n: '02', t: 'Define', d: 'Research, strategy and creative direction.',
		icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M9.3 12h5.4M9.3 15.5h5.4M9.3 8.5h3"/></svg>' },
	{ n: '03', t: 'Design', d: 'Turning ideas into impactful visual solutions.',
		icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14.3 3.7l6 6L9.7 20.3l-6.3.7.7-6.3 10.2-11z"/><path d="M12.7 5.3l6 6"/></svg>' },
	{ n: '04', t: 'Refine', d: 'Collaborating through feedback and iterations.',
		icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 0113.9-5.4M20 4v5h-5"/><path d="M20 12a8 8 0 01-13.9 5.4M4 20v-5h5"/></svg>' },
	{ n: '05', t: 'Grow', d: 'Ongoing creative support as your business evolves.',
		icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-9"/><path d="M15 6h6v6"/></svg>' },
];

export default function HomePage() {
	const dotRef = useRef(null);
	const labelRef = useRef(null);
	const [activePanel, setActivePanel] = useState(null);
	const [heroReady, setHeroReady] = useState(false);

	useEffect(() => {
		if (!activePanel) return;
		document.body.style.overflow = 'hidden';
		const onKey = (e) => { if (e.key === 'Escape') setActivePanel(null); };
		window.addEventListener('keydown', onKey);
		return () => {
			document.body.style.overflow = '';
			window.removeEventListener('keydown', onKey);
		};
	}, [activePanel]);

	useEffect(() => {
		const io = new IntersectionObserver((entries) => {
			entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
		}, { threshold: 0.12 });
		document.querySelectorAll('.home-page .reveal').forEach(el => io.observe(el));

		const counted = new Set();
		const cio = new IntersectionObserver((entries) => {
			entries.forEach(e => {
				if (e.isIntersecting && !counted.has(e.target)) {
					counted.add(e.target);
					e.target.querySelectorAll('.digit-strip').forEach(strip => {
						strip.style.transform = `translateY(-${strip.dataset.digit}em)`;
					});
				}
			});
		}, { threshold: 0.5 });
		document.querySelectorAll('.home-page .metric-num .digits').forEach(el => cio.observe(el));

		const pio = new IntersectionObserver((entries) => {
			entries.forEach(e => e.target.classList.toggle('active', e.isIntersecting));
		}, { threshold: 0.5 });
		document.querySelectorAll('.home-page .process-row').forEach(el => pio.observe(el));

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

		const hoverTargets = document.querySelectorAll('.home-page .panel');
		function onEnter(el) {
			dot.style.width = '34px'; dot.style.height = '34px'; dot.style.background = 'var(--coral)';
		}
		function onLeave() { label.classList.remove('show'); dot.style.opacity = 1; dot.style.width = '10px'; dot.style.height = '10px'; dot.style.background = 'var(--ink)'; }
		hoverTargets.forEach(el => { el.addEventListener('mouseenter', () => onEnter(el)); el.addEventListener('mouseleave', onLeave); });

		return () => {
			window.removeEventListener('mousemove', onMove);
			cancelAnimationFrame(raf);
		};
	}, []);

	return (
		<div className="home-page">
			<Preloader onExitStart={() => setHeroReady(true)} />
			<div className="cursor-dot" ref={dotRef}></div>
			<div className="cursor-label" ref={labelRef}></div>
			<svg className="grain" width="100%" height="100%">
				<filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" /></filter>
				<rect width="100%" height="100%" filter="url(#noiseFilter)" />
			</svg>

			<Header active="Home" />

			<section className="hero" id="home">
				<div className="hero-video-wrap" aria-hidden="true">
					<LoopingVideo
						src="/video/landing_page.mp4"
						className="hero-video"
						onError={(e) => console.error('hero video failed to load/decode:', e.currentTarget.error)}
					/>
					<div className="hero-video-scrim" />
				</div>

				<div className="hero-shapes" aria-hidden="true">
					<div className="hero-shape hero-shape-triangle"></div>
					<div className="hero-shape hero-shape-circle-outline"></div>
					<div className="hero-shape hero-shape-ring"></div>
					<div className="hero-shape hero-shape-circle-fill"></div>
					<div className="hero-swatch swatch-coral"><span className="swatch-dot"></span>Coral</div>
					<span className="hero-tag-pill tag-1">01 — Brand</span>

					<div className="hero-shape hero-shape-plus">+</div>
					<div className="hero-shape hero-shape-square-fill"></div>
					<div className="hero-swatch swatch-indigo"><span className="swatch-dot"></span>Indigo</div>
					<div className="hero-shape hero-shape-dash"></div>
					<div className="hero-shape hero-shape-square-outline"></div>
					<span className="hero-tag-pill tag-2">05 — Motion</span>
				</div>

				<div className="hero-content">
					<div className="hero-eyebrow reveal"><span>Brand · Web · Print · Motion</span></div>
					<h1 className={`hero-headline${heroReady ? ' hero-ready' : ''}`}>
						<span className="write-line" style={{ animationDelay: '0s' }}>We turn ideas into</span>
						<span className="write-line" style={{ animationDelay: '.55s' }}><span className="hero-script">visually stunning</span></span>
						<span className="write-line" style={{ animationDelay: '1.1s' }}>designs.</span>
					</h1>
					<p className="hero-subtext reveal">A creative studio that turns ambitious ideas into brands, sites, and campaigns people actually remember.</p>
					<div className="hero-cta-row reveal">
						<Link href="/contact" className="hero-btn-primary">Start a project →</Link>
						<Link href="/projects" className="hero-btn-secondary">View our work</Link>
					</div>
				</div>
			</section>

			<div className="marquee-wrap marquee-strip">
				<div className="marquee">
					{Array(2).fill(0).map((_, i) => (
						<span key={i}>Design<span className="x">—</span>Brand<span className="x">—</span>Creative<span className="x">—</span>Visual<span className="x">—</span>Strategy<span className="x">—</span>Graphic Design<span className="x">—</span></span>
					))}
				</div>
			</div>

			<section className="statement">
				<div><div className="big-num reveal">01 / MANIFESTO</div><h2 className="reveal">Design Beyond Aesthetics. Business Beyond Expectations.</h2></div>
				<div className="copy reveal reveal-delay-1"><p>We create brands, digital experiences, and visual communications that don&rsquo;t just look exceptional — they solve problems, build trust, and accelerate business growth. Every pixel, every interaction, and every detail is crafted with purpose, ensuring your brand stands out in an increasingly competitive world.</p></div>
			</section>

			<section className="wall" id="services">
				<div className="section-head">
					<div><div className="eyebrow reveal">What We Do</div><h2 className="reveal">Five disciplines. One studio.</h2></div>
					<div className="wall-note reveal">This wall is arranged the way we&rsquo;d arrange a client&rsquo;s — hierarchy, contrast, and restraint doing the talking.</div>
				</div>
				<div className="bento">
					{bentoData.map(item => {
						const cls = item.c.split(' ');
						return (
							<div
								key={item.n}
								className={`panel ${cls[0]} ${cls[1]} reveal`}
								role="button"
								tabIndex={0}
								aria-haspopup="dialog"
								aria-label={item.t}
								onClick={() => setActivePanel(item)}
								onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActivePanel(item); } }}
							>
								{item.img && <div className="panel-bg" style={{ backgroundImage: `url(${item.img})` }} />}
								<div className="panel-scrim" aria-hidden="true" />
								{!item.img && (
									<div className="panel-solid-content" aria-hidden="true">
										<div className="panel-solid-icon" dangerouslySetInnerHTML={{ __html: item.i }} />
										<div className="panel-solid-title">{item.t}</div>
									</div>
								)}
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
									<div className="p-num">{item.n}</div>
									<div className="p-icon" dangerouslySetInnerHTML={{ __html: item.i }} />
								</div>
								<span className="p-toggle" aria-hidden="true">+</span>
							</div>
						);
					})}
				</div>
				<div className="reveal view-all"><Link href="/services">View full services index →</Link></div>
			</section>

			{activePanel && (
				<div className="panel-modal" role="dialog" aria-modal="true" aria-labelledby="panel-modal-title" onClick={() => setActivePanel(null)}>
					<div className="panel-modal-card" onClick={(e) => e.stopPropagation()}>
						<button className="panel-modal-close" aria-label="Close" onClick={() => setActivePanel(null)}>×</button>
						<div className="panel-modal-icon" dangerouslySetInnerHTML={{ __html: activePanel.i }} />
						<div className="panel-modal-num">{activePanel.n} / 05</div>
						<h3 id="panel-modal-title" className="panel-modal-title">{activePanel.t}</h3>
						<p className="panel-modal-desc">{activePanel.d}</p>
						<div className="panel-modal-subs">
							{activePanel.subs.map(s => <span key={s} className="panel-modal-pill">{s}</span>)}
						</div>
						<Link href={`/services#${activePanel.id}`} className="panel-modal-link">View full service details →</Link>
					</div>
				</div>
			)}

			<section className="tech">
				<div className="eyebrow reveal">Technology, Perfectly Executed</div>
				<div className="tech-row">
					{techList.map((t, i) => (
						<div key={t.name} className="tech-pill" style={{ animationDelay: `${i * 0.15}s` }}>
							<span className="tech-icon" dangerouslySetInnerHTML={{ __html: t.icon }} />
							<span className="tech-name">{t.name}</span>
						</div>
					))}
				</div>
			</section>

			<section className="metrics">
				<div className="eyebrow reveal">The Metrics</div>
				<div className="metrics-grid">
					{metrics.map(m => (
						<div key={m.l} className="metric reveal">
							<div className="metric-num">
								<span className="digits">
									{String(m.v).split('').map((d, i) => (
										<span key={i} className="digit-reel">
											<span className="digit-strip" data-digit={d}>
												{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => <span key={n}>{n}</span>)}
											</span>
										</span>
									))}
								</span>
								<span className="plus">+</span>
							</div>
							<div className="metric-label">{m.l}</div>
						</div>
					))}
				</div>
			</section>

			<section className="process">
				<div className="process-wrap">
					<div className="process-intro">
						<div className="eyebrow reveal">How We Work</div>
						<h2 className="reveal">Our Design Process</h2>
						<p className="process-lead reveal">A clear, collaborative path from first conversation to finished work — five steps, no guesswork.</p>
						<div className="process-dots reveal" aria-hidden="true" />
						<div className="process-ring" aria-hidden="true" />
					</div>
					<div className="process-list">
						{process.map((p, i) => (
							<div key={p.n} className="process-row reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
								<div className="process-badge">{p.n}</div>
								<div className="process-icon" dangerouslySetInnerHTML={{ __html: p.icon }} />
								<div className="process-body">
									<h3 className="process-title">{p.t}</h3>
									<p className="process-desc">{p.d}</p>
								</div>
								<span className="process-arrow" aria-hidden="true">
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
								</span>
							</div>
						))}
					</div>
				</div>
			</section>

			<Footer />
		</div>
	);
}
