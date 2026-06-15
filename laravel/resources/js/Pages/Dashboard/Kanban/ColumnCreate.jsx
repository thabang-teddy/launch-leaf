import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const C = {
    green: '#2DC9A2', greenSoft: '#E8F7F2', greenText: '#1A9A7E',
    bg: '#F0F4F3', border: '#E3EDEA', text: '#1B2E2B', muted: '#748D8A',
};

const COLORS = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'dark'];

export default function ColumnCreate({ project_id }) {
    const { data, setData, post, processing, errors } = useForm({
        kanban_project_id: project_id ?? '',
        title: '',
        color: '',
        order: 0,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.kanban.columns.store'));
    };

    const cancelHref = project_id
        ? route('dashboard.kanban.projects.show', project_id)
        : route('dashboard.kanban.index');

    return (
        <DashboardLayout header="New Column">
            <Head title="New Column" />

            <div style={{ maxWidth: '480px' }}>
                <div style={{ marginBottom: '1.25rem' }}>
                    <Link href={cancelHref} style={{ color: C.muted, fontSize: '0.85rem', textDecoration: 'none' }}>
                        ← Back to Board
                    </Link>
                </div>

                <form onSubmit={submit}>
                    <div style={{ background: '#fff', borderRadius: '14px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* Hidden project id */}
                            <input type="hidden" value={data.kanban_project_id} onChange={() => {}} />

                            <div>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: C.text, marginBottom: '6px' }}>
                                    Title *
                                </label>
                                <input
                                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    placeholder="e.g. To Do"
                                    autoFocus
                                />
                                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                                {errors.kanban_project_id && (
                                    <div style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '4px' }}>
                                        {errors.kanban_project_id}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: C.text, marginBottom: '6px' }}>
                                    Header Color
                                </label>
                                <select
                                    className="form-select"
                                    value={data.color}
                                    onChange={e => setData('color', e.target.value)}
                                >
                                    <option value="">Default (mint)</option>
                                    {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

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
                                {processing ? 'Creating…' : 'Create Column'}
                            </button>
                            <Link
                                href={cancelHref}
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
