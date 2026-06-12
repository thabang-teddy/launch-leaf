import ConfirmModal from '@/Components/ConfirmModal';
import SlidePanel from '@/Components/SlidePanel';
import WysiwygEditor from '@/Components/WysiwygEditor';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const EMPTY = {
    title: '', company: '', summary: '', location: '',
    start_date: '', end_date: '', is_current: false,
    description: '', type: 'work', order: 0,
};

export default function ExperienceIndex({ items }) {
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
            company:     item.company ?? '',
            summary:     item.summary ?? '',
            location:    item.location ?? '',
            start_date:  item.start_date ?? '',
            end_date:    item.end_date ?? '',
            is_current:  item.is_current ?? false,
            description: item.description ?? '',
            type:        item.type ?? 'work',
            order:       item.order ?? 0,
        });
        setSelected(item);
        setPanelOpen(true);
    };

    const closePanel = () => { setPanelOpen(false); setSelected(null); };

    const submit = (e) => {
        e.preventDefault();
        if (selected) {
            put(route('dashboard.experience.update', selected.id), { onSuccess: closePanel });
        } else {
            post(route('dashboard.experience.store'), { onSuccess: closePanel });
        }
    };

    const askDelete = (id) => setModal({ id });
    const handleConfirm = () => {
        if (selected?.id === modal.id) closePanel();
        router.delete(route('dashboard.experience.destroy', modal.id));
        setModal(null);
    };

    const filtered = items.filter(i =>
        i.title?.toLowerCase().includes(search.toLowerCase()) ||
        i.company?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout header="Experience">
            <Head title="Experience" />

            <ConfirmModal
                open={modal !== null}
                title="Delete experience entry?"
                message="This will permanently delete the experience entry and cannot be recovered."
                onConfirm={handleConfirm}
                onCancel={() => setModal(null)}
            />

            {/* toolbar */}
            <div className="d-flex justify-content-between align-items-center mb-3 gap-2">
                <span className="text-muted small">{items.length} entries</span>
                <input
                    className="form-control form-control-sm"
                    style={{ maxWidth: 220 }}
                    placeholder="Search experience…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <button className="btn btn-primary btn-sm" onClick={openNew}>+ New Entry</button>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                {/* ── Table ── */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card border-0 shadow-sm">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Title</th>
                                    <th>Company</th>
                                    <th>Type</th>
                                    <th>Period</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 && (
                                    <tr><td colSpan={5} className="text-center text-muted py-4">No entries found.</td></tr>
                                )}
                                {filtered.map(item => (
                                    <tr
                                        key={item.id}
                                        className={selected?.id === item.id ? 'table-active' : ''}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => openEdit(item)}
                                    >
                                        <td className="align-middle fw-semibold">{item.title}</td>
                                        <td className="align-middle">{item.company}</td>
                                        <td className="align-middle">
                                            <span className={`badge ${item.type === 'work' ? 'bg-primary' : 'bg-info'}`}>{item.type}</span>
                                        </td>
                                        <td className="align-middle small">
                                            {item.start_date} — {item.is_current ? 'Present' : (item.end_date ?? '—')}
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
                    title={selected ? 'Edit Experience' : 'New Experience'}
                    onClose={closePanel}
                    width={440}
                >
                    <form onSubmit={submit} className="d-flex flex-column gap-3">
                        {[['Title *', 'title'], ['Company *', 'company'], ['Location', 'location']].map(([label, key]) => (
                            <div key={key}>
                                <label className="form-label fw-semibold small">{label}</label>
                                <input
                                    className={`form-control ${errors[key] ? 'is-invalid' : ''}`}
                                    value={data[key]}
                                    onChange={e => setData(key, e.target.value)}
                                    autoFocus={key === 'title'}
                                />
                                {errors[key] && <div className="invalid-feedback">{errors[key]}</div>}
                            </div>
                        ))}
                        <div>
                            <label className="form-label fw-semibold small">Summary <span className="text-muted fw-normal">(short one-liner)</span></label>
                            <input
                                className={`form-control ${errors.summary ? 'is-invalid' : ''}`}
                                maxLength={500}
                                value={data.summary}
                                onChange={e => setData('summary', e.target.value)}
                            />
                            {errors.summary && <div className="invalid-feedback">{errors.summary}</div>}
                        </div>
                        <div>
                            <label className="form-label fw-semibold small">Type *</label>
                            <select className="form-select" value={data.type} onChange={e => setData('type', e.target.value)}>
                                <option value="work">Work</option>
                                <option value="education">Education</option>
                            </select>
                        </div>
                        <div className="row g-2">
                            <div className="col-6">
                                <label className="form-label fw-semibold small">Start Date *</label>
                                <input
                                    type="date"
                                    className={`form-control ${errors.start_date ? 'is-invalid' : ''}`}
                                    value={data.start_date}
                                    onChange={e => setData('start_date', e.target.value)}
                                />
                                {errors.start_date && <div className="invalid-feedback">{errors.start_date}</div>}
                            </div>
                            <div className="col-6">
                                <label className="form-label fw-semibold small">End Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={data.end_date}
                                    disabled={data.is_current}
                                    onChange={e => setData('end_date', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="form-check">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="exp_is_current"
                                checked={data.is_current}
                                onChange={e => {
                                    setData('is_current', e.target.checked);
                                    if (e.target.checked) setData('end_date', '');
                                }}
                            />
                            <label className="form-check-label fw-semibold small" htmlFor="exp_is_current">Currently here</label>
                        </div>
                        <div>
                            <label className="form-label fw-semibold small">Description</label>
                            <WysiwygEditor
                                key={selected?.id ?? 'new'}
                                value={data.description}
                                onChange={val => setData('description', val)}
                                placeholder="Describe your role and responsibilities…"
                            />
                            {errors.description && <div className="text-danger small mt-1">{errors.description}</div>}
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
                                {processing ? 'Saving…' : selected ? 'Save Changes' : 'Create'}
                            </button>
                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={closePanel}>Cancel</button>
                        </div>
                    </form>
                </SlidePanel>
            </div>
        </DashboardLayout>
    );
}
