import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

const TABS = ['About', 'Contact Info', 'Links'];

export default function CV({ info }) {
    const [tab, setTab] = useState('About');

    if (!info) {
        return (
            <FrontendLayout>
                <Head title="CV" />
                <div className="container py-5 text-center">
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
                    <p className="text-muted-ll">CV not available yet.</p>
                </div>
            </FrontendLayout>
        );
    }

    return (
        <FrontendLayout>
            <Head title="CV" />

            {/* Hero strip */}
            <div className="ll-section-alt text-center" style={{ padding: '3.5rem 0' }}>
                <div className="container">
                    <span className="ll-label">About Me</span>
                    <h1 className="ll-title mt-1 mb-0">My Resume</h1>
                </div>
            </div>

            <section className="ll-section">
                <div className="container" style={{ maxWidth: '900px' }}>
                    {/* Profile card */}
                    <div
                        className="d-flex flex-column flex-md-row align-items-center align-items-md-start gap-4 mb-5 p-4 rounded"
                        style={{ background: 'var(--ll-bg-light)', border: '1px solid var(--ll-border)' }}
                    >
                        {/* Avatar */}
                        <div style={{ flexShrink: 0 }}>
                            {info.avatar_path ? (
                                <img
                                    src={`/storage/${info.avatar_path}`}
                                    alt={info.name}
                                    style={{
                                        width: '110px',
                                        height: '110px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '3px solid #fff',
                                        boxShadow: 'var(--ll-shadow)',
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: '110px',
                                    height: '110px',
                                    borderRadius: '50%',
                                    background: 'var(--ll-accent-light)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2.5rem',
                                }}>
                                    👤
                                </div>
                            )}
                        </div>

                        {/* Name + headline */}
                        <div className="text-center text-md-start">
                            <h2 className="fw-800 text-dark-ll mb-1">{info.name}</h2>
                            {info.headline && (
                                <p className="text-accent fw-700 mb-1" style={{ fontSize: '1rem' }}>
                                    {info.headline}
                                </p>
                            )}
                            {info.location && (
                                <p className="text-muted-ll small mb-2">📍 {info.location}</p>
                            )}
                            {info.resume_url && (
                                <a
                                    href={info.resume_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn-accent"
                                    style={{ fontSize: '0.82rem', padding: '0.4rem 1.1rem' }}
                                >
                                    Download Résumé
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Tab nav */}
                    <div className="d-flex gap-2 mb-4 border-bottom pb-0">
                        {TABS.map(t => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className="border-0 bg-transparent px-3 py-2 fw-700"
                                style={{
                                    fontSize: '0.88rem',
                                    color: tab === t ? 'var(--ll-accent)' : 'var(--ll-muted)',
                                    borderBottom: tab === t ? '2px solid var(--ll-accent)' : '2px solid transparent',
                                    marginBottom: '-1px',
                                    cursor: 'pointer',
                                    transition: 'color var(--ll-t)',
                                }}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {/* Tab: About */}
                    {tab === 'About' && (
                        <div>
                            {info.bio ? (
                                <p style={{ lineHeight: 1.85, maxWidth: '680px' }}>{info.bio}</p>
                            ) : (
                                <p className="text-muted-ll">No bio added yet.</p>
                            )}
                        </div>
                    )}

                    {/* Tab: Contact Info */}
                    {tab === 'Contact Info' && (
                        <div className="row g-3">
                            {info.email && (
                                <div className="col-sm-6">
                                    <div className="ll-contact-item" style={{ marginBottom: 0 }}>
                                        <div className="ll-contact-icon">✉</div>
                                        <div>
                                            <div className="ll-contact-label">Email</div>
                                            <a href={`mailto:${info.email}`} className="ll-contact-value">
                                                {info.email}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {info.phone && (
                                <div className="col-sm-6">
                                    <div className="ll-contact-item" style={{ marginBottom: 0 }}>
                                        <div className="ll-contact-icon">📞</div>
                                        <div>
                                            <div className="ll-contact-label">Phone</div>
                                            <span className="ll-contact-value">{info.phone}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {info.location && (
                                <div className="col-sm-6">
                                    <div className="ll-contact-item" style={{ marginBottom: 0 }}>
                                        <div className="ll-contact-icon">📍</div>
                                        <div>
                                            <div className="ll-contact-label">Location</div>
                                            <span className="ll-contact-value">{info.location}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab: Links */}
                    {tab === 'Links' && (
                        <div className="row g-3">
                            {[
                                { label: 'Website',  url: info.website_url,  icon: '🌐' },
                                { label: 'GitHub',   url: info.github_url,   icon: '' },
                                { label: 'LinkedIn', url: info.linkedin_url, icon: '🔗' },
                                { label: 'Twitter',  url: info.twitter_url,  icon: '𝕏' },
                            ]
                                .filter(l => l.url)
                                .map(l => (
                                    <div key={l.label} className="col-sm-6">
                                        <div className="ll-contact-item" style={{ marginBottom: 0 }}>
                                            <div className="ll-contact-icon">{l.icon}</div>
                                            <div>
                                                <div className="ll-contact-label">{l.label}</div>
                                                <a
                                                    href={l.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="ll-contact-value"
                                                    style={{ wordBreak: 'break-all' }}
                                                >
                                                    {l.url}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}

                    {/* CTA */}
                    <div className="mt-5 pt-4 border-top d-flex gap-3 flex-wrap">
                        <Link href={route('contact')} className="btn-accent">
                            Get In Touch
                        </Link>
                        <Link href={route('portfolio.index')} className="btn-outline-accent">
                            View Portfolio
                        </Link>
                    </div>
                </div>
            </section>
        </FrontendLayout>
    );
}
