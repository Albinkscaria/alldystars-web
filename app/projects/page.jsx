import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import ProjectsArchive from '@/components/ProjectsArchive';
import { anton, mono } from '../fonts';
import './Projects.css';

export const metadata = {
	title: 'Work — alldystars',
	description: 'Selected brand, web, graphic and data work by alldystars, Kottayam.',
};

/* "The Archive": every project is a file in a studio drawer. Edit the files in
   components/ProjectsArchive/projects.js. The section holds the page's <h1>
   and brings its own cursor, so the site's follower dot isn't used here. */
export default function ProjectsPage() {
	return (
		<div className="projects-page">
			<Header active="Work" />
			<ProjectsArchive className={`${mono.variable} ${anton.variable}`} />
			<Footer />
		</div>
	);
}
