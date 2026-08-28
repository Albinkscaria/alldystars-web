'use client';

import { useRef } from 'react';
import './FloatingDock.css';

const MAX_SCALE = 1.5;
const INFLUENCE_RADIUS = 110;

export default function FloatingDock({ items }) {
	const itemRefs = useRef([]);
	const scaleRefs = useRef([]);

	const handleMouseMove = (e) => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const mouseX = e.clientX;
		itemRefs.current.forEach((el, i) => {
			const scaleEl = scaleRefs.current[i];
			if (!el || !scaleEl) return;
			const rect = el.getBoundingClientRect();
			const center = rect.left + rect.width / 2;
			const distance = Math.abs(mouseX - center);
			const scale = distance < INFLUENCE_RADIUS
				? 1 + (MAX_SCALE - 1) * (1 - distance / INFLUENCE_RADIUS)
				: 1;
			scaleEl.style.transform = `scale(${scale})`;
		});
	};

	const resetScale = () => {
		scaleRefs.current.forEach((el) => { if (el) el.style.transform = 'scale(1)'; });
	};

	return (
		<div className="floating-dock" onMouseMove={handleMouseMove} onMouseLeave={resetScale}>
			{items.map((item, i) => (
				<a
					key={item.title}
					ref={(el) => { itemRefs.current[i] = el; }}
					href={item.href}
					target="_blank"
					rel="noopener noreferrer"
					className="dock-item"
					aria-label={item.title}
				>
					<span className="dock-tooltip">{item.title}</span>
					<span className="dock-icon-scale" ref={(el) => { scaleRefs.current[i] = el; }}>
						<span className="dock-icon" dangerouslySetInnerHTML={{ __html: item.icon }} />
					</span>
				</a>
			))}
		</div>
	);
}
