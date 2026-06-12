import ConfirmModal from '@/Components/ConfirmModal';
import SlidePanel from '@/Components/SlidePanel';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const EMPTY = { name: '', icon: '', description: '', order: 0 };

export default function SkillsIndex({ items }) {
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
            name:        item.name ?? '',
            icon:        item.icon ?? '',
            description: item.description ?? '',
            order:       item.order ?? 0,
        });
        setSelected(item);
        setPanelOpen(true);
    };

    const closePanel = () => { setPanelOpen(false); setSelected(null); };

    const submit = (e) => {
        e.preventDefault();
        if (selected) {
            put(route('dashboard.skills.update', selected.id), { onSuccess: closePanel });
        } else {
            post(route('dashboard.skills.store'), { onSuccess: closePanel });
        }
    };

    const askDelete = (id) => setModal({ id });
    const handleConfirm = () => {
        if (selected?.id === modal.id) closePanel();
        router.delete(route('dashboard.skills.destroy', modal.id));
        setModal(null);
    };

    const filtered = items.filter(i =>
        i.name?.toLowerCase().includes(search.toLowerCase()) ||
        i.description?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout header="Skills">
            <Head title="Skills" />

            <ConfirmModal
                open={modal !== null}
                title="Delete skill?"
                message="This will permanently delete this skill and cannot be recovered."
                onConfirm={handleConfirm}
                onCancel={() => setModal(null)}
            />

            {/* toolbar */}
            <div className="d-flex justify-content-between align-items-center mb-3 gap-2">
                <span className="text-muted small">{items.length} skills</span>
                <input
                    className="form-control form-control-sm"
                    style={{ maxWidth: 220 }}
                    placeholder="Search skills…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <button className="btn btn-primary btn-sm" onClick={openNew}>+ New Skill</button>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                {/* ── Table ── */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card border-0 shadow-sm">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ width: 56 }}>Icon</th>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Order</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 && (
                                    <tr><td colSpan={5} className="text-center text-muted py-4">No skills found.</td></tr>
                                )}
                                {filtered.map(item => (
                                    <tr
                                        key={item.id}
                                        className={selected?.id === item.id ? 'table-active' : ''}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => openEdit(item)}
                                    >
                                        <td className="align-middle">
                                            {item.icon
                                                ? <i className={item.icon} style={{ fontSize: '1.6rem' }} />
                                                : <span className="text-muted">—</span>}
                                        </td>
                                        <td className="align-middle fw-semibold">{item.name}</td>
                                        <td className="align-middle text-muted small" style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {item.description ?? '—'}
                                        </td>
                                        <td className="align-middle">{item.order}</td>
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
                    title={selected ? 'Edit Skill' : 'New Skill'}
                    onClose={closePanel}
                    width={380}
                >
                    <form onSubmit={submit} className="d-flex flex-column gap-3">
                        <div>
                            <label className="form-label fw-semibold small">Name *</label>
                            <input
                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                placeholder="e.g. React.js"
                                autoFocus
                            />
                            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                        </div>
                        <div>
                            <label className="form-label fw-semibold small">Icon class</label>
                            <div className="d-flex align-items-center gap-2">
                                <input
                                    className="form-control"
                                    value={data.icon}
                                    onChange={e => setData('icon', e.target.value)}
                                    placeholder="e.g. devicon-react-original colored"
                                />
                                {data.icon && (
                                    <i className={data.icon} style={{ fontSize: '1.8rem', flexShrink: 0 }} />
                                )}
                            </div>
                            <div className="form-text">
                                Use a <a href="https://devicon.dev" target="_blank" rel="noreferrer">Devicon</a> or{' '}
                                <a href="https://fontawesome.com/icons" target="_blank" rel="noreferrer">Font Awesome</a> class, or an emoji.
                            </div>
                        </div>
                        <div>
                            <label className="form-label fw-semibold small">Description</label>
                            <textarea
                                className="form-control"
                                rows={4}
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="form-label fw-semibold small">Order</label>
                            <input
                                type="number"
                                className="form-control"
                                value={data.order}
                                onChange={e => setData('order', parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-primary btn-sm" disabled={processing}>
                                {processing ? 'Saving…' : selected ? 'Save Changes' : 'Create Skill'}
                            </button>
                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={closePanel}>Cancel</button>
                        </div>
                    </form>
                </SlidePanel>
            </div>
        </DashboardLayout>
    );
}
