import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head, Link } from '@inertiajs/react';

export default function ProjectsIndex({ projects }) {
    return (
        <FrontendLayout>
            <Head title="Projects" />

            {/* Header band */}
            <div className="ll-section-alt text-center" style={{ padding: '3rem 0' }}>
                <div className="container">
                    <span className="ll-label">Open Source</span>
                    <h1 className="ll-title mt-1">GitHub Projects</h1>
                </div>
            </div>

            <section className="ll-section">
                <div className="container">
                    {projects.length === 0 ? (
                        <div className="text-center py-5">
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💻</div>
                            <p className="text-muted-ll">No projects listed yet.</p>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {projects.map(p => (
                                <div key={p.id} className="col-md-6">
                                    <Link
                                        href={route('projects.show', p.slug)}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <div
                                            className="h-100 p-4 rounded"
                                            style={{
                                                background: '#fff',
                                                border: '1px solid var(--ll-border)',
                                                transition: 'var(--ll-t)',
                                                cursor: 'pointer',
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.boxShadow = 'var(--ll-shadow)';
                                                e.currentTarget.style.transform = 'translateY(-3px)';
                                                e.currentTarget.style.borderColor = 'transparent';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.boxShadow = '';
                                                e.currentTarget.style.transform = '';
                                                e.currentTarget.style.borderColor = 'var(--ll-border)';
                                            }}
                                        >
                                            {/* GitHub icon + title */}
                                            <div className="d-flex align-items-start gap-3">
                                                <div
                                                    className="ll-service-icon mt-1"
                                                    style={{ flexShrink: 0 }}
                                                >
                                                    💻
                                                </div>
                                                <div>
                                                    <h5 className="fw-700 text-dark-ll mb-1" style={{ fontSize: '0.97rem' }}>
                                                        {p.title}
                                                    </h5>
                                                    {p.description && (
                                                        <p className="text-muted-ll small mb-2" style={{ lineHeight: 1.6 }}>
                                                            {p.description.length > 120
                                                                ? p.description.substring(0, 120) + '…'
                                                                : p.description}
                                                        </p>
                                                    )}
                                                    {p.github_url && (
                                                        <span
                                                            className="text-muted-ll"
                                                            style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}
                                                        >
                                                            🔗 {p.github_url}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </FrontendLayout>
    );
}
