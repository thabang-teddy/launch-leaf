import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head, Link } from '@inertiajs/react';

function fmt(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function ExperienceShow({ experience: e }) {
    const isEducation = e.type === 'education';

    return (
        <FrontendLayout>
            <Head title={e.title} />

            <div className="container py-5" style={{ maxWidth: '800px' }}>
                {/* Back */}
                <Link href={route('experience.index')} className="ll-back-link">
                    ← Back to Experience
                </Link>

                {/* Type badge */}
                <div className="mt-3 mb-2">
                    <span
                        className="ll-platform-badge"
                        style={isEducation
                            ? { background: 'rgba(13,202,240,0.12)', color: '#0dcaf0' }
                            : undefined}
                    >
                        {isEducation ? '🎓 Education' : '💼 Work'}
                    </span>
                </div>

                {/* Heading */}
                <h1 className="ll-title mb-1">{e.title}</h1>

                {/* Meta */}
                <p className="text-muted-ll mb-1" style={{ fontWeight: 500 }}>
                    {e.company}
                    {e.location ? ` · ${e.location}` : ''}
                </p>
                <span className="ll-timeline-date">
                    {fmt(e.start_date)} – {e.is_current ? 'Present' : fmt(e.end_date)}
                </span>

                {/* Summary */}
                {e.summary && (
                    <p className="mt-3 mb-0" style={{ color: 'var(--ll-text)', fontStyle: 'italic' }}>
                        {e.summary}
                    </p>
                )}

                {/* Description */}
                {e.description && (
                    <div
                        className="mt-4 ll-prose"
                        dangerouslySetInnerHTML={{ __html: e.description }}
                    />
                )}
            </div>
        </FrontendLayout>
    );
}
