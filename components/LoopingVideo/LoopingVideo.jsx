'use client';

import { useEffect, useRef } from 'react';

// The browser's native `loop` attribute just snaps back to frame 0 the
// instant the video ends — on a clip whose first and last frames don't
// match, that reads as a visible jump-cut rather than a continuous loop.
// This renders two copies of the same clip stacked exactly on top of each
// other; shortly before the playing one ends, the standby copy starts
// from frame 0 and cross-dissolves in, so the restart is masked as a soft
// blend instead of a hard cut. No video re-encoding needed.
const CROSSFADE_SECONDS = 1;

export default function LoopingVideo({ src, className, onError }) {
	const aRef = useRef(null);
	const bRef = useRef(null);

	useEffect(() => {
		const a = aRef.current, b = bRef.current;
		if (!a || !b) return;

		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			a.pause();
			b.pause();
			return;
		}

		const playA = a.play();
		if (playA && typeof playA.catch === 'function') {
			playA.catch((err) => console.warn('looping video autoplay was blocked:', err));
		}

		let active = a;
		let standby = b;
		let crossfading = false;
		let raf;

		function tick() {
			if (active.duration && !isNaN(active.duration)) {
				const remaining = active.duration - active.currentTime;

				if (!crossfading && remaining <= CROSSFADE_SECONDS && remaining > 0) {
					crossfading = true;
					standby.currentTime = 0;
					const p = standby.play();
					if (p && typeof p.catch === 'function') p.catch(() => {});
				}

				if (crossfading) {
					const t = Math.min(1, Math.max(0, 1 - remaining / CROSSFADE_SECONDS));
					active.style.opacity = String(1 - t);
					standby.style.opacity = String(t);

					if (remaining <= 0.02) {
						active.pause();
						active.style.opacity = '0';
						standby.style.opacity = '1';
						const nextActive = standby, nextStandby = active;
						active = nextActive;
						standby = nextStandby;
						crossfading = false;
					}
				}
			}
			raf = requestAnimationFrame(tick);
		}
		raf = requestAnimationFrame(tick);

		return () => cancelAnimationFrame(raf);
	}, []);

	return (
		<>
			<video ref={aRef} className={className} muted playsInline preload="auto" style={{ opacity: 1 }} onError={onError}>
				<source src={src} type="video/mp4" />
			</video>
			<video ref={bRef} className={className} muted playsInline preload="auto" style={{ opacity: 0 }} onError={onError}>
				<source src={src} type="video/mp4" />
			</video>
		</>
	);
}
