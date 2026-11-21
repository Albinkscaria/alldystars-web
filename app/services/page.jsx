'use client';

import { useEffect, useRef } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import HeroDotPrint from '@/components/HeroDotPrint';
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

	useEffect(() => {
		const io = new IntersectionObserver((entries) => {
			entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
		}, { threshold: 0.12 });
		document.querySelectorAll('.services-page .reveal').forEach(el => io.observe(el));

		const dot = dotRef.current;
		let mx = 0, my = 0, dx = 0, dy = 0, raf;
		function onMove(e) { mx = e.clientX; my = e.clientY; }
		window.addEventListener('mousemove', onMove);
		function loop() {
			dx += (mx - dx) * 0.35; dy += (my - dy) * 0.35;
			if (dot) { dot.style.left = dx + 'px'; dot.style.top = dy + 'px'; }
			raf = requestAnimationFrame(loop);
		}
		loop();

		return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
	}, []);

	return (
		<div className="services-page">
			<div className="cursor-dot" ref={dotRef}></div>
			<svg className="grain" width="100%" height="100%">
				<filter id="noiseFilter2"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" /></filter>
				<rect width="100%" height="100%" filter="url(#noiseFilter2)" />
			</svg>

			<Header active="Services" />

			{/* dot-matrix hero (replaced the background video); the index links jump to each artboard below */}
			<HeroDotPrint
				className={mono.variable}
				eyebrow="Services — Full Index"
				titleTop="Every way we turn"
				titleScript="ideas into work"
				scriptWidth={9.02}
				titleBottom="you can ship."
				lede="Five disciplines, each broken down into the exact deliverables you can brief us on. No package tiers, no guesswork — pick a category, see what’s inside."
				primary={null}
				secondary={null}
			>
				<nav className="index-nav" aria-label="Services">
					{categories.map(c => <a key={c.id} href={`#${c.id}`} onClick={() => { if (window.location.hash === `#${c.id}`) window.dispatchEvent(new HashChangeEvent('hashchange')); }}>{c.n} {c.t}</a>)}
				</nav>
			</HeroDotPrint>

			{/* the five disciplines as a live design canvas, pinned and scrubbed by scroll;
			    the index links above (#brand, #web, …) jump to each artboard */}
			<ServicesCanvas className={`${crimson.variable} ${inter.variable} ${mono.variable}`} />

			<Footer />
		</div>
	);
}
