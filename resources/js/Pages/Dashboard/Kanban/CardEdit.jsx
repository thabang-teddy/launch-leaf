import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const C = {
    green: '#2DC9A2', greenSoft: '#E8F7F2', greenText: '#1A9A7E',
    bg: '#F0F4F3', border: '#E3EDEA', text: '#1B2E2B', muted: '#748D8A',
};

export default function CardEdit({ card, columns, project_id }) {
    const { data, setData, put, processing, errors } = useForm({
        kanban_column_id: card.kanban_column_id ?? '',
        title: card.title ?? '',
        description: card.description ?? '',
        due_date: card.due_date ?? '',
        order: card.order ?? 0,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('dashboard.kanban.cards.update', card.id));
    };

    const cancelHref = project_id
        ? route('dashboard.kanban.projects.show', project_id)
        : route('dashboard.kanban.index');

    return (
        <DashboardLayout header="Edit Card">
            <Head title="Edit Card" />

            <div style={{ maxWidth: '560px' }}>
                <div style={{ marginBottom: '1.25rem' }}>
                    <Link href={cancelHref} style={{ color: C.muted, fontSize: '0.85rem', textDecoration: 'none' }}>
                        ← Back to Board
                    </Link>
                </div>

                <form onSubmit={submit}>
                    <div style={{ background: '#fff', borderRadius: '14px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: C.text, marginBottom: '6px' }}>
                                    Column *
                                </label>
                                <select
                                    className="form-select"
                                    value={data.kanban_column_id}
                                    onChange={e => setData('kanban_column_id', e.target.value)}
                                >
                                    {columns.map(col => <option key={col.id} value={col.id}>{col.title}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: C.text, marginBottom: '6px' }}>
                                    Title *
                                </label>
                                <input
                                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                />
                                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                            </div>

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

                            <div>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: C.text, marginBottom: '6px' }}>
                                    Due Date
                                </label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={data.due_date ?? ''}
                                    onChange={e => setData('due_date', e.target.value)}
                                />
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
                                {processing ? 'Saving…' : 'Save Changes'}
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
