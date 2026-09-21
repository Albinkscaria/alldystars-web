'use client';

import { useEffect, useRef, useState } from 'react';
import './Preloader.css';

const LINE = 'Design Beyond Aesthetics.';
const CHAR_STEP_MS = 42;
const CHAR_ANIM_MS = 520;
const HOLD_MS = 500;
const EXIT_MS = 1100;

export default function Preloader({ onExitStart }) {
	const [phase, setPhase] = useState('typing'); // typing -> holding -> exiting -> hidden
	const [pct, setPct] = useState(0);
	const startRef = useRef(null);

	useEffect(() => {
		if (sessionStorage.getItem('adly-preloaded')) {
			setPhase('hidden');
			onExitStart?.();
			return;
		}

		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		document.body.style.overflow = 'hidden';
		const timers = [];

		function finish(delay) {
			timers.push(setTimeout(() => {
				sessionStorage.setItem('adly-preloaded', '1');
				setPhase('exiting');
				onExitStart?.();
				timers.push(setTimeout(() => {
					document.body.style.overflow = '';
					setPhase('hidden');
				}, reduced ? 300 : EXIT_MS));
			}, delay));
		}

		if (reduced) {
			setPct(100);
			finish(400);
			return () => timers.forEach(clearTimeout);
		}

		const typeDuration = LINE.length * CHAR_STEP_MS + CHAR_ANIM_MS;
		let raf;
		function tick(now) {
			if (startRef.current === null) startRef.current = now;
			const elapsed = now - startRef.current;
			const next = Math.min(100, Math.round((elapsed / typeDuration) * 100));
			setPct(p => (next > p ? next : p));
			if (elapsed < typeDuration) raf = requestAnimationFrame(tick);
		}
		raf = requestAnimationFrame(tick);

		timers.push(setTimeout(() => setPhase('holding'), typeDuration));
		finish(typeDuration + HOLD_MS);

		return () => { timers.forEach(clearTimeout); cancelAnimationFrame(raf); };
	}, []);

	if (phase === 'hidden') return null;

	return (
		<div className={`preloader preloader-${phase}`} style={{ '--type-ms': `${LINE.length * CHAR_STEP_MS + CHAR_ANIM_MS}ms` }}>
			<div className="preloader-panel preloader-panel-l" />
			<div className="preloader-panel preloader-panel-r" />

			<div className="preloader-content">
				<div className="preloader-glow" aria-hidden="true" />
				<div className="preloader-eyebrow">alldystars.</div>
				<div className="preloader-line" aria-label={LINE}>
					{LINE.split('').map((ch, i) => (
						<span
							key={i}
							className="preloader-char"
							aria-hidden="true"
							style={{ animationDelay: `${i * CHAR_STEP_MS}ms` }}
						>
							{ch === ' ' ? ' ' : ch}
						</span>
					))}
					<span className="preloader-cursor" aria-hidden="true" />
				</div>
				<div className="preloader-meta">
					<span className="preloader-pct">{String(pct).padStart(2, '0')}%</span>
					<span className="preloader-progress"><span style={{ transform: `scaleX(${pct / 100})` }} /></span>
				</div>
			</div>
		</div>
	);
}
