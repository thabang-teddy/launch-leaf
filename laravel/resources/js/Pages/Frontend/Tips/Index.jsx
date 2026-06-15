import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head, Link } from '@inertiajs/react';

export default function TipsIndex({ tips }) {
    return (
        <FrontendLayout>
            <Head title="Tips" />

            {/* Header band */}
            <div className="ll-section-alt text-center" style={{ padding: '3rem 0' }}>
                <div className="container">
                    <span className="ll-label">Knowledge Base</span>
                    <h1 className="ll-title mt-1">Tips &amp; Tricks</h1>
                </div>
            </div>

            <section className="ll-section">
                <div className="container">
                    {tips.length === 0 ? (
                        <div className="text-center py-5">
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✍️</div>
                            <p className="text-muted-ll">No tips published yet.</p>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {tips.map(tip => (
                                <div key={tip.id} className="col-md-6 col-lg-4">
                                    <div className="ll-blog-card">
                                        {/* Coloured header strip */}
                                        <div className="ll-blog-header">
                                            <span className="ll-blog-cat">
                                                {tip.tags?.[0] ?? 'Tip'}
                                            </span>
                                            <Link
                                                href={route('tips.show', tip.slug)}
                                                className="ll-blog-title"
                                            >
                                                {tip.title}
                                            </Link>
                                        </div>

                                        <div className="ll-blog-body">
                                            {/* Problem preview */}
                                            {tip.problem && (
                                                <p
                                                    className="text-muted-ll small mb-3"
                                                    style={{ lineHeight: 1.65 }}
                                                >
                                                    {tip.problem.length > 120
                                                        ? tip.problem.substring(0, 120) + '…'
                                                        : tip.problem}
                                                </p>
                                            )}

                                            {/* Tags */}
                                            {tip.tags?.length > 0 && (
                                                <div className="d-flex flex-wrap gap-1 mb-3">
                                                    {tip.tags.map(t => (
                                                        <span key={t} className="ll-tech-chip">{t}</span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Read more */}
                                            <Link
                                                href={route('tips.show', tip.slug)}
                                                className="mt-auto"
                                                style={{
                                                    fontSize: '0.8rem',
                                                    fontWeight: 700,
                                                    color: 'var(--ll-accent)',
                                                    textDecoration: 'none',
                                                }}
                                            >
                                                Read more →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </FrontendLayout>
    );
}
