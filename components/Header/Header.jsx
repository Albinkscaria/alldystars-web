'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Header({ active }) {
	const [open, setOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 10);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	const links = [
		{ href: '/', label: 'Home' },
		{ href: '/projects', label: 'Work' },
		{ href: '/services', label: 'Services' },
		{ href: '/about', label: 'About' },
		{ href: '/#contact', label: 'Contact' },
	];

	return (
		<>
			<header className={`site-header${scrolled ? ' scrolled' : ''}`}>
				<Link href="/" className="logo">
					<img src="/brand/logo.png" alt="alldystars" />
				</Link>
				<nav className="links">
					{links.map(l => (
						<Link key={l.href} href={l.href} className={active === l.label ? 'active' : ''}>
							{l.label}
						</Link>
					))}
				</nav>
				<button className="menu-btn" aria-label="Open menu" onClick={() => setOpen(o => !o)}>
					<span></span><span></span>
				</button>
			</header>

			<div className={`mobile-menu${open ? ' open' : ''}`}>
				{links.map(l => (
					<Link key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</Link>
				))}
			</div>
		</>
	);
}
