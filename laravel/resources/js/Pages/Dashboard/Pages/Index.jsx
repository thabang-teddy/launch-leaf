import ConfirmModal from '@/Components/ConfirmModal';
import SlidePanel from '@/Components/SlidePanel';
import WysiwygEditor from '@/Components/WysiwygEditor';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const EMPTY = { title: '', content: '', is_published: false };

export default function PagesIndex({ pages }) {
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

    const openEdit = (page) => {
        clearErrors();
        setData({
            title:        page.title ?? '',
            content:      page.content ?? '',
            is_published: page.is_published ?? false,
        });
        setSelected(page);
        setPanelOpen(true);
    };

    const closePanel = () => { setPanelOpen(false); setSelected(null); };

    const submit = (e) => {
        e.preventDefault();
        if (selected) {
            put(route('dashboard.pages.update', selected.id), { onSuccess: closePanel });
        } else {
            post(route('dashboard.pages.store'), { onSuccess: closePanel });
        }
    };

    const askDelete = (id) => setModal({ id });
    const handleConfirm = () => {
        if (selected?.id === modal.id) closePanel();
        router.delete(route('dashboard.pages.destroy', modal.id));
        setModal(null);
    };

    const filtered = pages.filter(p =>
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.slug?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout header="Pages">
            <Head title="Pages" />

            <ConfirmModal
                open={modal !== null}
                title="Delete page?"
                message="This will permanently delete the page and cannot be recovered."
                onConfirm={handleConfirm}
                onCancel={() => setModal(null)}
            />

            {/* toolbar */}
            <div className="d-flex justify-content-between align-items-center mb-3 gap-2">
                <span className="text-muted small">{pages.length} pages</span>
                <input
                    className="form-control form-control-sm"
                    style={{ maxWidth: 220 }}
                    placeholder="Search pages…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <button className="btn btn-primary btn-sm" onClick={openNew}>+ New Page</button>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                {/* ── Table ── */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card border-0 shadow-sm">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Title</th>
                                    <th>Slug</th>
                                    <th>Published</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 && (
                                    <tr><td colSpan={4} className="text-center text-muted py-4">No pages found.</td></tr>
                                )}
                                {filtered.map(page => (
                                    <tr
                                        key={page.id}
                                        className={selected?.id === page.id ? 'table-active' : ''}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => openEdit(page)}
                                    >
                                        <td className="align-middle fw-semibold">{page.title}</td>
                                        <td className="align-middle small text-muted">{page.slug}</td>
                                        <td className="align-middle">
                                            <span className={`badge ${page.is_published ? 'bg-success' : 'bg-secondary'}`}>
                                                {page.is_published ? 'Yes' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="align-middle text-end" onClick={e => e.stopPropagation()}>
                                            <button onClick={() => askDelete(page.id)} className="btn btn-outline-danger btn-sm">Delete</button>
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
                    title={selected ? 'Edit Page' : 'New Page'}
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
                            <label className="form-label fw-semibold small">Content</label>
                            <WysiwygEditor
                                key={selected?.id ?? 'new'}
                                value={data.content}
                                onChange={val => setData('content', val)}
                                placeholder="Write your page content…"
                            />
                        </div>
                        <div className="form-check">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="page_is_published"
                                checked={data.is_published}
                                onChange={e => setData('is_published', e.target.checked)}
                            />
                            <label className="form-check-label fw-semibold small" htmlFor="page_is_published">Publish</label>
                        </div>
                        <div className="d-flex gap-2 align-items-center">
                            <button type="submit" className="btn btn-primary btn-sm" disabled={processing}>
                                {processing ? 'Saving…' : selected ? 'Save Changes' : 'Create Page'}
                            </button>
                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={closePanel}>Cancel</button>
                            {selected?.slug && (
                                <a href={route('pages.show', selected.slug)} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm ms-auto">View Page</a>
                            )}
                        </div>
                    </form>
                </SlidePanel>
            </div>
        </DashboardLayout>
    );
}
