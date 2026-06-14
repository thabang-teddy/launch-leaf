import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';

export default function UserShow({ user }) {
    const initial = (user.name ?? user.email ?? '?').charAt(0).toUpperCase();

    const fmt = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
        });
    };

    return (
        <DashboardLayout header="My Account">
            <Head title="My Account" />

            <div className="d-flex justify-content-end mb-4">
                <Link href={route('dashboard.user.edit')} className="btn btn-primary btn-sm">
                    Edit Account
                </Link>
            </div>

            <div style={{ maxWidth: '560px' }}>
                {/* Identity card */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body">
                        <div className="d-flex align-items-center gap-4">
                            {/* Avatar initials */}
                            <div style={{
                                width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
                                background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontWeight: 800, fontSize: '1.6rem',
                            }}>
                                {initial}
                            </div>

                            <div>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>
                                    {user.name}
                                </h2>
                                <p style={{ color: '#6c757d', fontSize: '0.88rem', marginBottom: 0 }}>
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-white fw-semibold">Account Details</div>
                    <div className="card-body p-0">
                        {[
                            { label: 'Name',           value: user.name },
                            { label: 'Email',          value: user.email },
                            {
                                label: 'Email verified',
                                value: user.email_verified_at
                                    ? `Yes — ${fmt(user.email_verified_at)}`
                                    : 'Not verified',
                            },
                            { label: 'Member since', value: fmt(user.created_at) },
                        ].map(({ label, value }) => (
                            <div
                                key={label}
                                className="d-flex align-items-center px-4 py-3"
                                style={{ borderBottom: '1px solid #f0f0f0' }}
                            >
                                <span style={{ width: 130, fontSize: '0.82rem', color: '#888', fontWeight: 600, flexShrink: 0 }}>
                                    {label}
                                </span>
                                <span style={{ fontSize: '0.9rem', color: '#222' }}>
                                    {value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick actions */}
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white fw-semibold">Security</div>
                    <div className="card-body d-flex gap-2">
                        <Link href={route('dashboard.user.edit')} className="btn btn-outline-secondary btn-sm">
                            Change Password
                        </Link>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
