import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head, Link } from '@inertiajs/react';
import ReactMarkdown from 'react-markdown';

export default function TipShow({ tip }) {
    return (
        <FrontendLayout>
            <Head title={tip.title} />

            <div className="container py-5" style={{ maxWidth: '800px' }}>
                {/* Back */}
                <Link href={route('tips.index')} className="ll-back-link">
                    ← Back to Tips
                </Link>

                {/* Tags */}
                {tip.tags?.length > 0 && (
                    <div className="d-flex flex-wrap gap-1 mt-3 mb-2">
                        {tip.tags.map(t => (
                            <span key={t} className="ll-tech-chip">{t}</span>
                        ))}
                    </div>
                )}

                {/* Title */}
                <h1 className="ll-title mt-2 mb-4">{tip.title}</h1>

                {/* Problem */}
                <div
                    className="p-4 mb-4 rounded"
                    style={{
                        background: 'rgba(220,53,69,0.05)',
                        border: '1px solid rgba(220,53,69,0.18)',
                        borderLeft: '4px solid #dc3545',
                    }}
                >
                    <div
                        className="fw-800 mb-2"
                        style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#dc3545' }}
                    >
                        🔴 Problem
                    </div>
                    <div className="ll-prose"><ReactMarkdown>{tip.problem}</ReactMarkdown></div>
                </div>

                {/* Solution */}
                <div
                    className="p-4 rounded"
                    style={{
                        background: 'rgba(25,135,84,0.05)',
                        border: '1px solid rgba(25,135,84,0.18)',
                        borderLeft: '4px solid #198754',
                    }}
                >
                    <div
                        className="fw-800 mb-2"
                        style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#198754' }}
                    >
                        ✅ Solution
                    </div>
                    <div className="ll-prose"><ReactMarkdown>{tip.solution}</ReactMarkdown></div>
                </div>
            </div>
        </FrontendLayout>
    );
}
