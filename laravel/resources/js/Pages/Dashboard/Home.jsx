import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

// ─── Design tokens (same palette as DashboardLayout) ─────────────────────────
const C = {
    green:     '#2DC9A2',
    greenSoft: '#E8F7F2',
    greenText: '#1A9A7E',
    border:    '#E3EDEA',
    text:      '#1B2E2B',
    muted:     '#748D8A',
    card:      '#FFFFFF',
};

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, subLabel, href, accent = C.green }) {
    const [hov, setHov] = useState(false);

    const inner = (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                background: C.card, borderRadius: 12, padding: '20px 22px',
                boxShadow: hov ? '0 6px 20px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.07)',
                transform: hov ? 'translateY(-2px)' : 'none',
                transition: 'all 160ms ease', cursor: href ? 'pointer' : 'default',
                borderTop: `3px solid ${accent}`,
            }}
        >
            {/* Label row */}
            <p style={{ margin: '0 0 14px', fontSize: 11.5, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {label}
            </p>

            {/* Value */}
            <p style={{ margin: 0, fontSize: 34, fontWeight: 800, color: C.text, lineHeight: 1, letterSpacing: '-1px' }}>
                {value}
            </p>

            {/* Sub-stat */}
            {sub !== undefined && (
                <p style={{ margin: '8px 0 0', fontSize: 12, color: C.muted }}>
                    <span style={{ color: accent, fontWeight: 700 }}>{sub}</span>
                    {' '}{subLabel}
                </p>
            )}
        </div>
    );

    return href
        ? <Link href={route(href)} style={{ textDecoration: 'none', display: 'block' }}>{inner}</Link>
        : inner;
}

// ─── Quick-action pill ────────────────────────────────────────────────────────
function QLink({ label, href }) {
    const [hov, setHov] = useState(false);
    return (
        <Link href={route(href)}
              onMouseEnter={() => setHov(true)}
              onMouseLeave={() => setHov(false)}
              style={{
                  display: 'inline-block', padding: '7px 15px', borderRadius: 8,
                  border: `1px solid ${hov ? C.green : C.border}`,
                  background: hov ? C.greenSoft : '#FAFCFB',
                  fontSize: 13, fontWeight: 500,
                  color: hov ? C.greenText : C.text,
                  textDecoration: 'none', transition: 'all 140ms ease',
              }}>
            {label}
        </Link>
    );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function SectionCard({ title, children }) {
    return (
        <div style={{ background: C.card, borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}` }}>
                <h3 style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: C.text }}>{title}</h3>
            </div>
            <div style={{ padding: '16px 20px' }}>{children}</div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardHome({ stats = {} }) {
    const s = stats;
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const statCards = [
        { label: 'GitHub Projects', value: s.projects   ?? 0, href: 'dashboard.projects.index',  accent: '#2DC9A2' },
        { label: 'Portfolio Items', value: s.portfolio  ?? 0, href: 'dashboard.portfolio.index', accent: '#6B8AF0' },
        { label: 'Experience',      value: s.experience ?? 0, href: 'dashboard.experience.index',accent: '#F0A05A' },
        { label: 'Tips',            value: s.tips ?? 0,
          sub: s.tips_published ?? 0, subLabel: 'published',
          href: 'dashboard.tips.index', accent: '#F06B8A' },
        { label: 'Notes',           value: s.notes ?? 0, href: 'dashboard.notes.index', accent: '#4BADE8' },
        { label: 'Tasks',           value: s.tasks ?? 0,
          sub: s.tasks_pending ?? 0, subLabel: 'pending',
          href: 'dashboard.tasks.index', accent: '#A78BFA' },
        { label: 'Kanban Cards',    value: s.kanban_cards ?? 0,
          sub: s.kanban_columns ?? 0, subLabel: 'columns',
          href: 'dashboard.kanban.index', accent: '#34D399' },
        { label: 'Messages',        value: s.contacts ?? 0,
          sub: s.contacts_pending ?? 0, subLabel: 'awaiting reply',
          href: 'dashboard.contact.index', accent: '#FB923C' },
    ];

    const quickActions = [
        { label: '+ New Project',    href: 'dashboard.projects.create' },
        { label: '+ Portfolio Item', href: 'dashboard.portfolio.create' },
        { label: '+ Experience',     href: 'dashboard.experience.create' },
        { label: '+ Tip',            href: 'dashboard.tips.create' },
        { label: '+ Note',           href: 'dashboard.notes.create' },
        { label: '+ Task',           href: 'dashboard.tasks.create' },
        { label: '+ Kanban Card',    href: 'dashboard.kanban.cards.create' },
        { label: 'Edit Personal Info', href: 'dashboard.personal-info' },
    ];

    const sections = [
        { label: 'GitHub Projects', href: 'dashboard.projects.index', accent: '#2DC9A2' },
        { label: 'Other Accounts',  href: 'dashboard.accounts.index', accent: '#34D399' },
        { label: 'Portfolio',       href: 'dashboard.portfolio.index',accent: '#6B8AF0' },
        { label: 'Experience',      href: 'dashboard.experience.index',accent: '#F0A05A' },
        { label: 'Tips',            href: 'dashboard.tips.index',      accent: '#F06B8A' },
        { label: 'Pages',           href: 'dashboard.pages.index',     accent: '#4BADE8' },
        { label: 'Notes',           href: 'dashboard.notes.index',     accent: '#A78BFA' },
        { label: 'Tasks',           href: 'dashboard.tasks.index',     accent: '#34D399' },
        { label: 'Kanban',          href: 'dashboard.kanban.index',    accent: '#2DC9A2' },
        { label: 'Contact',         href: 'dashboard.contact.index',   accent: '#FB923C' },
        { label: 'Personal Info',   href: 'dashboard.personal-info',   accent: '#F0A05A' },
    ];

    return (
        <DashboardLayout header="Dashboard">
            <Head title="Dashboard" />

            {/* Welcome banner */}
            <div style={{
                background: `linear-gradient(135deg, #2DC9A2 0%, #1BA882 100%)`,
                borderRadius: 14, padding: isMobile ? '18px 18px' : '22px 28px', marginBottom: 24,
                display: 'flex', flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center',
                justifyContent: 'space-between', gap: isMobile ? 14 : 0,
                boxShadow: '0 4px 16px rgba(45,201,162,0.30)',
            }}>
                <div>
                    <h2 style={{ margin: '0 0 4px', fontSize: 19, fontWeight: 700, color: 'white', letterSpacing: '-0.3px' }}>
                        Welcome back! 👋
                    </h2>
                    <p style={{ margin: 0, fontSize: 13.5, color: 'rgba(255,255,255,0.85)' }}>
                        Here's an overview of your portfolio content.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <Link href={route('dashboard.projects.create')} style={{
                        background: 'rgba(255,255,255,0.2)', color: 'white',
                        padding: '8px 18px', borderRadius: 8, fontSize: 13,
                        fontWeight: 600, textDecoration: 'none',
                        border: '1px solid rgba(255,255,255,0.3)',
                    }}>
                        + Add Project
                    </Link>
                    <a href="/" target="_blank" rel="noreferrer" style={{
                        background: 'white', color: '#1A9A7E',
                        padding: '8px 18px', borderRadius: 8, fontSize: 13,
                        fontWeight: 600, textDecoration: 'none',
                    }}>
                        View Site ↗
                    </a>
                </div>
            </div>

            {/* Stats grid — 2 cols on mobile, 4 on desktop */}
            <div style={{
                display: 'grid', gap: 14, marginBottom: 24,
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            }}>
                {statCards.map(c => <StatCard key={c.label} {...c} />)}
            </div>

            {/* Bottom row: quick actions + all sections — stacked on mobile */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>

                {/* Quick actions */}
                <SectionCard title="Quick Actions">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {quickActions.map(a => <QLink key={a.href} {...a} />)}
                    </div>
                </SectionCard>

                {/* All sections */}
                <SectionCard title="All Sections">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                        {sections.map(({ label, href, accent }) => (
                            <Link key={href} href={route(href)} style={{ textDecoration: 'none' }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '7px 10px', borderRadius: 7,
                                    border: `1px solid ${C.border}`, background: '#FAFCFB',
                                    fontSize: 13, color: C.text, fontWeight: 500,
                                    transition: 'all 140ms ease',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = C.greenSoft; e.currentTarget.style.borderColor = accent; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#FAFCFB'; e.currentTarget.style.borderColor = C.border; }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: accent, flexShrink: 0 }} />
                                    {label}
                                </div>
                            </Link>
                        ))}
                    </div>
                </SectionCard>
            </div>
        </DashboardLayout>
    );
}
