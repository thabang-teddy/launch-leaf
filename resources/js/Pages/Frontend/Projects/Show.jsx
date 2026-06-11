import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head, Link } from '@inertiajs/react';
import Markdown from 'react-markdown';

export default function ProjectShow({ project }) {
    return (
        <FrontendLayout>
            <Head title={project.title} />

            <div className="container py-5" style={{ maxWidth: '900px' }}>
                {/* Back */}
                <Link href={route('projects.index')} className="ll-back-link">
                    ← Back to Projects
                </Link>

                {/* Hero image */}
                {project.image && (
                    <div className="mt-3 rounded overflow-hidden" style={{ maxHeight: '380px' }}>
                        <img
                            src={`/storage/${project.image}`}
                            alt={project.title}
                            style={{ width: '100%', height: '380px', objectFit: 'cover', display: 'block' }}
                        />
                    </div>
                )}

                {/* Header */}
                <div className={`${project.image ? 'mt-4' : 'mt-3'} mb-4`}>
                    <h1 className="ll-title mb-2">{project.title}</h1>
                    {project.github_url && (
                        <a
                            href={project.github_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-accent"
                            style={{ fontSize: '0.875rem', textDecoration: 'none', fontWeight: 600 }}
                        >
                            🔗 {project.github_url}
                        </a>
                    )}
                    {project.description && (
                        <p className="text-muted-ll mt-2 mb-0" style={{ lineHeight: 1.75 }}>
                            {project.description}
                        </p>
                    )}
                </div>

                <div className="row g-4">
                    {/* Markdown content */}
                    {project.content && (
                        <div className="col-12">
                            <h5 className="fw-800 text-dark-ll mb-3">
                                <span className="text-accent me-2">📝</span>About
                            </h5>
                            <div className="ll-readme">
                                <Markdown>{project.content}</Markdown>
                            </div>
                        </div>
                    )}

                    {/* README */}
                    {project.readme_content && (
                        <div className="col-12">
                            <h5 className="fw-800 text-dark-ll mb-2">
                                <span className="text-accent me-2">📄</span>README
                            </h5>
                            <div className="ll-readme">{project.readme_content}</div>
                        </div>
                    )}

                    {/* File tree */}
                    {project.file_tree?.length > 0 && (
                        <div className="col-12">
                            <h5 className="fw-800 text-dark-ll mb-2">
                                <span className="text-accent me-2">📁</span>
                                File Tree
                                <span
                                    className="text-muted-ll fw-400 ms-2"
                                    style={{ fontSize: '0.8rem' }}
                                >
                                    ({project.file_tree.length} files)
                                </span>
                            </h5>
                            <div className="ll-file-tree">
                                {project.file_tree.map(f => (
                                    <div key={f}>{f}</div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No content state */}
                    {!project.content && !project.readme_content && !project.file_tree?.length && (
                        <div className="col-12 text-center py-4">
                            <p className="text-muted-ll small">
                                No synced content yet.{' '}
                                <span className="text-accent">Sync from the dashboard to populate README &amp; file tree.</span>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </FrontendLayout>
    );
}
