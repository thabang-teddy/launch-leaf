import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div
            className="min-vh-100 d-flex flex-column align-items-center justify-content-center"
            style={{ background: 'var(--ll-bg-light)' }}
        >
            {/* Brand */}
            <Link
                href="/"
                style={{
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    color: 'var(--ll-dark)',
                    textDecoration: 'none',
                    letterSpacing: '-0.01em',
                    marginBottom: '1.5rem',
                    display: 'block',
                }}
            >
                Launch<span style={{ color: 'var(--ll-accent)' }}>Leaf</span>
            </Link>

            {/* Card */}
            <div
                style={{
                    width: '100%',
                    maxWidth: '440px',
                    background: '#fff',
                    borderRadius: '16px',
                    boxShadow: 'var(--ll-shadow)',
                    padding: '2.25rem 2.5rem',
                    border: '1px solid var(--ll-border)',
                }}
            >
                {children}
            </div>
        </div>
    );
}
