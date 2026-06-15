import ConfirmModal from '@/Components/ConfirmModal';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

const C = {
    green: '#2DC9A2', greenSoft: '#E8F7F2', greenText: '#1A9A7E',
    bg: '#F0F4F3', border: '#E3EDEA', text: '#1B2E2B', muted: '#748D8A', card: '#FFFFFF',
};

export default function KanbanIndex({ projects }) {
    const [modal, setModal] = useState(null);

    const askDelete = (id, name) => setModal({ id, name });

    const handleConfirm = () => {
        router.delete(route('dashboard.kanban.projects.destroy', modal.id));
        setModal(null);
    };

    return (
        <DashboardLayout header="Kanban">
            <Head title="Kanban" />

            <ConfirmModal
                open={modal !== null}
                title="Delete project?"
                message={`"${modal?.name}" and ALL its columns and cards will be permanently deleted.`}
                confirmLabel="Delete Project"
                onConfirm={handleConfirm}
                onCancel={() => setModal(null)}
            />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                    <h5 style={{ margin: 0, color: C.text, fontWeight: 700 }}>Projects</h5>
                    <p style={{ margin: 0, color: C.muted, fontSize: '0.85rem' }}>
                        {projects.length} project{projects.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <Link
                    href={route('dashboard.kanban.projects.create')}
                    style={{ background: C.green, color: '#fff', borderRadius: '8px', padding: '8px 18px', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                    <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span> New Project
                </Link>
            </div>

            {/* Empty state */}
            {projects.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', background: C.card, borderRadius: '16px', border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
                    <h6 style={{ color: C.text, fontWeight: 600, marginBottom: '0.5rem' }}>No projects yet</h6>
                    <p style={{ color: C.muted, fontSize: '0.875rem', marginBottom: '1.5rem' }}>Create a project to start organising your work.</p>
                    <Link href={route('dashboard.kanban.projects.create')} style={{ background: C.green, color: '#fff', borderRadius: '8px', padding: '10px 24px', fontWeight: 600, textDecoration: 'none' }}>
                        Create Project
                    </Link>
                </div>
            )}

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {projects.map(project => (
                    <ProjectCard key={project.id} project={project} onDelete={() => askDelete(project.id, project.name)} />
                ))}
            </div>
        </DashboardLayout>
    );
}

function ProjectCard({ project, onDelete }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            style={{ background: '#fff', borderRadius: '14px', border: `1px solid ${C.border}`, overflow: 'hidden', transition: 'box-shadow 0.18s ease, transform 0.18s ease', boxShadow: hovered ? '0 8px 28px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.05)', transform: hovered ? 'translateY(-2px)' : 'none' }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div style={{ height: '6px', background: project.color || C.green }} />
            <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h6 style={{ margin: 0, fontWeight: 700, color: C.text, fontSize: '1rem', lineHeight: 1.3 }}>{project.name}</h6>
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0, marginLeft: '8px' }}>
                        <Link href={route('dashboard.kanban.projects.edit', project.id)} title="Edit project" style={{ width: '28px', height: '28px', borderRadius: '6px', background: C.bg, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, textDecoration: 'none', fontSize: '0.8rem' }}>✏</Link>
                        <button onClick={onDelete} title="Delete project" style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#FEF2F2', border: '1px solid #FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
                    </div>
                </div>

                {project.description && (
                    <p style={{ margin: '0 0 1rem', color: C.muted, fontSize: '0.825rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {project.description}
                    </p>
                )}
                {!project.description && <div style={{ marginBottom: '1rem' }} />}

                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <Pill value={project.columns_count} label="columns" color={C.greenText} bg={C.greenSoft} />
                    <Pill value={project.cards_count} label="cards" color="#6366F1" bg="#EEF2FF" />
                </div>

                <Link href={route('dashboard.kanban.projects.show', project.id)} style={{ display: 'block', textAlign: 'center', background: C.greenSoft, color: C.greenText, borderRadius: '8px', padding: '8px', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}>
                    Open Project →
                </Link>
            </div>
        </div>
    );
}

function Pill({ value, label, color, bg }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: bg, borderRadius: '6px', padding: '4px 10px' }}>
            <span style={{ fontWeight: 700, color, fontSize: '0.9rem' }}>{value}</span>
            <span style={{ color, fontSize: '0.75rem', opacity: 0.8 }}>{label}</span>
        </div>
    );
}
