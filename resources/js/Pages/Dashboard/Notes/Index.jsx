import ConfirmModal from '@/Components/ConfirmModal';
import SlidePanel from '@/Components/SlidePanel';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const EMPTY = { title: '', content: '' };

export default function NotesIndex({ notes }) {
    const [modal, setModal]       = useState(null);
    const [panelOpen, setPanelOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [search, setSearch]     = useState('');

    const { data, setData, post, put, processing, errors, clearErrors } = useForm(EMPTY);

    const openNew = () => {
        clearErrors();
        setData(EMPTY);
        setSelected(null);
        setPanelOpen(true);
    };

    const openEdit = (note) => {
        clearErrors();
        setData({ title: note.title ?? '', content: note.content ?? '' });
        setSelected(note);
        setPanelOpen(true);
    };

    const closePanel = () => { setPanelOpen(false); setSelected(null); };

    const submit = (e) => {
        e.preventDefault();
        if (selected) {
            put(route('dashboard.notes.update', selected.id), { onSuccess: closePanel });
        } else {
            post(route('dashboard.notes.store'), { onSuccess: closePanel });
        }
    };

    const askDelete = (id) => setModal({ id });
    const handleConfirm = () => {
        if (selected?.id === modal.id) closePanel();
        router.delete(route('dashboard.notes.destroy', modal.id));
        setModal(null);
    };

    const filtered = notes.filter(n =>
        n.title?.toLowerCase().includes(search.toLowerCase()) ||
        n.content?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout header="Notes">
            <Head title="Notes" />

            <ConfirmModal
                open={modal !== null}
                title="Delete note?"
                message="This will permanently delete the note and cannot be recovered."
                onConfirm={handleConfirm}
                onCancel={() => setModal(null)}
            />

            {/* toolbar */}
            <div className="d-flex justify-content-between align-items-center mb-3 gap-2">
                <span className="text-muted small">{notes.length} notes</span>
                <input
                    className="form-control form-control-sm"
                    style={{ maxWidth: 220 }}
                    placeholder="Search notes…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <button className="btn btn-primary btn-sm" onClick={openNew}>+ New Note</button>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                {/* ── Table ── */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card border-0 shadow-sm">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Title</th>
                                    <th>Preview</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 && (
                                    <tr><td colSpan={3} className="text-center text-muted py-4">No notes found.</td></tr>
                                )}
                                {filtered.map(note => (
                                    <tr
                                        key={note.id}
                                        className={selected?.id === note.id ? 'table-active' : ''}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => openEdit(note)}
                                    >
                                        <td className="align-middle fw-semibold">{note.title}</td>
                                        <td className="align-middle small text-muted" style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {note.content || '—'}
                                        </td>
                                        <td className="align-middle text-end" onClick={e => e.stopPropagation()}>
                                            <button onClick={() => askDelete(note.id)} className="btn btn-outline-danger btn-sm">Delete</button>
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
                    title={selected ? 'Edit Note' : 'New Note'}
                    onClose={closePanel}
                    width={380}
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
                            <label className="form-label fw-semibold small">Content <span className="text-muted fw-normal">Markdown supported</span></label>
                            <textarea
                                className="form-control font-monospace"
                                rows={14}
                                placeholder="# Heading&#10;&#10;Write your note in **markdown**…"
                                value={data.content}
                                onChange={e => setData('content', e.target.value)}
                            />
                        </div>
                        <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-primary btn-sm" disabled={processing}>
                                {processing ? 'Saving…' : selected ? 'Save Changes' : 'Create Note'}
                            </button>
                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={closePanel}>Cancel</button>
                        </div>
                    </form>
                </SlidePanel>
            </div>
        </DashboardLayout>
    );
}
