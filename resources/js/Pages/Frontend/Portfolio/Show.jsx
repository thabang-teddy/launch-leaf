import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head, Link } from '@inertiajs/react';

export default function PortfolioShow({ item }) {
    return (
        <FrontendLayout>
            <Head title={item.title} />

            <div className="container py-5" style={{ maxWidth: '860px' }}>
                {/* Back */}
                <Link href={route('portfolio.index')} className="ll-back-link">
                    ← Back to Portfolio
                </Link>

                {/* Header */}
                <div className="mt-3 mb-4">
                    {item.tech_stack?.length > 0 && (
                        <div className="d-flex flex-wrap gap-1 mb-3">
                            {item.tech_stack.map(t => (
                                <span key={t} className="ll-tech-chip">{t}</span>
                            ))}
                        </div>
                    )}
                    <h1 className="ll-title mb-2">{item.title}</h1>
                    {item.description && (
                        <p className="text-muted-ll" style={{ lineHeight: 1.75 }}>{item.description}</p>
                    )}
                    <div className="d-flex flex-wrap gap-2 mt-3">
                        {item.live_url && (
                            <a href={item.live_url} target="_blank" rel="noreferrer" className="btn-accent">
                                Live Site →
                            </a>
                        )}
                        {item.repo_url && (
                            <a href={item.repo_url} target="_blank" rel="noreferrer" className="btn-outline-accent">
                                Source Code
                            </a>
                        )}
                    </div>
                </div>

                {/* Cover image */}
                {item.image_path && (
                    <div className="mb-4">
                        <img
                            src={`/storage/${item.image_path}`}
                            alt={item.title}
                            className="w-100 rounded"
                            style={{ objectFit: 'cover', maxHeight: '400px', borderRadius: 'var(--ll-radius)' }}
                        />
                    </div>
                )}

                {/* Content */}
                {item.content && (
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{item.content}</div>
                )}
            </div>
        </FrontendLayout>
    );
}
