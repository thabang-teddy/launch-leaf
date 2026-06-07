import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head, Link } from '@inertiajs/react';

export default function ProjectShow({ project }) {
    return (
        <FrontendLayout>
            <Head title={project.title} />
            <div className="container py-5">
                <Link href={route('projects.index')} className="text-muted small">&larr; Projects</Link>
                <h1 className="h2 mt-2 mb-1">{project.title}</h1>
                {project.github_url && (
                    <a href={project.github_url} target="_blank" rel="noreferrer" className="text-muted small">
                        {project.github_url}
                    </a>
                )}

                {project.description && <p className="mt-3">{project.description}</p>}

                {project.readme_content && (
                    <div className="mt-4">
                        <h5>README</h5>
                        <pre className="bg-light p-3 rounded" style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>
                            {project.readme_content}
                        </pre>
                    </div>
                )}

                {project.file_tree?.length > 0 && (
                    <div className="mt-4">
                        <h5>Files</h5>
                        <ul className="list-unstyled font-monospace small">
                            {project.file_tree.map(f => <li key={f}>{f}</li>)}
                        </ul>
                    </div>
                )}
            </div>
        </FrontendLayout>
    );
}
