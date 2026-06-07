import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head, Link } from '@inertiajs/react';

export default function ProjectsIndex({ projects }) {
    return (
        <FrontendLayout>
            <Head title="Projects" />
            <div className="container py-5">
                <h1 className="h2 mb-4">GitHub Projects</h1>
                {projects.length === 0 ? (
                    <p className="text-muted">No projects yet.</p>
                ) : (
                    <div className="row row-cols-1 row-cols-md-2 g-4">
                        {projects.map(p => (
                            <div key={p.id} className="col">
                                <div className="card h-100">
                                    <div className="card-body">
                                        <h5 className="card-title">
                                            <Link href={route('projects.show', p.slug)}>{p.title}</Link>
                                        </h5>
                                        {p.description && <p className="card-text text-muted">{p.description}</p>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </FrontendLayout>
    );
}
