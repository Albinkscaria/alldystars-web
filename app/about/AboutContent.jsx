'use client';

import { useEffect, useRef } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import './About.css';

const founders = [
	{
		init: 'JS',
		name: 'Joyal K Scaria',
		role: 'Co-Founder & Creative Director',
		bio: 'An award-winning artist, graphic designer, and creative director with a passion for transforming ideas into meaningful visual experiences. With a background in Information Technology & Data Analysis and years of experience in Art & Design, Joyal combines technical knowledge with artistic thinking to create solutions that are both visually compelling and strategically effective.',
	},
	{
		init: 'AS',
		name: 'Albin K Scaria',
		role: 'Co-Founder & Developer',
		bio: 'Leads the development side of the studio — building the technical foundation that turns AlldyStars’ creative work into fast, functional, production-ready digital experiences.',
	},
];

export default function AboutContent() {
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
				<h1 className="reveal">We are <span className="script">alldystars</span></h1>
				<div className="studio-badge-row reveal reveal-delay-1">
					<div className="studio-glow" aria-hidden="true"></div>
					<div className="studio-frame glass">Studio — Kottayam, Kerala</div>
					<div className="info-badges">
						<span className="info-badge glass">5+ Years</span>
						<span className="info-badge glass">10+ Clients</span>
						<span className="info-badge glass">20+ Projects</span>
					</div>
				</div>
			</section>

			<section className="statement">
				<div className="statement-head">
					<div className="big-num reveal">01 / Who We Are</div>
					<h2 className="reveal">Passionate about turning ideas into meaningful work.</h2>
				</div>
				<div className="copy">
					<p className="reveal">We are a team of passionate designers, creative thinkers, and problem-solvers dedicated to transforming ideas into meaningful visual experiences.</p>
					<p className="reveal reveal-delay-1">Whether it&rsquo;s crafting a unique brand identity, designing a modern website, or creating impactful marketing materials, our goal is to deliver work that inspires confidence and drives results.</p>
					<p className="reveal reveal-delay-2">Our vision extends beyond client projects — AlldyStars is evolving into a creative brand that introduces design products, templates and digital assets for businesses and creators worldwide.</p>
				</div>
			</section>

			<div className="vision-quote reveal">We believe every great idea deserves exceptional design.</div>

			<section className="founders">
				<div className="section-head">
					<div className="eyebrow reveal">Meet the Founders</div>
					<h2 className="reveal">The people behind it</h2>
				</div>
				<div className="founder-grid">
					{founders.map((f, i) => (
						<div key={f.init} className={`founder-card reveal${i ? ' reveal-delay-1' : ''}`}>
							<div className="founder-portrait"><span className="init">{f.init}</span></div>
							<div className="founder-name">{f.name}</div>
							<div className="founder-role">{f.role}</div>
							<p className="founder-bio">{f.bio}</p>
						</div>
					))}
				</div>
			</section>

			<div className="cta-block reveal">
				<h2>Begin your ALLDYSTARS<br />Experience Now</h2>
				<div className="quote">Ideas become impact when shaped with purpose.</div>
				<a href="mailto:hello@alldystars.com" className="cta-btn">Email Us →</a>
			</div>

			<Footer />
		</div>
	);
}
