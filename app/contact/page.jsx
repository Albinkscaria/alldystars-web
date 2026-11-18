'use client';

import { useEffect, useRef } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import ContactLetter from '@/components/ContactLetter';
import { crimson, inter, mono, script } from '../fonts';
import './Contact.css';

/* EmailJS (emailjs.com) delivers the letters straight from the browser.
   The three IDs are public by design; set them in Vercel → Settings →
   Environment Variables (and redeploy). The template's variables are
   {{name}} {{company}} {{email}} {{services}} {{idea}} {{postscript}}.
   Without them (local development) letters go to /api/contact, which
   prints them in the terminal. */
const EMAILJS = {
	service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
	template_id: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
	user_id: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
};
const USE_EMAILJS = Boolean(EMAILJS.service_id && EMAILJS.template_id && EMAILJS.user_id);

async function sendLetter(form) {
	if (!USE_EMAILJS) {
		if (process.env.NODE_ENV === 'production') console.error('Contact form: the EmailJS environment variables are not set in Vercel.');
		const res = await fetch('/api/contact', { method: 'POST', body: form });
		return res.ok;
	}
	if (String(form.get('website') || '').trim()) return true; // spam-trap field filled: quietly drop it
	const field = (k) => String(form.get(k) || '').trim();
	const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			...EMAILJS,
			template_params: {
				name: field('name'),
				company: field('company') || '—',
				email: field('email'),
				services: form.getAll('services').join(', ') || '—',
				idea: field('idea'),
				postscript: field('postscript') || '—',
			},
		}),
	});
	if (!res.ok) console.error(`Contact form: EmailJS answered ${res.status}: ${await res.text().catch(() => '')}`);
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
			<ContactLetter onSubmit={sendLetter} attachments={!USE_EMAILJS} email="hello@alldystars.com" className={`${crimson.variable} ${inter.variable} ${mono.variable} ${script.variable}`} />

			<Footer />
		</div>
	);
}
