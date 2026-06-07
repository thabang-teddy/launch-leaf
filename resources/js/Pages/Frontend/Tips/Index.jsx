import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head, Link } from '@inertiajs/react';

export default function TipsIndex({ tips }) {
    return (
        <FrontendLayout>
            <Head title="Tips" />
            <div className="container py-5" style={{ maxWidth: '800px' }}>
                <h1 className="h2 mb-4">Tips</h1>
                {tips.length === 0 ? (
                    <p className="text-muted">No tips yet.</p>
                ) : (
                    <div className="d-flex flex-column gap-3">
                        {tips.map(tip => (
                            <div key={tip.id} className="card">
                                <div className="card-body">
                                    <h5 className="card-title mb-1">
                                        <Link href={route('tips.show', tip.slug)}>{tip.title}</Link>
                                    </h5>
                                    {tip.tags?.length > 0 && (
                                        <div className="d-flex flex-wrap gap-1 mt-2">
                                            {tip.tags.map(t => (
                                                <span key={t} className="badge bg-light text-dark border">{t}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </FrontendLayout>
    );
}
