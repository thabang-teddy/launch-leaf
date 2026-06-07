import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

const CONTACT_ITEMS = [
    { icon: '✉', label: 'Email', key: 'email', href: v => `mailto:${v}` },
    { icon: '📍', label: 'Location', key: 'location', href: null },
    { icon: '🌐', label: 'Website', key: 'website_url', href: v => v },
];

export default function Contact() {
    const { flash, personalInfo } = usePage().props;
    const info = personalInfo ?? {};

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '', email: '', subject: '', message: '',
    });

    const submit = e => {
        e.preventDefault();
        post(route('contact.store'), { onSuccess: () => reset() });
    };

    return (
        <FrontendLayout>
            <Head title="Contact" />

            {/* Header band */}
            <div className="ll-section-alt text-center" style={{ padding: '3rem 0' }}>
                <div className="container">
                    <span className="ll-label">Get in Touch</span>
                    <h1 className="ll-title mt-1">Contact With Me</h1>
                </div>
            </div>

            <section className="ll-section">
                <div className="container">
                    <div className="row g-5">

                        {/* Left: contact info */}
                        <div className="col-lg-4">
                            <h5 className="fw-800 text-dark-ll mb-4">Contact Information</h5>

                            {info.email && (
                                <div className="ll-contact-item">
                                    <div className="ll-contact-icon">✉</div>
                                    <div>
                                        <div className="ll-contact-label">Email</div>
                                        <a href={`mailto:${info.email}`} className="ll-contact-value">
                                            {info.email}
                                        </a>
                                    </div>
                                </div>
                            )}

                            {info.phone && (
                                <div className="ll-contact-item">
                                    <div className="ll-contact-icon">📞</div>
                                    <div>
                                        <div className="ll-contact-label">Phone</div>
                                        <span className="ll-contact-value">{info.phone}</span>
                                    </div>
                                </div>
                            )}

                            {info.location && (
                                <div className="ll-contact-item">
                                    <div className="ll-contact-icon">📍</div>
                                    <div>
                                        <div className="ll-contact-label">Location</div>
                                        <span className="ll-contact-value">{info.location}</span>
                                    </div>
                                </div>
                            )}

                            {/* Social links */}
                            <div className="mt-4">
                                <div className="ll-contact-label mb-2">Follow Me</div>
                                <div className="ll-hero-social" style={{ gap: '0.5rem' }}>
                                    {info.github_url && (
                                        <a href={info.github_url} target="_blank" rel="noreferrer" title="GitHub">GH</a>
                                    )}
                                    {info.linkedin_url && (
                                        <a href={info.linkedin_url} target="_blank" rel="noreferrer" title="LinkedIn">LI</a>
                                    )}
                                    {info.twitter_url && (
                                        <a href={info.twitter_url} target="_blank" rel="noreferrer" title="Twitter">𝕏</a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: form */}
                        <div className="col-lg-8">
                            {flash?.success && (
                                <div
                                    className="mb-4 p-3 rounded"
                                    style={{
                                        background: 'rgba(25,135,84,0.08)',
                                        border: '1px solid rgba(25,135,84,0.25)',
                                        color: '#146c43',
                                        fontSize: '0.9rem',
                                    }}
                                >
                                    ✓ {flash.success}
                                </div>
                            )}

                            <form onSubmit={submit}>
                                <div className="row g-3">
                                    <div className="col-sm-6">
                                        <label className="form-label small fw-700">Your Name</label>
                                        <input
                                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                            placeholder="John Doe"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                        />
                                        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                    </div>
                                    <div className="col-sm-6">
                                        <label className="form-label small fw-700">Email Address</label>
                                        <input
                                            type="email"
                                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                            placeholder="john@example.com"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                        />
                                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small fw-700">
                                            Subject{' '}
                                            <span className="text-muted-ll fw-400">(optional)</span>
                                        </label>
                                        <input
                                            className="form-control"
                                            placeholder="Project inquiry"
                                            value={data.subject}
                                            onChange={e => setData('subject', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small fw-700">Message</label>
                                        <textarea
                                            rows={6}
                                            className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                                            placeholder="Tell me about your project…"
                                            value={data.message}
                                            onChange={e => setData('message', e.target.value)}
                                        />
                                        {errors.message && <div className="invalid-feedback">{errors.message}</div>}
                                    </div>
                                    <div className="col-12">
                                        <button
                                            type="submit"
                                            className="btn-accent"
                                            disabled={processing}
                                        >
                                            {processing ? 'Sending…' : 'Send Message'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                    </div>
                </div>
            </section>
        </FrontendLayout>
    );
}
