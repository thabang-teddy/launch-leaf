import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const C = {
    green: '#2DC9A2', greenSoft: '#E8F7F2', greenText: '#1A9A7E',
    bg: '#F0F4F3', border: '#E3EDEA', text: '#1B2E2B', muted: '#748D8A',
};

const PALETTE = [
    '#2DC9A2', '#3B82F6', '#8B5CF6', '#F59E0B',
    '#EF4444', '#10B981', '#F97316', '#6B7280',
];

export default function ProjectEdit({ project, board }) {
    const { data, setData, put, processing, errors } = useForm({
        name: project.name ?? '',
        description: project.description ?? '',
        color: project.color ?? '#2DC9A2',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('dashboard.kanban.projects.update', project.id));
    };

    return (
        <DashboardLayout header="Edit Project">
            <Head title={`Edit — ${project.name}`} />

            <div style={{ maxWidth: '520px' }}>
                {/* Breadcrumb */}
                <div style={{ marginBottom: '1.25rem', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {board && (
                        <>
                            <Link href={route('dashboard.kanban.boards.show', board.id)} style={{ color: C.muted, fontSize: '0.85rem', textDecoration: 'none' }}>
                                ← {board.name}
                            </Link>
                            <span style={{ color: C.border }}>|</span>
                        </>
                    )}
                    <Link href={route('dashboard.kanban.projects.show', project.id)} style={{ color: C.muted, fontSize: '0.85rem', textDecoration: 'none' }}>
                        {project.name}
                    </Link>
                </div>

                <form onSubmit={submit}>
                    <div style={{ background: '#fff', borderRadius: '14px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                        {/* Accent preview bar */}
                        <div style={{ height: '6px', background: data.color }} />

                        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* Name */}
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: C.text, marginBottom: '6px' }}>
                                    Project Name *
                                </label>
                                <input
                                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                />
                                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                            </div>

                            {/* Description */}
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: C.text, marginBottom: '6px' }}>
                                    Description
                                </label>
                                <textarea
                                    className="form-control"
                                    rows={3}
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                />
                            </div>

                            {/* Color picker */}
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: C.text, marginBottom: '8px' }}>
                                    Accent Color
                                </label>
                                <ColorPicker value={data.color} onChange={v => setData('color', v)} />
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: '1rem 1.5rem', borderTop: `1px solid ${C.border}`,
                            display: 'flex', gap: '8px', background: C.bg,
                        }}>
                            <button
                                type="submit"
                                disabled={processing}
                                style={{
                                    background: C.green, color: '#fff', border: 'none',
                                    borderRadius: '8px', padding: '9px 20px', fontWeight: 600,
                                    fontSize: '0.875rem', cursor: processing ? 'not-allowed' : 'pointer',
                                    opacity: processing ? 0.7 : 1,
                                }}
                            >
                                {processing ? 'Saving…' : 'Save Changes'}
                            </button>
                            <Link
                                href={board
                                    ? route('dashboard.kanban.boards.show', board.id)
                                    : route('dashboard.kanban.projects.show', project.id)}
                                style={{
                                    background: 'transparent', color: C.muted, border: `1px solid ${C.border}`,
                                    borderRadius: '8px', padding: '9px 20px', fontWeight: 600,
                                    fontSize: '0.875rem', textDecoration: 'none',
                                }}
                            >
                                Cancel
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}

function ColorPicker({ value, onChange }) {
    return (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {PALETTE.map(color => (
                <button
                    key={color}
                    type="button"
                    onClick={() => onChange(color)}
                    style={{
                        width: '32px', height: '32px', borderRadius: '50%', background: color, border: 'none',
                        cursor: 'pointer', position: 'relative',
                        outline: value === color ? `3px solid ${color}` : '3px solid transparent',
                        outlineOffset: '2px',
                        transition: 'transform 0.1s',
                        transform: value === color ? 'scale(1.15)' : 'scale(1)',
                    }}
                    title={color}
                >
                    {value === color && (
                        <span style={{
                            position: 'absolute', inset: 0, display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: '0.85rem', fontWeight: 700,
                        }}>
                            ✓
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}
