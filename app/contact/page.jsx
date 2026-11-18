'use client';

import { useEffect, useRef } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import ContactLetter from '@/components/ContactLetter';
import { crimson, inter, mono, script } from '../fonts';
import './Contact.css';

/**
 * Letters go to Netlify Forms on the live site (registered by public/__forms.html;
 * they appear under Forms in the Netlify dashboard, and email notifications are
 * set up there). In development `next dev` can't receive Netlify forms, so the
 * letter goes to /api/contact, which prints it in the terminal.
 */
async function sendLetter(formData) {
	if (process.env.NODE_ENV !== 'production') {
		const res = await fetch('/api/contact', { method: 'POST', body: formData });
		return res.ok;
	}
	const body = new FormData();
	body.set('form-name', 'contact');
	for (const [key, value] of formData.entries()) {
		if (key === 'services' || key === 'attachment') continue;
		body.set(key, value);
	}
	// Netlify keeps one value per field: send the ticked services as one line
	body.set('services', formData.getAll('services').join(', '));
	const file = formData.get('attachment');
	if (file && typeof file === 'object' && file.size > 0) body.set('attachment', file);
	const res = await fetch('/__forms.html', { method: 'POST', body });
	// shows up in the browser console on the live site if Netlify refuses the letter
	if (!res.ok) console.error(`Contact form: Netlify Forms answered ${res.status}. Check that form detection is enabled under Forms in the Netlify dashboard and the site has been redeployed since.`);
	return res.ok;
}

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
			<ContactLetter onSubmit={sendLetter} email="hello@alldystars.com"className={`${crimson.variable} ${inter.variable} ${mono.variable} ${script.variable}`} />

			<Footer />
		</div>
	);
}
