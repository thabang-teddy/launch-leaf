import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head } from '@inertiajs/react';

export default function CV({ info }) {
    if (!info) {
        return (
            <FrontendLayout>
                <Head title="CV" />
                <div className="container py-5"><p className="text-muted">CV not available yet.</p></div>
            </FrontendLayout>
        );
    }

    return (
        <FrontendLayout>
            <Head title="CV" />
            <div className="container py-5" style={{ maxWidth: '800px' }}>
                <div className="d-flex align-items-center gap-4 mb-4">
                    {info.avatar_path && (
                        <img src={`/storage/${info.avatar_path}`} alt={info.name}
                            className="rounded-circle" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                    )}
                    <div>
                        <h1 className="h2 mb-0">{info.name}</h1>
                        {info.headline && <p className="text-muted mb-0">{info.headline}</p>}
                    </div>
                </div>

                {info.bio && <p className="lead mb-4">{info.bio}</p>}

                <dl className="row">
                    {info.email    && <><dt className="col-sm-3">Email</dt><dd className="col-sm-9"><a href={`mailto:${info.email}`}>{info.email}</a></dd></>}
                    {info.phone    && <><dt className="col-sm-3">Phone</dt><dd className="col-sm-9">{info.phone}</dd></>}
                    {info.location && <><dt className="col-sm-3">Location</dt><dd className="col-sm-9">{info.location}</dd></>}
                    {info.website_url && <><dt className="col-sm-3">Website</dt><dd className="col-sm-9"><a href={info.website_url} target="_blank" rel="noreferrer">{info.website_url}</a></dd></>}
                    {info.linkedin_url && <><dt className="col-sm-3">LinkedIn</dt><dd className="col-sm-9"><a href={info.linkedin_url} target="_blank" rel="noreferrer">LinkedIn</a></dd></>}
                    {info.github_url  && <><dt className="col-sm-3">GitHub</dt><dd className="col-sm-9"><a href={info.github_url} target="_blank" rel="noreferrer">GitHub</a></dd></>}
                </dl>

                {info.resume_url && (
                    <a href={info.resume_url} target="_blank" rel="noreferrer" className="btn btn-primary mt-2">
                        Download résumé
                    </a>
                )}
            </div>
        </FrontendLayout>
    );
}
