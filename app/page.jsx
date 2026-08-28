'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import './Home.css';

const icon = {
	brand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.6"/></svg>',
	web: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3 9h18M6.5 7h.01M9.5 7h.01"/></svg>',
	graphic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 20l4-1 11-11-3-3L5 16l-1 4z"/></svg>',
	product: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/></svg>',
	illus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="3"/><path d="M2 20l6-8 4 5 3-4 7 7"/></svg>',
	motion: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="12" r="9"/><path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none"/></svg>',
	consult: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>',
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
	{ c: 'p4 indigo',  n: '04', id: 'product', t: 'Product & Packaging', d: 'Packaging, labels, cartons, mockups, retail design.', i: icon.product,
		img: '/images/services/product_and_packaging_design.png',
		subs: ['Product Packaging', 'Label Design', 'Box & Carton Design', 'Product Mockups', 'Retail Packaging'] },
	{ c: 'p5 outline', n: '05', id: 'illustration', t: 'Illustration & Visual Assets', d: 'Custom artwork, character design, vector & digital art.', i: icon.illus,
		img: '/images/services/illustation_and_visual_effects.png',
		subs: ['Custom Artwork', 'Character Design', 'Vector Artwork', 'Digital Artwork'] },
	{ c: 'p6 paper',   n: '06', id: 'motion', t: 'Motion & Interactive', d: 'Motion graphics, video editing, logo animation.', i: icon.motion,
		img: '/images/services/motion_graphics_and_interactive_design.png',
		subs: ['Motion Graphics', 'Video Editing', 'Logo Animation', 'Animated Presentations'] },
	{ c: 'p7 ink',     n: '07', id: 'consulting', t: 'Creative Consulting', d: 'Design audits, brand workshops, UX reviews, visual direction.', i: icon.consult,
		img: '/images/services/creative_consulting.png',
		subs: ['Design Audits', 'Brand Workshops', 'UX Reviews', 'Competitor Analysis', 'Visual Direction'] },
];

const techList = ['Python', 'PHP', 'WordPress', 'Flutter', 'Figma', 'Photoshop', 'Canva'];
const metrics = [ { v: 20, l: 'Projects' }, { v: 10, l: 'Clients' }, { v: 2700, l: 'Designs Delivered' }, { v: 5, l: 'Years' } ];
const process = [
	{ n: '01', t: 'Discover', d: 'Understanding your business, audience and goals.' },
	{ n: '02', t: 'Define', d: 'Research, strategy and creative direction.' },
	{ n: '03', t: 'Design', d: 'Turning ideas into impactful visual solutions.' },
	{ n: '04', t: 'Refine', d: 'Collaborating through feedback and iterations.' },
	{ n: '05', t: 'Grow', d: 'Ongoing creative support as your business evolves.' },
];

export default function HomePage() {
	const dotRef = useRef(null);
	const labelRef = useRef(null);
	const [activePanel, setActivePanel] = useState(null);

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
					const target = parseInt(e.target.dataset.target, 10);
					const dur = 1400, start = performance.now();
					function tick(now) {
						const p = Math.min(1, (now - start) / dur);
						const eased = 1 - Math.pow(1 - p, 3);
						e.target.textContent = Math.floor(eased * target);
						if (p < 1) requestAnimationFrame(tick); else e.target.textContent = target;
					}
					requestAnimationFrame(tick);
				}
			});
		}, { threshold: 0.5 });
		document.querySelectorAll('.home-page .count').forEach(el => cio.observe(el));

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

		const hoverTargets = document.querySelectorAll('.home-page .work-teaser, .home-page .cta-block, .home-page .panel');
		function onEnter(el) {
			if (el.classList.contains('work-teaser')) { label.textContent = 'VIEW'; label.classList.add('show'); dot.style.opacity = 0; }
			else if (el.classList.contains('cta-block')) { label.textContent = 'SEND'; label.classList.add('show'); dot.style.opacity = 0; }
			else { dot.style.width = '34px'; dot.style.height = '34px'; dot.style.background = 'var(--coral)'; }
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
			<div className="cursor-dot" ref={dotRef}></div>
			<div className="cursor-label" ref={labelRef}></div>
			<svg className="grain" width="100%" height="100%">
				<filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" /></filter>
				<rect width="100%" height="100%" filter="url(#noiseFilter)" />
			</svg>

			<Header active="Home" />

			<section className="hero" id="home">
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
					<h1 className="hero-headline reveal">We turn ideas into <span className="hero-script">visually stunning</span> designs.</h1>
					<p className="hero-subtext reveal">A creative studio that turns ambitious ideas into brands, sites, and campaigns people actually remember.</p>
					<div className="hero-cta-row reveal">
						<Link href="/#contact" className="hero-btn-primary">Start a project →</Link>
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
					<div><div className="eyebrow reveal">What We Do</div><h2 className="reveal">Seven disciplines. One studio.</h2></div>
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
						<div className="panel-modal-num">{activePanel.n} / 07</div>
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
					{techList.map(t => <div key={t} className="tech-pill">{t}</div>)}
				</div>
			</section>

			<section className="metrics">
				<div className="eyebrow reveal">The Metrics</div>
				<div className="metrics-grid">
					{metrics.map(m => (
						<div key={m.l} className="metric reveal">
							<div className="metric-num"><span className="count" data-target={m.v}>0</span><span className="plus">+</span></div>
							<div className="metric-label">{m.l}</div>
						</div>
					))}
				</div>
			</section>

			<section className="process">
				<div className="section-head"><div><div className="eyebrow reveal">How We Work</div><h2 className="reveal">Our Design Process</h2></div></div>
				{process.map(p => (
					<div key={p.n} className="process-row reveal">
						<div className="process-num">{p.n}</div>
						<div><h3 className="process-title">{p.t}</h3><p className="process-desc">{p.d}</p></div>
					</div>
				))}
			</section>

			<section className="industries">
				<div className="industries-inner">
					<div className="eyebrow on-dark" style={{ padding: '0 5vw', marginBottom: 24 }}>Industries We Work For</div>
					<div className="marquee-wrap">
						<div className="marquee reverse">
							{Array(2).fill(0).map((_, i) => (
								<span key={i}>Startups<span className="dash">/</span>SaaS<span className="dash">/</span>Technology<span className="dash">/</span>Healthcare<span className="dash">/</span>Education<span className="dash">/</span>Real Estate<span className="dash">/</span>Hospitality<span className="dash">/</span>Retail<span className="dash">/</span>ECommerce<span className="dash">/</span>Finance<span className="dash">/</span>Manufacturing<span className="dash">/</span>Professional Services<span className="dash">/</span></span>
							))}
						</div>
					</div>
				</div>
			</section>

			<section id="work">
				<div className="work-teaser reveal">
					<div className="slash"></div>
					<div className="eyebrow on-dark" style={{ marginBottom: 20 }}>Selected Work</div>
					<h2>See the full<br />portfolio.</h2>
					<p>Case studies land on their own page — real project work as it ships, not invented client stories.</p>
					<Link href="/projects">View Projects →</Link>
				</div>
			</section>

			<section className="testimonials">
				<div className="section-head"><div><div className="eyebrow reveal">Testimonials</div><h2 className="reveal">What clients say</h2></div></div>
				<div className="t-track">
					<div className="t-card glass-dark reveal">
						<p className="t-quote">&ldquo;We shape memorable brands with thoughtful visual systems — logos, color languages, type hierarchy, brand voices that connect emotionally.&rdquo;</p>
						<div><div className="t-name">Tom James</div><div className="t-role">Founder &amp; CEO, FreshFoods</div></div>
					</div>
				</div>
			</section>

			<div className="cta-block reveal" id="contact">
				<h2>Begin your ALLDYSTARS<br />Experience Now</h2>
				<div className="quote">Ideas become impact when shaped with purpose.</div>
				<a href="mailto:hello@alldystars.com" className="cta-btn">Email Us →</a>
			</div>

			<Footer />
		</div>
	);
}
