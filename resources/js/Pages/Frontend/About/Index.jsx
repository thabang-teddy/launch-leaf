import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head, Link } from '@inertiajs/react';

export default function About({ info }) {
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
                    <div
                        className="d-flex flex-column flex-md-row align-items-center gap-5 mb-5"
                    >
                        {/* Avatar */}
                        <div style={{ flexShrink: 0 }}>
                            {info.avatar_path ? (
                                <img
                                    src={`/storage/${info.avatar_path}`}
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
                                <p
                                    className="text-accent fw-700 mb-2"
                                    style={{ fontSize: '1.05rem' }}
                                >
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
