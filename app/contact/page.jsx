'use client';

import { useEffect, useRef } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import ContactLetter from '@/components/ContactLetter';
import { crimson, inter, mono, script } from '../fonts';
import './Contact.css';

export default function ContactPage() {
	const dotRef = useRef(null);
	const labelRef = useRef(null);

	useEffect(() => {
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

		// the send button gets the same "SEND" cursor label the old CTA had
		const drop = document.querySelector('.contact-page .cl-drop');
		function onEnter() { if (!drop.disabled) { label.textContent = 'SEND'; label.classList.add('show'); dot.style.opacity = 0; } }
		function onLeave() { label.classList.remove('show'); dot.style.opacity = 1; }
		drop?.addEventListener('mouseenter', onEnter);
		drop?.addEventListener('mouseleave', onLeave);

		return () => {
			window.removeEventListener('mousemove', onMove);
			cancelAnimationFrame(raf);
			drop?.removeEventListener('mouseenter', onEnter);
			drop?.removeEventListener('mouseleave', onLeave);
		};
	}, []);

	return (
		<div className="contact-page">
			<div className="cursor-dot" ref={dotRef}></div>
			<div className="cursor-label" ref={labelRef}></div>
			<svg className="grain" width="100%" height="100%">
				<filter id="noiseFilter3"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" /></filter>
				<rect width="100%" height="100%" filter="url(#noiseFilter3)" />
			</svg>

			<Header active="Contact" />

			{/* "Write us a letter": holds the page's <h1> */}
			<ContactLetter email="hello@alldystars.com" className={`${crimson.variable} ${inter.variable} ${mono.variable} ${script.variable}`} />

			<Footer />
		</div>
	);
}
