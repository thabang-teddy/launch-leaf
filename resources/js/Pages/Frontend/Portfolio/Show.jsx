import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head, Link } from '@inertiajs/react';

export default function PortfolioShow({ item }) {
    return (
        <FrontendLayout>
            <Head title={item.title} />
            <div className="container py-5" style={{ maxWidth: '800px' }}>
                <Link href={route('portfolio.index')} className="text-muted small">&larr; Portfolio</Link>
                <h1 className="h2 mt-2 mb-3">{item.title}</h1>

                {item.tech_stack?.length > 0 && (
                    <div className="d-flex flex-wrap gap-1 mb-3">
                        {item.tech_stack.map(t => (
                            <span key={t} className="badge bg-secondary">{t}</span>
                        ))}
                    </div>
                )}

                <div className="d-flex gap-3 mb-4">
                    {item.live_url && <a href={item.live_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-primary">Live site</a>}
                    {item.repo_url && <a href={item.repo_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-secondary">Source</a>}
                </div>

                {item.content && (
                    <div className="mt-2" style={{ whiteSpace: 'pre-wrap' }}>{item.content}</div>
                )}
            </div>
        </FrontendLayout>
    );
}
