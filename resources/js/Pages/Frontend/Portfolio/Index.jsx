import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head, Link } from '@inertiajs/react';

export default function PortfolioIndex({ items }) {
    return (
        <FrontendLayout>
            <Head title="Portfolio" />
            <div className="container py-5">
                <h1 className="h2 mb-4">Portfolio</h1>
                {items.length === 0 ? (
                    <p className="text-muted">No portfolio items yet.</p>
                ) : (
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                        {items.map(item => (
                            <div key={item.id} className="col">
                                <div className="card h-100">
                                    {item.image_path && (
                                        <img src={`/storage/${item.image_path}`} className="card-img-top"
                                            alt={item.title} style={{ height: '180px', objectFit: 'cover' }} />
                                    )}
                                    <div className="card-body">
                                        <h5 className="card-title">
                                            <Link href={route('portfolio.show', item.slug)}>{item.title}</Link>
                                        </h5>
                                        {item.description && <p className="card-text text-muted small">{item.description}</p>}
                                        {item.tech_stack?.length > 0 && (
                                            <div className="d-flex flex-wrap gap-1 mt-2">
                                                {item.tech_stack.map(t => (
                                                    <span key={t} className="badge bg-light text-dark border">{t}</span>
                                                ))}
                                            </div>
                                        )}
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
