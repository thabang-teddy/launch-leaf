import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head, Link } from '@inertiajs/react';

export default function About({ info, skills = [] }) {
    if (!info) {
        return (
            <FrontendLayout>
                <Head title="About" />
                <div className="container py-5 text-center">
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
                    <p className="text-muted-ll">About page not available yet.</p>
                </div>
            </FrontendLayout>
        );
    }

    return (
        <FrontendLayout>
            <Head title="About" />

            {/* ── Hero strip ── */}
            <div className="ll-section-alt text-center" style={{ padding: '3.5rem 0' }}>
                <div className="container">
                    <span className="ll-label">Get to know me</span>
                    <h1 className="ll-title mt-1 mb-0">About Me</h1>
                </div>
            </div>

            {/* ── Main content ── */}
            <section className="ll-section">
                <div className="container" style={{ maxWidth: '860px' }}>

                    {/* Photo + name card */}
                    <div className="d-flex flex-column flex-md-row align-items-center gap-5 mb-5">
                        {/* Avatar */}
                        <div style={{ flexShrink: 0 }}>
                            {info.avatar_url ? (
                                <img
                                    src={info.avatar_url}
                                    alt={info.name}
                                    style={{
                                        width: '200px',
                                        height: '200px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        objectPosition: 'center top',
                                        border: '4px solid var(--ll-accent)',
                                        boxShadow: 'var(--ll-shadow-lg, 0 8px 32px rgba(0,0,0,0.12))',
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: '200px',
                                    height: '200px',
                                    borderRadius: '50%',
                                    background: 'var(--ll-accent-light)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '4rem',
                                    border: '4px solid var(--ll-accent)',
                                }}>
                                    👤
                                </div>
                            )}
                        </div>

                        {/* Name + headline + location */}
                        <div>
                            <h2
                                className="fw-800 text-dark-ll mb-1"
                                style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', lineHeight: 1.2 }}
                            >
                                {info.name}
                            </h2>
                            {info.headline && (
                                <p className="text-accent fw-700 mb-2" style={{ fontSize: '1.05rem' }}>
                                    {info.headline}
                                </p>
                            )}
                            {info.location && (
                                <p className="text-muted-ll mb-0" style={{ fontSize: '0.92rem' }}>
                                    📍 {info.location}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Bio */}
                    {info.bio && (
                        <div
                            className="mb-5"
                            style={{
                                borderLeft: '3px solid var(--ll-accent)',
                                paddingLeft: '1.5rem',
                            }}
                        >
                            <h3
                                className="fw-700 text-dark-ll mb-3"
                                style={{ fontSize: '1.1rem', letterSpacing: '0.02em' }}
                            >
                                My Story
                            </h3>
                            {info.bio.split('\n').filter(Boolean).map((paragraph, i) => (
                                <p
                                    key={i}
                                    style={{ lineHeight: 1.9, color: 'var(--ll-muted)', marginBottom: '1rem' }}
                                >
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    )}

                    {/* Skills / frameworks */}
                    {skills.length > 0 && (
                        <div className="mb-5">
                            <h3
                                className="fw-700 text-dark-ll mb-4"
                                style={{ fontSize: '1.1rem', letterSpacing: '0.02em' }}
                            >
                                Frameworks &amp; Technologies
                            </h3>
                            <div className="row g-3">
                                {skills.map(skill => (
                                    <div key={skill.id} className="col-sm-6">
                                        <div
                                            style={{
                                                border: '1px solid var(--ll-border, #e5e7eb)',
                                                borderRadius: '12px',
                                                padding: '1.25rem 1.25rem 1rem',
                                                background: 'var(--ll-surface, #fff)',
                                                height: '100%',
                                                transition: 'box-shadow 200ms ease, transform 200ms ease',
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            <div className="d-flex align-items-center gap-3 mb-2">
                                                {skill.icon ? (
                                                    <i
                                                        className={skill.icon}
                                                        style={{ fontSize: '2rem', lineHeight: 1, flexShrink: 0 }}
                                                    />
                                                ) : (
                                                    <span style={{ fontSize: '2rem', lineHeight: 1, flexShrink: 0 }}>🔧</span>
                                                )}
                                                <span
                                                    className="fw-700 text-dark-ll"
                                                    style={{ fontSize: '0.95rem' }}
                                                >
                                                    {skill.name}
                                                </span>
                                            </div>
                                            {skill.description && (
                                                <p
                                                    style={{
                                                        fontSize: '0.83rem',
                                                        lineHeight: 1.7,
                                                        color: 'var(--ll-muted)',
                                                        margin: 0,
                                                    }}
                                                >
                                                    {skill.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CTA */}
                    <div className="d-flex gap-3 flex-wrap pt-2">
                        <Link href={route('portfolio.index')} className="btn-accent">
                            View My Work
                        </Link>
                        <Link href={route('contact')} className="btn-outline-accent">
                            Get In Touch
                        </Link>
                    </div>
                </div>
            </section>
        </FrontendLayout>
    );
}
