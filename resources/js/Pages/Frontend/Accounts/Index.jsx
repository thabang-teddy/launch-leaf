import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head, Link } from '@inertiajs/react';

export default function AccountsIndex({ accounts }) {
    return (
        <FrontendLayout>
            <Head title="Accounts" />

            {/* Header band */}
            <div className="ll-section-alt text-center" style={{ padding: '3rem 0' }}>
                <div className="container">
                    <span className="ll-label">Find Me Online</span>
                    <h1 className="ll-title mt-1">Other Accounts</h1>
                </div>
            </div>

            <section className="ll-section">
                <div className="container">
                    {accounts.length === 0 ? (
                        <div className="text-center py-5">
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔗</div>
                            <p className="text-muted-ll">No accounts listed yet.</p>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {accounts.map(a => (
                                <div key={a.id} className="col-md-6">
                                    <Link
                                        href={route('accounts.show', a.slug)}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <div
                                            className="p-4 rounded h-100"
                                            style={{
                                                background: '#fff',
                                                border: '1px solid var(--ll-border)',
                                                transition: 'var(--ll-t)',
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.boxShadow = 'var(--ll-shadow)';
                                                e.currentTarget.style.transform = 'translateY(-3px)';
                                                e.currentTarget.style.borderColor = 'transparent';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.boxShadow = '';
                                                e.currentTarget.style.transform = '';
                                                e.currentTarget.style.borderColor = 'var(--ll-border)';
                                            }}
                                        >
                                            <div className="d-flex align-items-start gap-3">
                                                <div className="ll-service-icon mt-1" style={{ flexShrink: 0 }}>🔗</div>
                                                <div>
                                                    <span className="ll-platform-badge mb-2 d-inline-block">
                                                        {a.platform}
                                                    </span>
                                                    <h5 className="fw-700 text-dark-ll mb-1" style={{ fontSize: '0.97rem' }}>
                                                        {a.title}
                                                    </h5>
                                                    <p className="text-muted-ll small mb-1">@{a.username}</p>
                                                    {a.description && (
                                                        <p className="text-muted-ll small mb-0" style={{ lineHeight: 1.6 }}>
                                                            {a.description.length > 100
                                                                ? a.description.substring(0, 100) + '…'
                                                                : a.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </FrontendLayout>
    );
}
