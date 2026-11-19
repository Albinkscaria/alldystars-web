'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/* Closes an opened project and returns to the archive. When the visitor came
   from the archive (it leaves a note in sessionStorage when a file is opened),
   this goes *back*, so the archive reappears at the same scroll position;
   otherwise (a shared link, a new tab) it opens the archive. Esc closes too. */
export default function CaseClose({ slug }) {
	const router = useRouter();

	useEffect(() => {
		const onKey = (e) => {
			if (e.key === 'Escape' && !e.defaultPrevented) close();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function close() {
		let fromArchive = false;
		try {
			fromArchive = sessionStorage.getItem('pa-opened') === slug;
			sessionStorage.removeItem('pa-opened');
		} catch {}
		if (fromArchive && window.history.length > 1) router.back();
		else router.push('/projects');
	}

	return (
		<button type="button" className="case-close" onClick={close} aria-label="Close project and return to the archive">
			<span className="case-close__label" aria-hidden="true">Close</span>
			<span className="case-close__x" aria-hidden="true">×</span>
		</button>
	);
}
