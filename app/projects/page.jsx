'use client';

import { useEffect, useRef } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import './Projects.css';

const slots = [
	{ n: '01', tag: 'Brand Identity' },
	{ n: '02', tag: 'Web Design' },
	{ n: '03', tag: 'Packaging' },
	{ n: '04', tag: 'Motion & Interactive' },
];

export default function ProjectsPage() {
	const dotRef = useRef(null);
	const labelRef = useRef(null);

	useEffect(() => {
		const io = new IntersectionObserver((entries) => {
			entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
		}, { threshold: 0.12 });
		document.querySelectorAll('.projects-page .reveal').forEach(el => io.observe(el));

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

		return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
	}, []);

	return (
		<div className="projects-page">
			<div className="cursor-dot" ref={dotRef}></div>
			<div className="cursor-label" ref={labelRef}></div>

			<Header active="Work" />

			<section className="page-hero">
				<div className="eyebrow reveal">Selected Work</div>
				<h1 className="reveal">Projects</h1>
				<p className="reveal">Real case studies land here as they ship — large images, category tags, and captions per project. Nothing below is invented client work.</p>
			</section>

			<div className="slot-grid">
				{slots.map(s => (
					<div key={s.n} className="slot reveal">
						<span className="num">{s.n}</span>
						<div>
							<div className="label">Case study coming soon</div>
							<span className="tag">{s.tag}</span>
						</div>
					</div>
				))}
			</div>

			<div className="note reveal">
				<p>Each slot above is sized and ready for a hero image, project title, and category tags — swap the placeholder content for real work in <code>app/projects/page.jsx</code> once assets are ready.</p>
			</div>

			<div className="cta-block reveal">
				<h2>Have a project<br />in mind?</h2>
				<div className="quote">Ideas become impact when shaped with purpose.</div>
				<a href="/contact" className="cta-btn">Start a Project →</a>
			</div>

			<Footer />
		</div>
	);
}
