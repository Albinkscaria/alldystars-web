'use client';

import { useEffect, useRef } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import LoopingVideo from '@/components/LoopingVideo/LoopingVideo';
import ServicesCanvas from '@/components/ServicesCanvas';
import { crimson, inter, mono } from '../fonts';
import './Services.css';

// hero index; each id is a /services#<id> deep link into the canvas below
// (see `id` in components/ServicesCanvas/services.js)
const categories = [
	{ id: 'brand', n: '01', t: 'Brand Identity & Design' },
	{ id: 'web', n: '02', t: 'Website Design' },
	{ id: 'graphic', n: '03', t: 'Graphic Design' },
	{ id: 'data', n: '04', t: 'Data Analytics' },
	{ id: 'business', n: '05', t: 'Business Analytics' },
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

		const hoverTargets = document.querySelectorAll('.services-page .cta-block');
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
					<LoopingVideo
						src="/video/service_page.mp4"
						className="page-hero-video"
						onError={(e) => console.error('services hero video failed to load/decode:', e.currentTarget.error)}
					/>
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
					{categories.map(c => <a key={c.id} href={`#${c.id}`} onClick={() => { if (window.location.hash === `#${c.id}`) window.dispatchEvent(new HashChangeEvent('hashchange')); }}>{c.n} {c.t}</a>)}
				</div>
			</section>

			{/* the five disciplines as a live design canvas, pinned and scrubbed by scroll;
			    the index links above (#brand, #web, …) jump to each artboard */}
			<ServicesCanvas className={`${crimson.variable} ${inter.variable} ${mono.variable}`} />

			<div className="cta-block reveal">
				<h2>Design with<br />ALLDYSTARS</h2>
				<div className="quote">Ideas become impact when shaped with purpose.</div>
				<a href="/contact" className="cta-btn">Start a Project →</a>
			</div>

			<Footer />
		</div>
	);
}
