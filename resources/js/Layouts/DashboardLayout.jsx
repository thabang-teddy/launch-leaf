import { Link, usePage } from '@inertiajs/react';

const navItems = [
    { label: 'Dashboard',     href: 'dashboard',               icon: '🏠' },
    { label: 'GitHub Projects', href: 'dashboard.projects.index', icon: '💻' },
    { label: 'Accounts',      href: 'dashboard.accounts.index', icon: '🌐' },
    { label: 'Portfolio',     href: 'dashboard.portfolio.index',icon: '🗂️' },
    { label: 'Experience',    href: 'dashboard.experience.index',icon: '💼' },
    { label: 'Personal Info', href: 'dashboard.personal-info',  icon: '👤' },
    { label: 'Tips',          href: 'dashboard.tips.index',     icon: '💡' },
    { label: 'Pages',         href: 'dashboard.pages.index',    icon: '📄' },
    { label: 'Notes',         href: 'dashboard.notes.index',    icon: '📝' },
    { label: 'Kanban',        href: 'dashboard.kanban.index',   icon: '📋' },
    { label: 'Tasks',         href: 'dashboard.tasks.index',    icon: '✅' },
    { label: 'Contact',       href: 'dashboard.contact.index',  icon: '✉️' },
];

export default function DashboardLayout({ header, children }) {
    const { auth } = usePage().props;

    return (
        <div className="d-flex min-vh-100">
            {/* Sidebar */}
            <nav
                className="d-flex flex-column flex-shrink-0 p-3 bg-dark text-white"
                style={{ width: '240px' }}
            >
                <Link href={route('dashboard')} className="text-white text-decoration-none mb-3">
                    <span className="fs-5 fw-semibold">LaunchLeaf</span>
                </Link>
                <hr className="border-secondary" />
                <ul className="nav nav-pills flex-column mb-auto gap-1">
                    {navItems.map(({ label, href, icon }) => (
                        <li key={href} className="nav-item">
                            <Link
                                href={route(href)}
                                className={`nav-link text-white ${route().current(href) ? 'active bg-primary' : ''}`}
                            >
                                <span className="me-2">{icon}</span>{label}
                            </Link>
                        </li>
                    ))}
                </ul>
                <hr className="border-secondary" />
                <div className="d-flex align-items-center justify-content-between">
                    <small className="text-secondary">{auth?.user?.email}</small>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="btn btn-sm btn-outline-secondary"
                    >
                        Out
                    </Link>
                </div>
            </nav>

            {/* Main area */}
            <div className="flex-grow-1 d-flex flex-column overflow-auto">
                {header && (
                    <header className="bg-white border-bottom px-4 py-3">
                        <h1 className="h4 mb-0">{header}</h1>
                    </header>
                )}
                <main className="p-4 flex-grow-1 bg-light">
                    {children}
                </main>
            </div>
        </div>
    );
}
