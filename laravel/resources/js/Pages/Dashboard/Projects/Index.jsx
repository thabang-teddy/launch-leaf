import ConfirmModal from '@/Components/ConfirmModal';
import SlidePanel from '@/Components/SlidePanel';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const EMPTY = {
    _method: '', title: '', description: '', content: '',
    github_url: '', image: null, order: 1, is_active: true,
};

export default function ProjectsIndex({ projects }) {
    const [modal, setModal]         = useState(null);
    const [panelOpen, setPanelOpen] = useState(false);
    const [selected, setSelected]   = useState(null);
    const [search, setSearch]       = useState('');

    const { data, setData, post, processing, errors, clearErrors } = useForm(EMPTY);

    const openNew = () => {
        clearErrors();
        setData(EMPTY);
        setSelected(null);
        setPanelOpen(true);
    };

    const openEdit = (project) => {
        clearErrors();
        setData({
            _method:     'PUT',
            title:       project.title ?? '',
            description: project.description ?? '',
            content:     project.content ?? '',
            github_url:  project.github_url ?? '',
            image:       null,
            order:       project.order ?? 1,
            is_active:   project.is_active ?? true,
        });
        setSelected(project);
        setPanelOpen(true);
    };

    const closePanel = () => { setPanelOpen(false); setSelected(null); };

    const submit = (e) => {
        e.preventDefault();
        const opts = { forceFormData: true, onSuccess: closePanel };
        if (selected) {
            post(route('dashboard.projects.update', selected.id), opts);
        } else {
            post(route('dashboard.projects.store'), opts);
        }
    };

    const sync = (id) => router.post(route('dashboard.projects.sync', id));

    const askDelete = (id) => setModal({ id });
    const handleConfirm = () => {
        if (selected?.id === modal.id) closePanel();
        router.delete(route('dashboard.projects.destroy', modal.id));
        setModal(null);
    };

    const filtered = projects.filter(p =>
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.github_url?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout header="GitHub Projects">
            <Head title="GitHub Projects" />

            <ConfirmModal
                open={modal !== null}
                title="Delete project?"
                message="This will permanently delete the project and all its data."
                onConfirm={handleConfirm}
                onCancel={() => setModal(null)}
            />

            {/* toolbar */}
            <div className="d-flex justify-content-between align-items-center mb-3 gap-2">
                <span className="text-muted small">{projects.length} projects</span>
                <input
                    className="form-control form-control-sm"
                    style={{ maxWidth: 220 }}
                    placeholder="Search projects…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <button className="btn btn-primary btn-sm" onClick={openNew}>+ New Project</button>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                {/* ── Table ── */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card border-0 shadow-sm">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Title</th>
                                    <th>GitHub URL</th>
                                    <th>Order</th>
                                    <th>Active</th>
                                    <th>Synced</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 && (
                                    <tr><td colSpan={6} className="text-center text-muted py-4">No projects found.</td></tr>
                                )}
                                {filtered.map(p => (
                                    <tr
                                        key={p.id}
                                        className={selected?.id === p.id ? 'table-active' : ''}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => openEdit(p)}
                                    >
                                        <td className="align-middle fw-semibold">{p.title}</td>
                                        <td className="align-middle">
                                            <a href={p.github_url} target="_blank" rel="noreferrer" className="text-decoration-none small" onClick={e => e.stopPropagation()}>
                                                {p.github_url}
                                            </a>
                                        </td>
                                        <td className="align-middle">{p.order}</td>
                                        <td className="align-middle">
                                            <span className={`badge ${p.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                                {p.is_active ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="align-middle small text-muted">
                                            {p.synced_at ? new Date(p.synced_at).toLocaleDateString() : '—'}
                                        </td>
                                        <td className="align-middle text-end" onClick={e => e.stopPropagation()}>
                                            <div className="d-flex gap-1 justify-content-end">
                                                <button onClick={() => sync(p.id)} className="btn btn-outline-secondary btn-sm">Sync</button>
                                                <button onClick={() => askDelete(p.id)} className="btn btn-outline-danger btn-sm">Delete</button>
                                            </div>
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
                    title={selected ? 'Edit Project' : 'New Project'}
                    onClose={closePanel}
                    width={420}
                >
                    <form onSubmit={submit} encType="multipart/form-data" className="d-flex flex-column gap-3">
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
                            <label className="form-label fw-semibold small">GitHub URL *</label>
                            <input
                                type="url"
                                className={`form-control ${errors.github_url ? 'is-invalid' : ''}`}
                                value={data.github_url}
                                onChange={e => setData('github_url', e.target.value)}
                            />
                            {errors.github_url && <div className="invalid-feedback">{errors.github_url}</div>}
                        </div>
                        <div>
                            <label className="form-label fw-semibold small">Description</label>
                            <textarea
                                className="form-control"
                                rows={3}
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="form-label fw-semibold small">
                                Content <span className="text-muted fw-normal">(Markdown, max 10 000 chars)</span>
                            </label>
                            <textarea
                                className={`form-control font-monospace ${errors.content ? 'is-invalid' : ''}`}
                                rows={7}
                                value={data.content}
                                onChange={e => setData('content', e.target.value)}
                                maxLength={10000}
                            />
                            <div className="form-text text-end">{data.content.length} / 10 000</div>
                            {errors.content && <div className="invalid-feedback">{errors.content}</div>}
                        </div>
                        <div>
                            <label className="form-label fw-semibold small">
                                Image <span className="text-muted fw-normal">(JPEG/PNG/GIF/WebP, max 2 MB)</span>
                            </label>
                            {selected?.image && (
                                <div className="mb-2">
                                    <img
                                        src={`/storage/${selected.image}`}
                                        alt="Current"
                                        style={{ maxHeight: 100, maxWidth: '100%', objectFit: 'contain', borderRadius: 6 }}
                                    />
                                    <div className="form-text">Upload a new file to replace.</div>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className={`form-control ${errors.image ? 'is-invalid' : ''}`}
                                onChange={e => setData('image', e.target.files[0] ?? null)}
                            />
                            {errors.image && <div className="invalid-feedback">{errors.image}</div>}
                        </div>
                        <div className="row g-2">
                            <div className="col-6">
                                <label className="form-label fw-semibold small">Order</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={data.order}
                                    onChange={e => setData('order', parseInt(e.target.value) || 1)}
                                />
                            </div>
                            <div className="col-6 d-flex align-items-end pb-1">
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="proj_is_active"
                                        checked={data.is_active}
                                        onChange={e => setData('is_active', e.target.checked)}
                                    />
                                    <label className="form-check-label fw-semibold small" htmlFor="proj_is_active">Active</label>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-primary btn-sm" disabled={processing}>
                                {processing ? 'Saving…' : selected ? 'Save Changes' : 'Create Project'}
                            </button>
                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={closePanel}>Cancel</button>
                        </div>
                    </form>
                </SlidePanel>
            </div>
        </DashboardLayout>
    );
}
