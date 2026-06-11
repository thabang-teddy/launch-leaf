import { Link } from '@inertiajs/react';
import { useState } from 'react';

const NAV_LINKS = [
    { label: 'Home',       href: () => route('home') },
    { label: 'About',      href: () => route('about') },
    { label: 'Portfolio',  href: () => route('portfolio.index'),  active: 'portfolio.*' },
    { label: 'Projects',   href: () => route('projects.index'),   active: 'projects.*'  },
    { label: 'Experience', href: () => route('experience.index'), active: 'experience.*'},
    { label: 'Tips',       href: () => route('tips.index'),       active: 'tips.*'      },
];

function isActive(pattern) {
    try {
        return route().current(pattern ?? '');
    } catch {
        return false;
    }
}

export default function FrontendLayout({ children }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="d-flex flex-column min-vh-100">
            {/* ── Navbar ── */}
            <nav className="ll-nav">
                <div className="container">
                    <div className="d-flex align-items-center justify-content-between">
                        {/* Brand */}
                        <Link href={route('home')} className="ll-brand">
                            Launch<span>Leaf</span>
                        </Link>

                        {/* Desktop links */}
                        <div className="d-none d-lg-flex align-items-center gap-1">
                            {NAV_LINKS.map(link => (
                                <Link
                                    key={link.label}
                                    href={link.href()}
                                    className={`ll-link ${isActive(link.active ?? link.label.toLowerCase()) ? 'active' : ''}`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <Link href={route('contact')} className="ll-hire-btn ms-2">
                                Get In Touch
                            </Link>
                        </div>

                        {/* Mobile toggle */}
                        <button
                            className="border-0 bg-transparent d-lg-none p-1"
                            onClick={() => setMobileOpen(o => !o)}
                            aria-label="Toggle menu"
                            style={{ fontSize: '1.4rem', color: 'var(--ll-dark)', lineHeight: 1 }}
                        >
                            {mobileOpen ? '✕' : '☰'}
                        </button>
                    </div>

                    {/* Mobile menu */}
                    {mobileOpen && (
                        <div className="ll-mobile-menu">
                            {NAV_LINKS.map(link => (
                                <Link
                                    key={link.label}
                                    href={link.href()}
                                    className={`ll-link ${isActive(link.active ?? link.label.toLowerCase()) ? 'active' : ''}`}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <Link
                                href={route('contact')}
                                className="ll-hire-btn d-inline-block mt-2"
                                onClick={() => setMobileOpen(false)}
                            >
                                Get In Touch
                            </Link>
                        </div>
                    )}
                </div>
            </nav>

            {/* ── Page content ── */}
            <main className="flex-grow-1">
                {children}
            </main>

            {/* ── Footer ── */}
            <footer className="ll-footer">
                <div className="container">
                    &copy; {new Date().getFullYear()} LaunchLeaf &mdash; Built with care.
                </div>
            </footer>
        </div>
    );
}
