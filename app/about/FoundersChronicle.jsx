'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import './FoundersChronicle.css';

// The markup below IS the finished front page. Everything in this file
// that moves only ever applies a temporary "before" state and animates
// back to what the CSS already describes, so with JS off or
// prefers-reduced-motion on, visitors simply get the complete newspaper.

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const prefersReducedMotion = () =>
	typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const tickerItems = [
	'Brand Identity & Design',
	'Web Design',
	'Graphic Design',
	'Data Analytics',
	'Business Analytics',
	'20+ projects delivered',
	'10+ clients and counting',
	'2700+ designs shipped',
];

const sizes = '(max-width: 640px) 90vw, (max-width: 1100px) 45vw, 360px';

// Black-and-white newsprint on top, colour photo underneath. Hover (mouse)
// develops it while the pointer is over it; click / tap / Enter toggles
// it on so touch and keyboard users get the same reveal.
function PrintPhoto({ src, name, fig, caption }) {
	const btnRef = useRef(null);
	const wRef = useRef(0);
	const rafRef = useRef(0);
	const [locked, setLocked] = useState(false);
	const [hovered, setHovered] = useState(false);
	const developed = locked || hovered;

	useEffect(() => {
		const layers = btnRef.current?.querySelectorAll('.np-photo-print');
		if (!layers?.length) return;
		const set = (w) => layers.forEach(el => el.style.setProperty('--w', w.toFixed(4)));
		const target = developed ? 1 : 0;
		cancelAnimationFrame(rafRef.current);

		if (prefersReducedMotion()) { wRef.current = target; set(target); return; }

		const from = wRef.current;
		const dur = 750 * Math.abs(target - from);
		const start = performance.now();
		const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
		const step = (now) => {
			const t = dur ? Math.min(1, (now - start) / dur) : 1;
			wRef.current = from + (target - from) * ease(t);
			set(wRef.current);
			if (t < 1) rafRef.current = requestAnimationFrame(step);
		};
		rafRef.current = requestAnimationFrame(step);
		return () => cancelAnimationFrame(rafRef.current);
	}, [developed]);

	return (
		<figure className="np-figure">
			<button
				ref={btnRef}
				type="button"
				className="np-photo"
				aria-pressed={locked}
				aria-label={`${name}: show the colour photograph`}
				onClick={() => setLocked(l => !l)}
				onPointerEnter={(e) => { if (e.pointerType === 'mouse') setHovered(true); }}
				onPointerLeave={(e) => { if (e.pointerType === 'mouse') setHovered(false); }}
			>
				<Image src={src} alt={name} fill sizes={sizes} />
				<Image src={src} alt="" aria-hidden="true" fill sizes={sizes} className="np-photo-print" />
				<span className="np-photo-print np-photo-dots" aria-hidden="true" />
			</button>
			<figcaption><b>{fig}</b> {caption} <span aria-hidden="true">Hover or tap to develop the print.</span></figcaption>
		</figure>
	);
}

export default function FoundersChronicle({ className = '' }) {
	const sectionRef = useRef(null);

	// ── Landing sequence: paper flies in, lands, gets stamped, highlighted ──
	useIsoLayoutEffect(() => {
		const root = sectionRef.current;
		if (!root || prefersReducedMotion() || typeof root.animate !== 'function') return;

		const $ = s => root.querySelector(s);
		const stage = $('.np-stage');
		const paper = $('.np-paper');
		const shadows = $('.np-shadows');
		const ground = $('.np-shadow--ground');
		const air = $('.np-shadow--air');
		const puff = $('.np-puff');
		const stamp = $('.np-stamp');
		const hls = [...root.querySelectorAll('.np-hl')];

		// Far enough right that even the rotated corner of a tall phone-width
		// sheet starts fully off-screen.
		const OFF = 'translate3d(calc(100vw + 240px + 20%), -3%, 0) rotate(7deg) scale(1.04)';

		// before states (inline, so they're trivially removable)
		paper.style.transform = OFF;
		shadows.style.transform = OFF;
		ground.style.opacity = '0';
		stamp.style.opacity = '0';
		hls.forEach(el => { el.style.backgroundSize = '0% 100%'; });

		const clearBefore = () => {
			paper.style.transform = '';
			shadows.style.transform = '';
			ground.style.opacity = '';
			stamp.style.opacity = '';
			hls.forEach(el => { el.style.backgroundSize = ''; });
		};

		const anims = [];
		const FLIGHT = 1500;
		const LAND = FLIGHT * 0.86;
		const STAMP_AT = FLIGHT + 150;
		const STAMP_HIT = 300;

		function play() {
			const flight = [
				{ transform: OFF, easing: 'cubic-bezier(.16,.84,.3,1)' },
				{ transform: 'translate3d(-1.2%, -0.6%, 0) rotate(-1.4deg) scale(1.02)', offset: 0.68, easing: 'ease-in-out' },
				{ transform: 'translate3d(0.3%, 0, 0) rotate(0.35deg) scale(1)', offset: 0.86, easing: 'ease-out' },
				{ transform: 'none' },
			];
			const opts = { duration: FLIGHT, fill: 'backwards' };
			anims.push(paper.animate(flight, opts), shadows.animate(flight, opts));

			// while airborne the sheet casts a big soft shadow, offset away;
			// it tightens up and hands over to the crisp ground shadow on landing
			anims.push(air.animate([
				{ opacity: 0.85, transform: 'translate(-2%, 7%) scale(0.94)' },
				{ opacity: 0.6, transform: 'translate(-0.6%, 2.5%) scale(0.98)', offset: 0.68 },
				{ opacity: 0, transform: 'none', offset: 0.86 },
				{ opacity: 0, transform: 'none' },
			], { duration: FLIGHT }));
			anims.push(ground.animate([
				{ opacity: 0 }, { opacity: 0, offset: 0.7 }, { opacity: 1, offset: 0.9 }, { opacity: 1 },
			], { duration: FLIGHT, fill: 'backwards' }));

			// puff of air squeezed out from under the sheet as it lands
			anims.push(puff.animate([
				{ opacity: 0, transform: 'scale(0.6, 0.5)' },
				{ opacity: 1, transform: 'scale(1, 1)', offset: 0.3 },
				{ opacity: 0, transform: 'translateY(-14px) scale(1.25, 1.35)' },
			], { duration: 900, delay: LAND - 120, easing: 'ease-out' }));

			// rubber stamp slams down, then the sheet jolts from the hit
			anims.push(stamp.animate([
				{ opacity: 0, transform: 'rotate(-32deg) scale(2.4)', easing: 'cubic-bezier(.55,0,.8,.2)' },
				{ opacity: 1, transform: 'rotate(-10deg) scale(0.9)', offset: 0.72, easing: 'ease-out' },
				{ opacity: 1, transform: 'rotate(-12deg) scale(1)' },
			], { duration: 420, delay: STAMP_AT, fill: 'backwards' }));
			anims.push(paper.animate([
				{ transform: 'none' },
				{ transform: 'translateY(3px) rotate(0.12deg) scale(0.997)', offset: 0.35 },
				{ transform: 'none' },
			], { duration: 260, delay: STAMP_AT + STAMP_HIT, easing: 'ease-out' }));

			// marker pen runs across the highlighted lines, one after another
			hls.forEach((el, i) => {
				anims.push(el.animate([
					{ backgroundSize: '0% 100%' },
					{ backgroundSize: '100% 100%' },
				], { duration: 800, delay: STAMP_AT + 550 + i * 280, easing: 'cubic-bezier(.6,.1,.3,1)', fill: 'backwards' }));
			});

			// all animations are now holding the before state themselves
			clearBefore();
		}

		const io = new IntersectionObserver((entries) => {
			if (!entries.some(e => e.isIntersecting)) return;
			io.disconnect();
			play();
		}, { rootMargin: '0px 0px -15% 0px' });
		io.observe(stage);

		return () => {
			io.disconnect();
			anims.forEach(a => a.cancel());
			clearBefore();
		};
	}, []);

	// ── Ticker: endless crawl, pauses while hovered ──
	useEffect(() => {
		const root = sectionRef.current;
		if (!root || prefersReducedMotion()) return;
		const ticker = root.querySelector('.np-ticker');
		const track = root.querySelector('.np-ticker-track');
		const copy = root.querySelector('.np-ticker-copy');
		if (typeof track.animate !== 'function') return;

		const SPEED = 55; // px per second
		let anim = null;
		let lastWidth = 0;
		function build() {
			const w = copy.getBoundingClientRect().width;
			if (!w || w === lastWidth) return;
			lastWidth = w;
			const prevDur = anim?.effect.getTiming().duration;
			const progress = anim && prevDur ? ((anim.currentTime ?? 0) % prevDur) / prevDur : 0;
			const paused = anim?.playState === 'paused';
			anim?.cancel();
			anim = track.animate(
				[{ transform: 'translateX(0)' }, { transform: `translateX(${-w}px)` }],
				{ duration: (w / SPEED) * 1000, iterations: Infinity },
			);
			anim.currentTime = progress * (w / SPEED) * 1000;
			if (paused) anim.pause();
		}
		build();
		const ro = new ResizeObserver(build);
		ro.observe(copy);
		document.fonts?.ready.then(build);

		const pause = () => anim?.pause();
		const resume = () => anim?.play();
		ticker.addEventListener('pointerenter', pause);
		ticker.addEventListener('pointerleave', resume);

		return () => {
			ro.disconnect();
			ticker.removeEventListener('pointerenter', pause);
			ticker.removeEventListener('pointerleave', resume);
			anim?.cancel();
		};
	}, []);

	const tickerCopy = (key) => (
		<div className="np-ticker-copy" key={key}>
			{tickerItems.map(item => (
				<span key={item}>{item}<em>✦</em></span>
			))}
		</div>
	);

	return (
		<section ref={sectionRef} className={`np-section ${className}`} aria-labelledby="np-head">
			<div className="np-stage">
				<div className="np-shadows" aria-hidden="true">
					<div className="np-shadow np-shadow--air" />
					<div className="np-shadow np-shadow--ground" />
				</div>
				<div className="np-puff" aria-hidden="true" />

				<article className="np-paper">
					<div className="np-crease" aria-hidden="true" />

					<div className="np-inner">
						<div className="np-mast-top np-mono">
							<span>Vol. V — Founders&rsquo; Edition</span>
							<span>Kottayam, Kerala</span>
							<span>Price: One good idea</span>
						</div>

						<div className="np-mast">
							<div className="np-ear"><b>Today&rsquo;s forecast</b>Clear skies, bold ideas</div>
							<p className="np-title">The AlldyStars <i>Chronicle</i></p>
							<div className="np-ear"><b>Inside</b>Five disciplines, one studio</div>
						</div>
						<div className="np-rule2" />

						<div className="np-ticker np-mono">
							<span className="np-ticker-tag">Latest</span>
							<p className="np-sr-only">Latest: {tickerItems.join(', ')}.</p>
							<div className="np-ticker-track" aria-hidden="true">
								{[0, 1, 2].map(tickerCopy)}
							</div>
						</div>

						<p className="np-kicker np-mono">Meet the Founders</p>
						<h2 id="np-head" className="np-head">The People Behind It</h2>
						<p className="np-deck">An award-winning artist and a developer built one studio where creative thinking and technical craft share the same desk.</p>
						<div className="np-byline np-mono">
							<span>By the AlldyStars Desk</span>
							<span>Filed from Kottayam</span>
							<span>2 min read</span>
						</div>

						<div className="np-grid">
							<div className="np-col">
								<PrintPhoto
									src="/images/author/joel.jpeg"
									name="Joyal K Scaria"
									fig="FIG. 1"
									caption="Joyal K Scaria, Co-Founder & Creative Director."
								/>
							</div>

							<div className="np-col">
								<h3 className="np-name">Joyal K Scaria</h3>
								<p className="np-role np-mono">Co-Founder &amp; Creative Director</p>
								<p className="np-body np-drop">
									Joyal is an award-winning artist, graphic designer and creative director with a passion for{' '}
									<span className="np-hl">transforming ideas into meaningful visual experiences.</span>
								</p>
								<p className="np-body">
									With a background in Information Technology &amp; Data Analysis and years of experience in Art &amp; Design, Joyal brings together technical knowledge and artistic thinking to create solutions that are{' '}
									<span className="np-hl">both visually compelling and strategically effective.</span>
								</p>
								<Link href="/services" className="np-cont">Continued in the Services index →</Link>
							</div>

							<div className="np-col">
								<h3 className="np-name">Albin K Scaria</h3>
								<p className="np-role np-mono">Co-Founder &amp; Developer</p>
								<p className="np-body np-drop">
									Albin leads the development side of the studio, building the technical foundation that turns AlldyStars&rsquo; creative work into{' '}
									<span className="np-hl">fast, functional, production-ready digital experiences.</span>
								</p>
								<p className="np-body">
									A toolkit spanning Python, PHP, WordPress and Flutter means a design signed off in Figma ships as a working product, not a static mock-up.
								</p>
								<blockquote className="np-quote">
									<p>&ldquo;Ideas become impact when shaped with purpose.&rdquo;</p>
									<cite className="np-mono">— The studio motto</cite>
								</blockquote>
								<Link href="/contact" className="np-cont">Start a project with them →</Link>
							</div>

							<div className="np-col">
								<PrintPhoto
									src="/images/author/albin.jpeg"
									name="Albin K Scaria"
									fig="FIG. 2"
									caption="Albin K Scaria, Co-Founder & Developer."
								/>
							</div>
						</div>
					</div>

					<div className="np-stamp" aria-hidden="true">100%<br />Original<br />★ Ideas ★</div>
				</article>
			</div>
		</section>
	);
}
