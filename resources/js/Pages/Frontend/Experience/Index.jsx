import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head, Link } from '@inertiajs/react';

function fmt(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function Timeline({ items }) {
    return (
        <div className="ll-timeline">
            {items.map(e => (
                <div key={e.id} className="ll-timeline-item">
                    <span className="ll-timeline-date">
                        {fmt(e.start_date)} – {e.is_current ? 'Present' : fmt(e.end_date)}
                    </span>
                    <div className="ll-timeline-title">{e.title}</div>
                    <div className="ll-timeline-company">
                        {e.company}{e.location ? ` · ${e.location}` : ''}
                    </div>
                    {e.description && (
                        <p className="text-muted-ll small mb-1" style={{ lineHeight: 1.65 }}>
                            {e.description.length > 180
                                ? e.description.substring(0, 180) + '…'
                                : e.description}
                        </p>
                    )}
                    <Link href={route('experience.show', e.slug)} className="ll-timeline-more">
                        View details →
                    </Link>
                </div>
            ))}
        </div>
    );
}

export default function ExperienceIndex({ experiences }) {
    const work      = experiences.filter(e => e.type === 'work');
    const education = experiences.filter(e => e.type === 'education');
    const other     = experiences.filter(e => e.type !== 'work' && e.type !== 'education');

    return (
        <FrontendLayout>
            <Head title="Experience" />

            {/* Header band */}
            <div className="ll-section-alt text-center" style={{ padding: '3rem 0' }}>
                <div className="container">
                    <span className="ll-label">My Journey</span>
                    <h1 className="ll-title mt-1">Experience &amp; Education</h1>
                </div>
            </div>

            <section className="ll-section">
                <div className="container">
                    {experiences.length === 0 ? (
                        <div className="text-center py-5">
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💼</div>
                            <p className="text-muted-ll">No experience listed yet.</p>
                        </div>
                    ) : (
                        <div className="row g-5">
                            {/* Work */}
                            {(work.length > 0 || other.length > 0) && (
                                <div className="col-lg-6">
                                    <h4 className="fw-800 text-dark-ll mb-4">
                                        <span className="text-accent me-2">💼</span>
                                        Work Experience
                                    </h4>
                                    <Timeline items={[...work, ...other]} />
                                </div>
                            )}

                            {/* Education */}
                            {education.length > 0 && (
                                <div className="col-lg-6">
                                    <h4 className="fw-800 text-dark-ll mb-4">
                                        <span className="text-accent me-2">🎓</span>
                                        Education
                                    </h4>
                                    <Timeline items={education} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </FrontendLayout>
    );
}
