'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function Header({ active }) {
	const [scrolled, setScrolled] = useState(false);
	const headerRef = useRef(null);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 10);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	// publish the header's real height (it differs on phones, where the pills
	// sit under the logo) so pages can clear it with var(--header-h)
	useEffect(() => {
		const el = headerRef.current;
		if (!el) return undefined;
		const set = () => document.documentElement.style.setProperty('--header-h', `${Math.ceil(el.getBoundingClientRect().height)}px`);
		set();
		if (typeof ResizeObserver === 'undefined') return undefined;
		const ro = new ResizeObserver(set);
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	const links = [
		{ href: '/', label: 'Home' },
		{ href: '/projects', label: 'Work' },
		{ href: '/services', label: 'Services' },
		{ href: '/about', label: 'About' },
		{ href: '/contact', label: 'Contact' },
	];

	return (
		<>
			<header ref={headerRef} className={`site-header${scrolled ? ' scrolled' : ''}`}>
				<Link href="/" className="logo">
					<img src="/brand/logo.png" alt="alldystars" />
				</Link>
				<nav className="links" aria-label="Main">
					{links.map(l => (
						<Link key={l.href} href={l.href} className={active === l.label ? 'active' : ''}>
							{l.label}
						</Link>
					))}
				</nav>
			</header>
		</>
	);
}
