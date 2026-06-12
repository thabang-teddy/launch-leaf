import ConfirmModal from '@/Components/ConfirmModal';
import SlidePanel from '@/Components/SlidePanel';
import WysiwygEditor from '@/Components/WysiwygEditor';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const EMPTY = {
    title: '', description: '', content: '', image_path: '',
    tech_stack: '', live_url: '', repo_url: '', order: 0, is_active: true,
};

function toStackString(v) {
    return Array.isArray(v) ? v.join(', ') : (v ?? '');
}

export default function PortfolioIndex({ items }) {
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

    const openEdit = (item) => {
        clearErrors();
        setData({
            title:       item.title ?? '',
            description: item.description ?? '',
            content:     item.content ?? '',
            image_path:  item.image_path ?? '',
            tech_stack:  toStackString(item.tech_stack),
            live_url:    item.live_url ?? '',
            repo_url:    item.repo_url ?? '',
            order:       item.order ?? 0,
            is_active:   item.is_active ?? true,
        });
        setSelected(item);
        setPanelOpen(true);
    };

    const closePanel = () => { setPanelOpen(false); setSelected(null); };

    const submit = (e) => {
        e.preventDefault();
        if (selected) {
            put(route('dashboard.portfolio.update', selected.id), { onSuccess: closePanel });
        } else {
            post(route('dashboard.portfolio.store'), { onSuccess: closePanel });
        }
    };

    const askDelete = (id) => setModal({ id });
    const handleConfirm = () => {
        if (selected?.id === modal.id) closePanel();
        router.delete(route('dashboard.portfolio.destroy', modal.id));
        setModal(null);
    };

    const filtered = items.filter(i =>
        i.title?.toLowerCase().includes(search.toLowerCase()) ||
        toStackString(i.tech_stack).toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout header="Portfolio">
            <Head title="Portfolio" />

            <ConfirmModal
                open={modal !== null}
                title="Delete portfolio item?"
                message="This will permanently delete the portfolio item and cannot be recovered."
                onConfirm={handleConfirm}
                onCancel={() => setModal(null)}
            />

            {/* toolbar */}
            <div className="d-flex justify-content-between align-items-center mb-3 gap-2">
                <span className="text-muted small">{items.length} items</span>
                <input
                    className="form-control form-control-sm"
                    style={{ maxWidth: 220 }}
                    placeholder="Search portfolio…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <button className="btn btn-primary btn-sm" onClick={openNew}>+ New Item</button>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                {/* ── Table ── */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card border-0 shadow-sm">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Title</th>
                                    <th>Tech Stack</th>
                                    <th>Order</th>
                                    <th>Active</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 && (
                                    <tr><td colSpan={5} className="text-center text-muted py-4">No portfolio items found.</td></tr>
                                )}
                                {filtered.map(item => (
                                    <tr
                                        key={item.id}
                                        className={selected?.id === item.id ? 'table-active' : ''}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => openEdit(item)}
                                    >
                                        <td className="align-middle fw-semibold">{item.title}</td>
                                        <td className="align-middle small">{toStackString(item.tech_stack) || '—'}</td>
                                        <td className="align-middle">{item.order}</td>
                                        <td className="align-middle">
                                            <span className={`badge ${item.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                                {item.is_active ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="align-middle text-end" onClick={e => e.stopPropagation()}>
                                            <button onClick={() => askDelete(item.id)} className="btn btn-outline-danger btn-sm">Delete</button>
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
                    title={selected ? 'Edit Portfolio Item' : 'New Portfolio Item'}
                    onClose={closePanel}
                    width={440}
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
                            <label className="form-label fw-semibold small">Short Description</label>
                            <textarea
                                className="form-control"
                                rows={2}
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="form-label fw-semibold small">Full Content</label>
                            <WysiwygEditor
                                key={selected?.id ?? 'new'}
                                value={data.content}
                                onChange={val => setData('content', val)}
                                placeholder="Describe the project in detail…"
                            />
                        </div>
                        <div>
                            <label className="form-label fw-semibold small">Tech Stack <span className="text-muted fw-normal">(comma separated)</span></label>
                            <input
                                className="form-control"
                                placeholder="React, Laravel, Tailwind"
                                value={data.tech_stack}
                                onChange={e => setData('tech_stack', e.target.value)}
                            />
                        </div>
                        <div className="row g-2">
                            <div className="col-6">
                                <label className="form-label fw-semibold small">Live URL</label>
                                <input
                                    type="url"
                                    className={`form-control ${errors.live_url ? 'is-invalid' : ''}`}
                                    value={data.live_url}
                                    onChange={e => setData('live_url', e.target.value)}
                                />
                                {errors.live_url && <div className="invalid-feedback">{errors.live_url}</div>}
                            </div>
                            <div className="col-6">
                                <label className="form-label fw-semibold small">Repo URL</label>
                                <input
                                    type="url"
                                    className={`form-control ${errors.repo_url ? 'is-invalid' : ''}`}
                                    value={data.repo_url}
                                    onChange={e => setData('repo_url', e.target.value)}
                                />
                                {errors.repo_url && <div className="invalid-feedback">{errors.repo_url}</div>}
                            </div>
                        </div>
                        <div>
                            <label className="form-label fw-semibold small">Image Path</label>
                            <input
                                className="form-control"
                                placeholder="portfolio/image.jpg"
                                value={data.image_path}
                                onChange={e => setData('image_path', e.target.value)}
                            />
                        </div>
                        <div className="row g-2">
                            <div className="col-6">
                                <label className="form-label fw-semibold small">Order</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={data.order}
                                    onChange={e => setData('order', parseInt(e.target.value) || 0)}
                                />
                            </div>
                            <div className="col-6 d-flex align-items-end pb-1">
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="port_is_active"
                                        checked={data.is_active}
                                        onChange={e => setData('is_active', e.target.checked)}
                                    />
                                    <label className="form-check-label fw-semibold small" htmlFor="port_is_active">Active</label>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-primary btn-sm" disabled={processing}>
                                {processing ? 'Saving…' : selected ? 'Save Changes' : 'Create Item'}
                            </button>
                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={closePanel}>Cancel</button>
                        </div>
                    </form>
                </SlidePanel>
            </div>
        </DashboardLayout>
    );
}
