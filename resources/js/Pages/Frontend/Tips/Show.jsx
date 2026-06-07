import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head, Link } from '@inertiajs/react';

export default function TipShow({ tip }) {
    return (
        <FrontendLayout>
            <Head title={tip.title} />
            <div className="container py-5" style={{ maxWidth: '800px' }}>
                <Link href={route('tips.index')} className="text-muted small">&larr; Tips</Link>
                <h1 className="h2 mt-2 mb-4">{tip.title}</h1>

                {tip.tags?.length > 0 && (
                    <div className="d-flex flex-wrap gap-1 mb-4">
                        {tip.tags.map(t => <span key={t} className="badge bg-secondary">{t}</span>)}
                    </div>
                )}

                <h5 className="text-danger">Problem</h5>
                <div className="mb-4" style={{ whiteSpace: 'pre-wrap' }}>{tip.problem}</div>

                <h5 className="text-success">Solution</h5>
                <div style={{ whiteSpace: 'pre-wrap' }}>{tip.solution}</div>
            </div>
        </FrontendLayout>
    );
}
