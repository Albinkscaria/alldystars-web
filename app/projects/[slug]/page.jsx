import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { ArchiveCover, PROJECTS } from '@/components/ProjectsArchive';
import '@/components/ProjectsArchive/projects-archive.css';
import { anton, mono } from '../../fonts';
import CaseClose from './CaseClose';
import './CaseStudy.css';

/* A case study opened from the archive (/projects/<id>). It starts with the
   same cover full screen, so the archive's zoom hands off seamlessly. Only the
   files marked "live" in components/ProjectsArchive/projects.js get a page;
   any other address is a 404. Replace the "coming soon" block with the real
   case study as it's written. */

const liveProjects = () => PROJECTS.filter((p) => p.status === 'live');

export const dynamicParams = false;

export function generateStaticParams() {
	return liveProjects().map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }) {
	const { slug } = await params;
	const project = liveProjects().find((p) => p.id === slug);
	return project ? { title: `${project.title} — alldystars`, description: `${project.discipline} case study by alldystars.` } : {};
}

export default async function CaseStudyPage({ params }) {
	const { slug } = await params;
	const project = liveProjects().find((p) => p.id === slug);
	if (!project) notFound();

	return (
		<div className={`case-page ${mono.variable} ${anton.variable}`}>
			<Header active="Work" />

			<section className="case-hero">
				<ArchiveCover project={project} priority sizes="100vw" />
				<CaseClose slug={project.id} />
				<div className="case-hero__meta">
					<p>{project.discipline} · {project.year}</p>
					<h1 className="case-hero__title">{project.title}</h1>
				</div>
			</section>

			<section className="case-body">
				<p className="case-body__kicker">Case study</p>
				<p className="case-body__lede">The full case study for this project is being written. Check back soon, or tell us about yours.</p>
				<div className="case-body__links">
					<Link href="/projects" className="case-btn case-btn--ghost">← Back to the archive</Link>
					<Link href="/contact" className="case-btn">Start a project →</Link>
				</div>
			</section>

			<Footer />
		</div>
	);
}
