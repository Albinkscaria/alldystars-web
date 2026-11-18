'use client';

import { useEffect, useRef } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import FoundersChronicle from './FoundersChronicle';
import './About.css';

export default function AboutContent({ fontClassName }) {
	const dotRef = useRef(null);
	const labelRef = useRef(null);

	useEffect(() => {
		const io = new IntersectionObserver((entries) => {
			entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
		}, { threshold: 0.12 });
		document.querySelectorAll('.about-page .reveal').forEach(el => io.observe(el));

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

		const hoverTargets = document.querySelectorAll('.about-page .cta-block');
		function onEnter() { label.textContent = 'SEND'; label.classList.add('show'); dot.style.opacity = 0; }
		function onLeave() { label.classList.remove('show'); dot.style.opacity = 1; dot.style.width = '10px'; dot.style.height = '10px'; dot.style.background = 'var(--ink)'; }
		hoverTargets.forEach(el => { el.addEventListener('mouseenter', onEnter); el.addEventListener('mouseleave', onLeave); });

		return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
	}, []);

	return (
		<div className="about-page">
			<div className="cursor-dot" ref={dotRef}></div>
			<div className="cursor-label" ref={labelRef}></div>

			<Header active="About" />

			<section className="page-hero">
				<div className="eyebrow reveal">About Us</div>
				<h1 className="reveal">We are<br /><span className="script">alldystars</span></h1>
				<div className="studio-badge-row reveal reveal-delay-1">
					<div className="studio-glow" aria-hidden="true"></div>
					<div className="info-badges">
						<span className="info-badge">5+ Years</span>
						<span className="info-badge">10+ Clients</span>
						<span className="info-badge">20+ Projects</span>
					</div>
				</div>
			</section>

			<section className="statement">
				<div className="big-num reveal">01 / Who We Are</div>
				<h2 className="reveal">Passionate about turning ideas into meaningful work.</h2>
				<p className="copy reveal reveal-delay-1">
					<strong>We are a team of passionate designers, creative thinkers, and problem-solvers dedicated to transforming ideas into meaningful visual experiences. Whether it&rsquo;s crafting a unique brand identity, designing a modern website, or creating impactful marketing materials, our goal is to deliver{' '}work that inspires confidence and drives results.</strong>
					{' '}Our vision extends beyond client projects — AlldyStars is evolving into a creative brand that introduces design products, templates and digital assets for businesses and creators worldwide.
				</p>
			</section>

			<div className="vision-quote reveal">We believe every great idea deserves exceptional design.</div>

			<FoundersChronicle className={fontClassName} />

			<div className="cta-block reveal">
				<h2>Begin your ALLDYSTARS<br />Experience Now</h2>
				<div className="quote">Ideas become impact when shaped with purpose.</div>
				<a href="/contact" className="cta-btn">Get In Touch →</a>
			</div>

			<Footer />
		</div>
	);
}
