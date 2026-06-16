import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head, Link } from '@inertiajs/react';

function SkillIcon({ icon }) {
    if (!icon) return null;
    const isCssClass = /^[a-z][a-z0-9-_ ]*$/i.test(icon);
    return isCssClass
        ? <i className={icon} style={{ fontSize: '1.8rem', lineHeight: 1 }} />
        : <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{icon}</span>;
}

const DEFAULT_SKILLS = [
    { icon: '💡', name: 'Business Strategy',  description: 'Turning ideas into scalable, real-world solutions with a clear product vision.' },
    { icon: '📱', name: 'App Development',     description: 'Modern web and mobile applications built for performance and reliability.' },
    { icon: '🎨', name: 'UI / UX Design',      description: 'Clean, user-centred interfaces crafted for clarity and engagement.' },
    { icon: '🔒', name: 'Secure Systems',      description: 'Security-first architecture that protects users and data at every layer.' },
    { icon: '⚡', name: 'Performance',          description: 'Optimised, lightning-fast code that scales without compromise.' },
    { icon: '🚀', name: 'DevOps & CI/CD',      description: 'Reliable pipelines and cloud infrastructure for continuous delivery.' },
];

export default function Home({ personalInfo, skills }) {
    const displaySkills = skills?.length ? skills : DEFAULT_SKILLS;
    const info = personalInfo;

    return (
        <FrontendLayout>
            <Head title="Home" />

            {/* ── Hero ── */}
            <section className="ll-hero">
                <div className="container">
                    <div className="row align-items-center g-5">

                        {/* Text column */}
                        <div className="col-lg-6 order-2 order-lg-1">
                            <span className="ll-hero-eyebrow">Welcome to my world</span>

                            <h1 className="ll-hero-title">
                                Hi, I'm{' '}
                                <span className="accent">
                                    {info?.name ?? 'Your Name'}
                                </span>
                                <br />
                                <span style={{ fontSize: '0.78em', fontWeight: 700 }}>
                                    {info?.headline ?? 'a Developer & Creator'}
                                </span>
                            </h1>

                            <p className="ll-hero-desc">
                                {info?.bio ??
                                    'I build beautiful, performant web applications and enjoy solving complex problems with clean, maintainable code.'}
                            </p>

                            <div className="ll-hero-btns">
                                <Link href={route('portfolio.index')} className="btn-accent">
                                    View Portfolio
                                </Link>
                                <Link href={route('contact')} className="btn-outline-accent">
                                    Contact Me
                                </Link>
                            </div>

                            {/* Social links */}
                            <div className="ll-hero-social">
                                {info?.github_url && (
                                    <a href={info.github_url} target="_blank" rel="noreferrer" title="GitHub">
                                        GH
                                    </a>
                                )}
                                {info?.linkedin_url && (
                                    <a href={info.linkedin_url} target="_blank" rel="noreferrer" title="LinkedIn">
                                        LI
                                    </a>
                                )}
                                {info?.twitter_url && (
                                    <a href={info.twitter_url} target="_blank" rel="noreferrer" title="Twitter / X">
                                        𝕏
                                    </a>
                                )}
                                {info?.email && (
                                    <a href={`mailto:${info.email}`} title="Email">
                                        ✉
                                    </a>
                                )}
                                {info?.website_url && (
                                    <a href={info.website_url} target="_blank" rel="noreferrer" title="Website">
                                        🌐
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Photo column */}
                        <div className="col-lg-6 order-1 order-lg-2 text-center">
                            {info?.avatar_url ? (
                                <img
                                    src={info.avatar_url}
                                    alt={info.name}
                                    className="ll-hero-photo"
                                    style={{ height: '440px' }}
                                />
                            ) : (
                                <div className="ll-hero-placeholder">👤</div>
                            )}
                        </div>

                    </div>
                </div>
            </section>

            {/* ── Frameworks & Technologies ── */}
            <section className="ll-section-alt">
                <div className="container">
                    <div className="text-center mb-5">
                        <span className="ll-label">Features</span>
                        <h2 className="ll-title mt-1">Frameworks &amp; Technologies</h2>
                    </div>
                    <div className="row g-4">
                        {displaySkills.map((s, i) => (
                            <div key={s.name ?? i} className="col-md-6 col-lg-4">
                                <div className="ll-service-card">
                                    {s.icon && <div className="ll-service-icon"><SkillIcon icon={s.icon} /></div>}
                                    <h5>{s.name}</h5>
                                    {s.description && <p>{s.description}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Quick links ── */}
            <section className="ll-section">
                <div className="container">
                    <div className="row g-4">
                        <div className="col-md-4 text-center">
                            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🖼️</div>
                            <h5 className="fw-700 text-dark-ll mb-2">Portfolio</h5>
                            <p className="text-muted-ll small mb-3">A selection of projects I've built and shipped.</p>
                            <Link href={route('portfolio.index')} className="btn-outline-accent">Browse Work</Link>
                        </div>
                        <div className="col-md-4 text-center">
                            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>💼</div>
                            <h5 className="fw-700 text-dark-ll mb-2">Experience</h5>
                            <p className="text-muted-ll small mb-3">Where I've worked and what I've studied.</p>
                            <Link href={route('experience.index')} className="btn-outline-accent">See Journey</Link>
                        </div>
                        <div className="col-md-4 text-center">
                            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>✍️</div>
                            <h5 className="fw-700 text-dark-ll mb-2">Tips</h5>
                            <p className="text-muted-ll small mb-3">Problems I've solved, written down for later.</p>
                            <Link href={route('tips.index')} className="btn-outline-accent">Read Tips</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA band ── */}
            <section className="ll-section-alt text-center">
                <div className="container" style={{ maxWidth: '600px' }}>
                    <span className="ll-label">Contact</span>
                    <h2 className="ll-title mt-1 mb-3">Let's Work Together</h2>
                    <p className="text-muted-ll mb-4">
                        Have a project in mind? I'd love to hear about it.
                    </p>
                    <Link href={route('contact')} className="btn-accent">
                        Get In Touch
                    </Link>
                </div>
            </section>
        </FrontendLayout>
    );
}
