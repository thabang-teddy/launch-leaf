import ConfirmModal from '@/Components/ConfirmModal';
import SlidePanel from '@/Components/SlidePanel';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const EMPTY = { title: '', problem: '', solution: '', tags: '', is_published: false };

function toTagString(v) {
    return Array.isArray(v) ? v.join(', ') : (v ?? '');
}

export default function TipsIndex({ tips }) {
    const [modal, setModal]         = useState(null);
    const [panelOpen, setPanelOpen] = useState(false);
    const [selected, setSelected]   = useState(null);
    const [search, setSearch]       = useState('');

    const { data, setData, post, put, processing, errors, clearErrors } = useForm(EMPTY);

    const openNew = () => {
        clearErrors();
        setData(EMPTY);
        setSelected(null);
        setPanelOpen(true);
    };

    const openEdit = (tip) => {
        clearErrors();
        setData({
            title:        tip.title ?? '',
            problem:      tip.problem ?? '',
            solution:     tip.solution ?? '',
            tags:         toTagString(tip.tags),
            is_published: tip.is_published ?? false,
        });
        setSelected(tip);
        setPanelOpen(true);
    };

    const closePanel = () => { setPanelOpen(false); setSelected(null); };

    const submit = (e) => {
        e.preventDefault();
        if (selected) {
            put(route('dashboard.tips.update', selected.id), { onSuccess: closePanel });
        } else {
            post(route('dashboard.tips.store'), { onSuccess: closePanel });
        }
    };

    const askDelete = (id) => setModal({ id });
    const handleConfirm = () => {
        if (selected?.id === modal.id) closePanel();
        router.delete(route('dashboard.tips.destroy', modal.id));
        setModal(null);
    };

    const filtered = tips.filter(t =>
        t.title?.toLowerCase().includes(search.toLowerCase()) ||
        toTagString(t.tags).toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout header="Tips">
            <Head title="Tips" />

            <ConfirmModal
                open={modal !== null}
                title="Delete tip?"
                message="This will permanently delete the tip and cannot be recovered."
                onConfirm={handleConfirm}
                onCancel={() => setModal(null)}
            />

            {/* toolbar */}
            <div className="d-flex justify-content-between align-items-center mb-3 gap-2">
                <span className="text-muted small">{tips.length} tips</span>
                <input
                    className="form-control form-control-sm"
                    style={{ maxWidth: 220 }}
                    placeholder="Search tips…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <button className="btn btn-primary btn-sm" onClick={openNew}>+ New Tip</button>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                {/* ── Table ── */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card border-0 shadow-sm">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Title</th>
                                    <th>Tags</th>
                                    <th>Published</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 && (
                                    <tr><td colSpan={4} className="text-center text-muted py-4">No tips found.</td></tr>
                                )}
                                {filtered.map(tip => (
                                    <tr
                                        key={tip.id}
                                        className={selected?.id === tip.id ? 'table-active' : ''}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => openEdit(tip)}
                                    >
                                        <td className="align-middle fw-semibold">{tip.title}</td>
                                        <td className="align-middle small">{toTagString(tip.tags) || '—'}</td>
                                        <td className="align-middle">
                                            <span className={`badge ${tip.is_published ? 'bg-success' : 'bg-secondary'}`}>
                                                {tip.is_published ? 'Yes' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="align-middle text-end" onClick={e => e.stopPropagation()}>
                                            <button onClick={() => askDelete(tip.id)} className="btn btn-outline-danger btn-sm">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Slide panel ── */}
                <SlidePanel
                    open={panelOpen}
                    title={selected ? 'Edit Tip' : 'New Tip'}
                    onClose={closePanel}
                    width={420}
                >
                    <form onSubmit={submit} className="d-flex flex-column gap-3">
                        <div>
                            <label className="form-label fw-semibold small">Title *</label>
                            <input
                                className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                                autoFocus
                            />
                            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                        </div>
                        <div>
                            <label className="form-label fw-semibold small">Problem * <span className="text-muted fw-normal">Markdown supported</span></label>
                            <textarea
                                className={`form-control font-monospace ${errors.problem ? 'is-invalid' : ''}`}
                                rows={6}
                                value={data.problem}
                                onChange={e => setData('problem', e.target.value)}
                            />
                            {errors.problem && <div className="invalid-feedback">{errors.problem}</div>}
                        </div>
                        <div>
                            <label className="form-label fw-semibold small">Solution * <span className="text-muted fw-normal">Markdown supported</span></label>
                            <textarea
                                className={`form-control font-monospace ${errors.solution ? 'is-invalid' : ''}`}
                                rows={6}
                                value={data.solution}
                                onChange={e => setData('solution', e.target.value)}
                            />
                            {errors.solution && <div className="invalid-feedback">{errors.solution}</div>}
                        </div>
                        <div>
                            <label className="form-label fw-semibold small">Tags <span className="text-muted fw-normal">(comma separated)</span></label>
                            <input
                                className="form-control"
                                placeholder="laravel, react, debugging"
                                value={data.tags}
                                onChange={e => setData('tags', e.target.value)}
                            />
                        </div>
                        <div className="form-check">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="tip_is_published"
                                checked={data.is_published}
                                onChange={e => setData('is_published', e.target.checked)}
                            />
                            <label className="form-check-label fw-semibold small" htmlFor="tip_is_published">Publish</label>
                        </div>
                        <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-primary btn-sm" disabled={processing}>
                                {processing ? 'Saving…' : selected ? 'Save Changes' : 'Create Tip'}
                            </button>
                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={closePanel}>Cancel</button>
                        </div>
                    </form>
                </SlidePanel>
            </div>
        </DashboardLayout>
    );
}
