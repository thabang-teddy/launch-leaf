import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head, Link } from '@inertiajs/react';

export default function ExperienceShow({ experience }) {
    return (
        <FrontendLayout>
            <Head title={experience.title} />
            <div className="container py-5" style={{ maxWidth: '800px' }}>
                <Link href={route('experience.index')} className="text-muted small">&larr; Experience</Link>
                <h1 className="h2 mt-2 mb-1">{experience.title}</h1>
                <div className="text-muted mb-1">
                    {experience.company}{experience.location ? ` · ${experience.location}` : ''}
                </div>
                <div className="text-muted small mb-3">
                    {experience.start_date} – {experience.is_current ? 'Present' : experience.end_date}
                </div>
                <span className={`badge mb-3 ${experience.type === 'education' ? 'bg-info' : 'bg-primary'}`}>
                    {experience.type}
                </span>
                {experience.description && (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{experience.description}</div>
                )}
            </div>
        </FrontendLayout>
    );
}
