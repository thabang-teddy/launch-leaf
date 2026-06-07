import { useState } from 'react';
import { Link } from '@inertiajs/react';

export default function AuthenticatedLayout({ user, header, children }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="min-vh-100" style={{ background: 'var(--ll-bg-light)' }}>
            {/* Navbar */}
            <nav
                style={{
                    background: '#fff',
                    borderBottom: '1px solid var(--ll-border)',
                    padding: '0.6rem 0',
                    boxShadow: 'var(--ll-shadow-sm)',
                }}
            >
                <div className="container d-flex align-items-center justify-content-between">
                    {/* Brand */}
                    <Link
                        href="/"
                        style={{
                            fontSize: '1.25rem',
                            fontWeight: 800,
                            color: 'var(--ll-dark)',
                            textDecoration: 'none',
                        }}
                    >
                        Launch<span style={{ color: 'var(--ll-accent)' }}>Leaf</span>
                    </Link>

                    {/* User menu */}
                    <div className="position-relative">
                        <button
                            className="border-0 bg-transparent fw-semibold d-flex align-items-center gap-2"
                            style={{ color: 'var(--ll-text)', fontSize: '0.9rem', cursor: 'pointer' }}
                            onClick={() => setOpen(o => !o)}
                        >
                            {user?.name}
                            <span style={{ fontSize: '0.7rem' }}>▼</span>
                        </button>

                        {open && (
                            <div
                                style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: 'calc(100% + 0.5rem)',
                                    background: '#fff',
                                    border: '1px solid var(--ll-border)',
                                    borderRadius: '10px',
                                    boxShadow: 'var(--ll-shadow)',
                                    minWidth: '180px',
                                    zIndex: 200,
                                    overflow: 'hidden',
                                }}
                            >
                                <Link
                                    href={route('profile.edit')}
                                    className="d-block px-3 py-2 text-decoration-none"
                                    style={{ color: 'var(--ll-text)', fontSize: '0.88rem' }}
                                    onClick={() => setOpen(false)}
                                >
                                    Profile
                                </Link>
                                <Link
                                    href={route('dashboard.home')}
                                    className="d-block px-3 py-2 text-decoration-none"
                                    style={{ color: 'var(--ll-text)', fontSize: '0.88rem' }}
                                    onClick={() => setOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <div style={{ borderTop: '1px solid var(--ll-border)' }} />
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="d-block w-100 text-start px-3 py-2 border-0 bg-transparent"
                                    style={{ color: 'var(--ll-accent)', fontSize: '0.88rem', cursor: 'pointer' }}
                                    onClick={() => setOpen(false)}
                                >
                                    Log Out
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Optional page header */}
            {header && (
                <div style={{ background: '#fff', borderBottom: '1px solid var(--ll-border)', padding: '1.25rem 0' }}>
                    <div className="container">{header}</div>
                </div>
            )}

            <main className="container py-4">{children}</main>
        </div>
    );
}
