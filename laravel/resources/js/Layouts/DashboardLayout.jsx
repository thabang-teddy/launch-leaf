import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
    green:     '#e74c3c',
    greenSoft: 'rgba(231,76,60,0.10)',
    greenText: '#c0392b',
    sidebar:   '#FFFFFF',
    bg:        '#f7f7f7',
    border:    '#ebebeb',
    text:      '#1a1a2e',
    muted:     '#888',
    card:      '#FFFFFF',
};

// ─── SVG icon set (Feather-style, 24×24 viewBox) ─────────────────────────────
function Ico({ name, size = 16, color = 'currentColor' }) {
    const p = {
        home:      <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
        code:      <><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></>,
        link:      <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
        briefcase: <><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>,
        clock:     <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
        user:      <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
        bulb:      <><line x1="12" y1="2" x2="12" y2="3"/><path d="M12 5a7 7 0 0 1 7 7c0 3-1.8 5.4-4 6.6V20a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-1.4C6.8 17.4 5 15 5 12a7 7 0 0 1 7-7z"/><line x1="9" y1="21" x2="15" y2="21"/></>,
        file:      <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
        edit:      <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
        kanban:    <><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="4" height="7" rx="1"/></>,
        check:     <><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>,
        mail:      <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
        bell:      <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
        logout:    <><path d="M9 21H5a2 2 0 0 0-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
        search:    <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
        globe:     <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
        layers:    <><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>,
        menu:      <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>,
        x:         <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
        download:  <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    };
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
             stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
             style={{ display: 'block', flexShrink: 0 }}>
            {p[name] ?? null}
        </svg>
    );
}

// ─── Nav definition ───────────────────────────────────────────────────────────
const NAV = [
    { label: 'Dashboard',    href: 'dashboard.home',            icon: 'home',      match: 'dashboard.home' },
    { label: 'Projects',     href: 'dashboard.projects.index',  icon: 'code',      match: 'dashboard.projects.*' },
    { label: 'Accounts',     href: 'dashboard.accounts.index',  icon: 'globe',     match: 'dashboard.accounts.*' },
    { label: 'Portfolio',    href: 'dashboard.portfolio.index', icon: 'briefcase', match: 'dashboard.portfolio.*' },
    { label: 'Experience',   href: 'dashboard.experience.index',icon: 'clock',     match: 'dashboard.experience.*' },
    { label: 'Skills',       href: 'dashboard.skills.index',    icon: 'layers',    match: 'dashboard.skills.*' },
    { label: 'Personal Info',href: 'dashboard.personal-info',   icon: 'user',      match: 'dashboard.personal-info*' },
    { label: 'Tips',         href: 'dashboard.tips.index',      icon: 'bulb',      match: 'dashboard.tips.*' },
    { label: 'Pages',        href: 'dashboard.pages.index',     icon: 'file',      match: 'dashboard.pages.*' },
    { label: 'Notes',        href: 'dashboard.notes.index',     icon: 'edit',      match: 'dashboard.notes.*' },
    { label: 'Kanban',       href: 'dashboard.kanban.index',    icon: 'kanban',    match: 'dashboard.kanban*' },
    { label: 'Tasks',        href: 'dashboard.tasks.index',     icon: 'check',     match: 'dashboard.tasks.*' },
    { label: 'Contact',      href: 'dashboard.contact.index',   icon: 'mail',      match: 'dashboard.contact.*' },
    { label: 'Downloads',    href: 'dashboard.downloads',       icon: 'download',  match: 'dashboard.downloads' },
    { label: 'My Account',   href: 'dashboard.user.show',       icon: 'user',      match: 'dashboard.user*' },
];

// ─── Hover-aware nav link ─────────────────────────────────────────────────────
function safeRoute(name) {
    try { return route(name); } catch (_) { return '#'; }
}

function NavLink({ item, onClick }) {
    const active = route().current(item.match);
    const [hovered, setHovered] = useState(false);

    const bg    = active ? C.greenSoft : hovered ? '#fdf1f0' : 'transparent';
    const color = active ? C.greenText : hovered ? C.greenText : C.muted;
    const fw    = active ? 600 : 500;

    return (
        <Link
            href={safeRoute(item.href)}
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 9, marginBottom: 1,
                textDecoration: 'none', fontSize: 13.5, fontWeight: fw,
                color, background: bg, transition: 'all 140ms ease',
            }}
        >
            <Ico name={item.icon} color={color} size={15} />
            {item.label}
        </Link>
    );
}

// ─── Icon button ──────────────────────────────────────────────────────────────
function IconBtn({ icon, onClick, title }) {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            onClick={onClick}
            title={title}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: hovered ? '#f7f7f7' : 'none', border: 'none', cursor: 'pointer',
                padding: 7, borderRadius: 8, color: C.muted, display: 'flex',
                alignItems: 'center', transition: 'background 140ms ease',
            }}
        >
            <Ico name={icon} size={17} color={C.muted} />
        </button>
    );
}

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function DashboardLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const { url }         = usePage();
    const [alert, setAlert]       = useState(null);
    const [search, setSearch]     = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Close sidebar on navigation
    useEffect(() => {
        setSidebarOpen(false);
    }, [url]);

    useEffect(() => {
        if (flash?.success)      setAlert({ type: 'success', msg: flash.success });
        else if (flash?.error)   setAlert({ type: 'error',   msg: flash.error   });
        else                     setAlert(null);
    }, [flash]);

    const userName = auth?.user?.name ?? auth?.user?.email ?? 'Admin';
    const initial  = userName.charAt(0).toUpperCase();

    const sidebarStyle = isMobile
        ? {
            position: 'fixed', top: 0, left: sidebarOpen ? 0 : -260,
            width: 245, height: '100vh', zIndex: 1050,
            transition: 'left 260ms ease',
            background: C.sidebar, borderRight: `1px solid ${C.border}`,
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: sidebarOpen ? '4px 0 24px rgba(0,0,0,0.18)' : 'none',
        }
        : {
            width: 245, flexShrink: 0, background: C.sidebar,
            borderRight: `1px solid ${C.border}`, display: 'flex',
            flexDirection: 'column', overflow: 'hidden',
        };

    return (
        <div style={{
            display: 'flex', height: '100vh', overflow: 'hidden',
            background: C.bg, fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
            fontSize: 14,
        }}>
            {/* Global mobile styles */}
            <style>{`
                @media (max-width: 767px) {
                    .dash-main table.table { display: block; overflow-x: auto; -webkit-overflow-scrolling: touch; width: 100%; }
                }
            `}</style>

            {/* ── Mobile backdrop ─────────────────────────────────────── */}
            {isMobile && sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 1040,
                        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)',
                    }}
                />
            )}

            {/* ── Sidebar ────────────────────────────────────────────── */}
            <aside style={sidebarStyle}>
                {/* Brand */}
                <div style={{ padding: '18px 16px 14px', borderBottom: `1px solid ${C.border}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href={route('dashboard.home')} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                        <img src="/images/logo_mark.png" alt="LaunchLeaf" style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, objectFit: 'contain' }} />
                        <span style={{ fontWeight: 700, color: C.text, fontSize: 15.5, letterSpacing: '-0.3px' }}>
                            LaunchLeaf
                        </span>
                    </Link>
                    {isMobile && (
                        <button
                            onClick={() => setSidebarOpen(false)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: C.muted, display: 'flex' }}
                            aria-label="Close menu"
                        >
                            <Ico name="x" size={18} color={C.muted} />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
                    {NAV.map(item => (
                        <NavLink
                            key={item.href}
                            item={item}
                            onClick={isMobile ? () => setSidebarOpen(false) : undefined}
                        />
                    ))}
                </nav>

                {/* CTA card */}
                <div style={{ margin: '0 10px 14px', flexShrink: 0 }}>
                    <div style={{
                        background: `linear-gradient(135deg, ${C.green} 0%, #c0392b 100%)`,
                        borderRadius: 12, padding: '16px 16px 14px',
                    }}>
                        <p style={{ margin: '0 0 3px', fontSize: 12, fontWeight: 700, color: 'white', letterSpacing: '0.05px' }}>
                            View Your Portfolio
                        </p>
                        <p style={{ margin: '0 0 12px', fontSize: 11.5, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                            See how your public site looks to visitors.
                        </p>
                        <a href="/" target="_blank" rel="noreferrer" style={{
                            display: 'inline-block', background: 'white', color: C.greenText,
                            padding: '5px 13px', borderRadius: 6, fontSize: 12,
                            fontWeight: 600, textDecoration: 'none',
                        }}>
                            Visit Site →
                        </a>
                    </div>
                </div>
            </aside>

            {/* ── Main column ─────────────────────────────────────────── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

                {/* Top bar */}
                <header style={{
                    background: 'white', borderBottom: `1px solid ${C.border}`,
                    padding: isMobile ? '0 12px' : '0 24px',
                    height: 58, display: 'flex',
                    alignItems: 'center', gap: isMobile ? 8 : 14, flexShrink: 0,
                }}>
                    {/* Hamburger (mobile only) */}
                    {isMobile && (
                        <button
                            onClick={() => setSidebarOpen(v => !v)}
                            aria-label="Toggle menu"
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                padding: 6, borderRadius: 8, color: C.muted,
                                display: 'flex', alignItems: 'center', flexShrink: 0,
                            }}
                        >
                            <Ico name="menu" size={20} color={C.text} />
                        </button>
                    )}

                    {/* Page title */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {header && (
                            <h1 style={{ margin: 0, fontSize: isMobile ? 14 : 15, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {header}
                            </h1>
                        )}
                    </div>

                    {/* Search (desktop only) */}
                    {!isMobile && (
                        <div style={{ position: 'relative', width: 220 }}>
                            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                <Ico name="search" size={13} color={C.muted} />
                            </span>
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search anything…"
                                style={{
                                    width: '100%', padding: '7px 10px 7px 30px',
                                    border: `1px solid ${C.border}`, borderRadius: 8,
                                    fontSize: 13, outline: 'none', background: '#f7f7f7',
                                    color: C.text, boxSizing: 'border-box',
                                }}
                            />
                        </div>
                    )}

                    {/* Bell (desktop only) */}
                    {!isMobile && <IconBtn icon="bell" title="Notifications" />}

                    {/* Divider (desktop only) */}
                    {!isMobile && <div style={{ width: 1, height: 22, background: C.border }} />}

                    {/* User */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                            background: `linear-gradient(135deg, ${C.green} 0%, #c0392b 100%)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 700, fontSize: 12,
                        }}>
                            {initial}
                        </div>
                        {!isMobile && (
                            <span style={{ fontSize: 13, fontWeight: 600, color: C.text, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {userName}
                            </span>
                        )}
                    </div>

                    {/* Logout */}
                    <Link href={route('logout')} method="post" as="button"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 7, borderRadius: 8, display: 'flex', color: C.muted }}>
                        <Ico name="logout" size={16} color={C.muted} />
                    </Link>
                </header>

                {/* Scrollable content */}
                <main className="dash-main" style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px 12px' : '24px 28px' }}>
                    {/* Flash alert */}
                    {alert && (
                        <div style={{
                            marginBottom: 20, padding: '10px 16px', borderRadius: 9,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            fontSize: 13.5, fontWeight: 500,
                            background: alert.type === 'success' ? '#E6F7F2' : '#FEF2F2',
                            border:     `1px solid ${alert.type === 'success' ? '#A3E4D0' : '#FCA5A5'}`,
                            color:      alert.type === 'success' ? '#146645' : '#991B1B',
                        }}>
                            <span>{alert.msg}</span>
                            <button onClick={() => setAlert(null)} style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: 'inherit', fontSize: 18, lineHeight: 1, padding: '0 0 0 12px',
                            }}>×</button>
                        </div>
                    )}

                    {children}
                </main>
            </div>
        </div>
    );
}
