import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head, Link } from '@inertiajs/react';

export default function ExperienceIndex({ experiences }) {
    return (
        <FrontendLayout>
            <Head title="Experience" />
            <div className="container py-5" style={{ maxWidth: '800px' }}>
                <h1 className="h2 mb-4">Experience</h1>
                {experiences.length === 0 ? (
                    <p className="text-muted">No experience listed yet.</p>
                ) : (
                    <div className="d-flex flex-column gap-3">
                        {experiences.map(e => (
                            <div key={e.id} className="card">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h5 className="mb-0">
                                                <Link href={route('experience.show', e.slug)}>{e.title}</Link>
                                            </h5>
                                            <div className="text-muted">{e.company}{e.location ? ` · ${e.location}` : ''}</div>
                                        </div>
                                        <span className="text-muted small text-nowrap ms-3">
                                            {e.start_date} – {e.is_current ? 'Present' : e.end_date}
                                        </span>
                                    </div>
                                    <span className={`badge mt-2 ${e.type === 'education' ? 'bg-info' : 'bg-primary'}`}>
                                        {e.type}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </FrontendLayout>
    );
}
