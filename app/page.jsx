'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import Preloader from '@/components/Preloader/Preloader';
import HeroDotPrint from '@/components/HeroDotPrint';
import ServicesDots from '@/components/ServicesDots';
import { crimson, inter, mono } from './fonts';
import './Home.css';

// official full-colour marks (Devicon), served from /public/images/tech
const techList = [
	{ name: 'Python', logo: '/images/tech/python.svg' },
	{ name: 'PHP', logo: '/images/tech/php.svg' },
	{ name: 'WordPress', logo: '/images/tech/wordpress.svg' },
	{ name: 'Flutter', logo: '/images/tech/flutter.svg' },
	{ name: 'Figma', logo: '/images/tech/figma.svg' },
	{ name: 'Photoshop', logo: '/images/tech/photoshop.svg' },
	{ name: 'Canva', logo: '/images/tech/canva.svg' },
	{ name: 'Tableau', logo: '/images/tech/tableau.svg' },
	{ name: 'Power BI', logo: '/images/tech/powerbi.svg' },
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

		return () => {
			window.removeEventListener('mousemove', onMove);
			cancelAnimationFrame(raf);
		};
	}, []);

	// "Our Design Process": a red line grows down the timeline with the
	// scroll, carrying a glowing dot from 01 to 05. Each step lights up as
	// the dot reaches its badge and dims again when you scroll back past it.
	// Without JS (or with reduced motion) the list simply shows every step.
	useEffect(() => {
		const list = document.querySelector('.home-page .process-list');
		if (!list || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		gsap.registerPlugin(ScrollTrigger);

		const rows = [...list.querySelectorAll('.process-row')];
		let centers = [];
		// layout offsets, not getBoundingClientRect: the rows' .reveal
		// slide-in transform must not skew where the badges are
		const measure = () => {
			centers = rows.map(row => {
				const badge = row.querySelector('.process-badge');
				return row.offsetTop + badge.offsetTop + badge.offsetHeight / 2;
			});
			list.style.setProperty('--line-top', `${centers[0]}px`);
			list.style.setProperty('--line-len', `${centers[centers.length - 1] - centers[0]}px`);
		};

		const state = { p: 0 };
		const apply = () => {
			list.style.setProperty('--p', state.p.toFixed(4));
			const y = centers[0] + (centers[centers.length - 1] - centers[0]) * state.p;
			let current = -1;
			rows.forEach((row, i) => {
				const reached = y >= centers[i] - 1;
				row.classList.toggle('reached', reached);
				if (reached) current = i;
			});
			rows.forEach((row, i) => row.classList.toggle('current', i === current));
		};

		measure();
		list.classList.add('is-animated');
		const ctx = gsap.context(() => {
			gsap.to(state, {
				p: 1,
				ease: 'none',
				onUpdate: apply,
				scrollTrigger: {
					trigger: list,
					// the dot sits on a "reading line" 65% down the screen
					start: () => `top+=${centers[0]} 65%`,
					end: () => `top+=${centers[centers.length - 1]} 65%`,
					scrub: 0.6,
					invalidateOnRefresh: true,
					onRefreshInit: measure,
				},
			});
		});
		apply();

		return () => {
			ctx.revert();
			list.classList.remove('is-animated');
			rows.forEach(row => row.classList.remove('reached', 'current'));
		};
	}, []);

	return (
		<div className="home-page">
			<Preloader />
			<div className="cursor-dot" ref={dotRef}></div>
			<div className="cursor-label" ref={labelRef}></div>
			<svg className="grain" width="100%" height="100%">
				<filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" /></filter>
				<rect width="100%" height="100%" filter="url(#noiseFilter)" />
			</svg>

			<Header active="Home" />

			{/* dot-matrix hero: the cursor prints a hidden artwork (replaces the background video) */}
			<div id="home">
				<HeroDotPrint className={mono.variable} />
			</div>

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

			<ServicesDots className={`${crimson.variable} ${inter.variable} ${mono.variable}`} />

			<section className="tech">
				<div className="eyebrow reveal">Technology, Perfectly Executed</div>
				<div className="tech-row">
					{techList.map((t, i) => (
						<div key={t.name} className="tech-pill" style={{ animationDelay: `${i * 0.15}s` }}>
							<img className="tech-icon" src={t.logo} alt="" width={36} height={36} />
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
						{/* after the rows so .process-row:first-child still matches */}
						<span className="process-fill" aria-hidden="true" />
						<span className="process-traveller" aria-hidden="true" />
					</div>
				</div>
			</section>

			<Footer />
		</div>
	);
}
