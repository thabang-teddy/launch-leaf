import ConfirmModal from '@/Components/ConfirmModal';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const C = {
    green: '#2DC9A2', greenSoft: '#E8F7F2', greenText: '#1A9A7E',
    bg: '#F0F4F3', border: '#E3EDEA', text: '#1B2E2B', muted: '#748D8A', card: '#FFFFFF',
};

const PALETTE = ['#2DC9A2', '#6366F1', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6', '#F97316', '#10B981'];

// ─── Modal Shell ──────────────────────────────────────────────────────────────
function KanbanModal({ title, onClose, children }) {
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }} />
            <div style={{ position: 'relative', background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '480px', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <h6 style={{ margin: 0, fontWeight: 700, color: C.text, fontSize: '1rem' }}>{title}</h6>
                    <button onClick={onClose} style={{ background: C.bg, border: 'none', color: C.muted, cursor: 'pointer', width: '28px', height: '28px', borderRadius: '6px', fontSize: '0.9rem' }}>✕</button>
                </div>
                {children}
            </div>
        </div>
    );
}

// ─── Project Form Modal ───────────────────────────────────────────────────────
function ProjectFormModal({ project, onClose }) {
    const isEdit = !!project;
    const { data, setData, post, patch, processing, errors } = useForm({
        name:        project?.name ?? '',
        description: project?.description ?? '',
        color:       project?.color ?? '#2DC9A2',
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            patch(route('dashboard.kanban.projects.update', project.id), { preserveScroll: true, onSuccess: onClose });
        } else {
            post(route('dashboard.kanban.projects.store'), { preserveScroll: true, onSuccess: onClose });
        }
    };

    const F = {
        input:  { width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${C.border}`, fontSize: '0.875rem', outline: 'none', color: C.text, boxSizing: 'border-box' },
        label:  { display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.8rem', color: C.text },
        error:  { color: '#EF4444', fontSize: '0.75rem', margin: '3px 0 0' },
        field:  { marginBottom: '1rem' },
    };

    return (
        <KanbanModal title={isEdit ? 'Edit Project' : 'New Project'} onClose={onClose}>
            <form onSubmit={submit}>
                <div style={F.field}>
                    <label style={F.label}>Project Name <span style={{ color: '#EF4444' }}>*</span></label>
                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)}
                        style={F.input} placeholder="Project name" autoFocus />
                    {errors.name && <p style={F.error}>{errors.name}</p>}
                </div>

                <div style={F.field}>
                    <label style={F.label}>Description</label>
                    <textarea value={data.description ?? ''} onChange={e => setData('description', e.target.value)}
                        rows={3} style={{ ...F.input, resize: 'vertical' }} placeholder="Optional description" />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={F.label}>Accent Color</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                        {PALETTE.map(color => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => setData('color', color)}
                                style={{
                                    width: '32px', height: '32px', borderRadius: '50%', background: color,
                                    border: data.color === color ? '3px solid #1B2E2B' : '3px solid transparent',
                                    cursor: 'pointer', outline: 'none',
                                    transform: data.color === color ? 'scale(1.15)' : 'scale(1)',
                                    transition: 'transform 0.1s',
                                }}
                            />
                        ))}
                    </div>
                    <div style={{ height: '5px', borderRadius: '4px', background: data.color, marginTop: '10px' }} />
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: '8px', border: `1px solid ${C.border}`, background: '#fff', color: C.text, cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem' }}>
                        Cancel
                    </button>
                    <button type="submit" disabled={processing} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: C.green, color: '#fff', cursor: processing ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.875rem', opacity: processing ? 0.7 : 1 }}>
                        {processing ? 'Saving…' : isEdit ? 'Update Project' : 'Create Project'}
                    </button>
                </div>
            </form>
        </KanbanModal>
    );
}

// ─── Index ────────────────────────────────────────────────────────────────────
export default function KanbanIndex({ projects }) {
    const [modal, setModal]               = useState(null); // confirm delete modal
    const [projectModal, setProjectModal] = useState(null); // null | {mode:'create'} | {mode:'edit', project}

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

            {projectModal?.mode === 'create' && (
                <ProjectFormModal onClose={() => setProjectModal(null)} />
            )}
            {projectModal?.mode === 'edit' && (
                <ProjectFormModal project={projectModal.project} onClose={() => setProjectModal(null)} />
            )}

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                    <h5 style={{ margin: 0, color: C.text, fontWeight: 700 }}>Projects</h5>
                    <p style={{ margin: 0, color: C.muted, fontSize: '0.85rem' }}>
                        {projects.length} project{projects.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button
                    onClick={() => setProjectModal({ mode: 'create' })}
                    style={{ background: C.green, color: '#fff', borderRadius: '8px', padding: '8px 18px', fontWeight: 600, fontSize: '0.875rem', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                    <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span> New Project
                </button>
            </div>

            {/* Empty state */}
            {projects.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', background: C.card, borderRadius: '16px', border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
                    <h6 style={{ color: C.text, fontWeight: 600, marginBottom: '0.5rem' }}>No projects yet</h6>
                    <p style={{ color: C.muted, fontSize: '0.875rem', marginBottom: '1.5rem' }}>Create a project to start organising your work.</p>
                    <button
                        onClick={() => setProjectModal({ mode: 'create' })}
                        style={{ background: C.green, color: '#fff', borderRadius: '8px', padding: '10px 24px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                    >
                        Create Project
                    </button>
                </div>
            )}

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {projects.map(project => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        onEdit={() => setProjectModal({ mode: 'edit', project })}
                        onDelete={() => askDelete(project.id, project.name)}
                    />
                ))}
            </div>
        </DashboardLayout>
    );
}

function ProjectCard({ project, onEdit, onDelete }) {
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
                        <button onClick={onEdit} title="Edit project" style={{ width: '28px', height: '28px', borderRadius: '6px', background: C.bg, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, cursor: 'pointer', fontSize: '0.8rem' }}>✏</button>
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
