import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function UserEdit({ user }) {
    const [tab, setTab] = useState('details');

    // Details form
    const details = useForm({ name: user.name ?? '', email: user.email ?? '' });

    // Password form
    const pwd = useForm({ current_password: '', password: '', password_confirmation: '' });

    const submitDetails = (e) => {
        e.preventDefault();
        details.patch(route('dashboard.user.update'));
    };

    const submitPassword = (e) => {
        e.preventDefault();
        pwd.put(route('dashboard.user.password'), {
            onSuccess: () => pwd.reset(),
        });
    };

    const tabStyle = (t) => ({
        padding: '8px 20px',
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '0.88rem',
        background: tab === t ? '#e74c3c' : 'transparent',
        color: tab === t ? '#fff' : '#888',
        transition: 'all 140ms ease',
    });

    return (
        <DashboardLayout header="Edit Account">
            <Head title="Edit Account" />

            <div style={{ maxWidth: '560px' }}>
                <div className="d-flex align-items-center gap-3 mb-4">
                    <Link href={route('dashboard.user.show')} className="btn btn-outline-secondary btn-sm">
                        ← Back
                    </Link>
                </div>

                {/* Tab switcher */}
                <div
                    className="d-flex gap-1 mb-4 p-1"
                    style={{ background: '#f5f5f5', borderRadius: 10, width: 'fit-content' }}
                >
                    <button style={tabStyle('details')} onClick={() => setTab('details')}>
                        Account Details
                    </button>
                    <button style={tabStyle('password')} onClick={() => setTab('password')}>
                        Change Password
                    </button>
                </div>

                {/* Account Details */}
                {tab === 'details' && (
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white fw-semibold">Account Details</div>
                        <div className="card-body">
                            {details.recentlySuccessful && (
                                <div className="alert alert-success py-2 mb-3">Details updated.</div>
                            )}
                            <form onSubmit={submitDetails}>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold small">Full Name</label>
                                    <input
                                        type="text"
                                        className={`form-control ${details.errors.name ? 'is-invalid' : ''}`}
                                        value={details.data.name}
                                        onChange={e => details.setData('name', e.target.value)}
                                        autoFocus
                                    />
                                    {details.errors.name && (
                                        <div className="invalid-feedback">{details.errors.name}</div>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-semibold small">Email Address</label>
                                    <input
                                        type="email"
                                        className={`form-control ${details.errors.email ? 'is-invalid' : ''}`}
                                        value={details.data.email}
                                        onChange={e => details.setData('email', e.target.value)}
                                    />
                                    {details.errors.email && (
                                        <div className="invalid-feedback">{details.errors.email}</div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-sm"
                                    disabled={details.processing}
                                >
                                    {details.processing ? 'Saving…' : 'Save Details'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Change Password */}
                {tab === 'password' && (
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white fw-semibold">Change Password</div>
                        <div className="card-body">
                            {pwd.recentlySuccessful && (
                                <div className="alert alert-success py-2 mb-3">Password updated.</div>
                            )}
                            <form onSubmit={submitPassword}>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold small">Current Password</label>
                                    <input
                                        type="password"
                                        className={`form-control ${pwd.errors.current_password ? 'is-invalid' : ''}`}
                                        value={pwd.data.current_password}
                                        onChange={e => pwd.setData('current_password', e.target.value)}
                                        autoFocus
                                    />
                                    {pwd.errors.current_password && (
                                        <div className="invalid-feedback">{pwd.errors.current_password}</div>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold small">New Password</label>
                                    <input
                                        type="password"
                                        className={`form-control ${pwd.errors.password ? 'is-invalid' : ''}`}
                                        value={pwd.data.password}
                                        onChange={e => pwd.setData('password', e.target.value)}
                                    />
                                    {pwd.errors.password && (
                                        <div className="invalid-feedback">{pwd.errors.password}</div>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-semibold small">Confirm New Password</label>
                                    <input
                                        type="password"
                                        className={`form-control ${pwd.errors.password_confirmation ? 'is-invalid' : ''}`}
                                        value={pwd.data.password_confirmation}
                                        onChange={e => pwd.setData('password_confirmation', e.target.value)}
                                    />
                                    {pwd.errors.password_confirmation && (
                                        <div className="invalid-feedback">{pwd.errors.password_confirmation}</div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-sm"
                                    disabled={pwd.processing}
                                >
                                    {pwd.processing ? 'Updating…' : 'Update Password'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
