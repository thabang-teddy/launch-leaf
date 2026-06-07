import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head, Link } from '@inertiajs/react';

export default function PortfolioIndex({ items }) {
    return (
        <FrontendLayout>
            <Head title="Portfolio" />

            {/* Header band */}
            <div className="ll-section-alt py-4 text-center" style={{ padding: '3rem 0' }}>
                <div className="container">
                    <span className="ll-label">My Work</span>
                    <h1 className="ll-title mt-1">My Portfolio</h1>
                </div>
            </div>

            <section className="ll-section">
                <div className="container">
                    {items.length === 0 ? (
                        <div className="text-center py-5">
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🖼️</div>
                            <p className="text-muted-ll">No portfolio items yet.</p>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {items.map(item => (
                                <div key={item.id} className="col-md-6 col-lg-4">
                                    <Link
                                        href={route('portfolio.show', item.slug)}
                                        className="ll-portfolio-card"
                                    >
                                        <div className="ll-portfolio-img">
                                            {item.image_path ? (
                                                <img
                                                    src={`/storage/${item.image_path}`}
                                                    alt={item.title}
                                                />
                                            ) : (
                                                <div className="ll-portfolio-placeholder">🖼️</div>
                                            )}
                                            <div className="ll-portfolio-overlay">
                                                <span className="text-white fw-700">View Project →</span>
                                            </div>
                                        </div>

                                        <div className="ll-portfolio-body">
                                            {item.tech_stack?.length > 0 && (
                                                <div className="d-flex flex-wrap gap-1 mb-2">
                                                    {item.tech_stack.slice(0, 4).map(t => (
                                                        <span key={t} className="ll-tech-chip">{t}</span>
                                                    ))}
                                                </div>
                                            )}
                                            <h5 className="fw-700 text-dark-ll mb-1" style={{ fontSize: '0.97rem' }}>
                                                {item.title}
                                            </h5>
                                            {item.description && (
                                                <p className="text-muted-ll small mb-0" style={{ lineHeight: 1.6 }}>
                                                    {item.description.length > 90
                                                        ? item.description.substring(0, 90) + '…'
                                                        : item.description}
                                                </p>
                                            )}
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
