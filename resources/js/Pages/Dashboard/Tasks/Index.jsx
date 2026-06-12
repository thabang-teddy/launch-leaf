import ConfirmModal from '@/Components/ConfirmModal';
import SlidePanel from '@/Components/SlidePanel';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const EMPTY = { title: '', description: '', due_date: '', order: 0 };

export default function TasksIndex({ tasks }) {
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

    const openEdit = (task) => {
        clearErrors();
        setData({
            title:       task.title ?? '',
            description: task.description ?? '',
            due_date:    task.due_date ?? '',
            order:       task.order ?? 0,
        });
        setSelected(task);
        setPanelOpen(true);
    };

    const closePanel = () => { setPanelOpen(false); setSelected(null); };

    const submit = (e) => {
        e.preventDefault();
        if (selected) {
            put(route('dashboard.tasks.update', selected.id), { onSuccess: closePanel });
        } else {
            post(route('dashboard.tasks.store'), { onSuccess: closePanel });
        }
    };

    const toggle = (task) => {
        router.put(route('dashboard.tasks.update', task.id), {
            title:        task.title,
            description:  task.description,
            due_date:     task.due_date,
            is_completed: !task.is_completed,
            order:        task.order,
        }, { preserveScroll: true });
    };

    const askDelete = (id) => setModal({ id });
    const handleConfirm = () => {
        if (selected?.id === modal.id) closePanel();
        router.delete(route('dashboard.tasks.destroy', modal.id));
        setModal(null);
    };

    const pending = tasks.filter(t => !t.is_completed);
    const done    = tasks.filter(t =>  t.is_completed);

    const filtered = tasks.filter(t =>
        t.title?.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout header="Tasks">
            <Head title="Tasks" />

            <ConfirmModal
                open={modal !== null}
                title="Delete task?"
                message="This will permanently delete the task and cannot be recovered."
                onConfirm={handleConfirm}
                onCancel={() => setModal(null)}
            />

            {/* toolbar */}
            <div className="d-flex justify-content-between align-items-center mb-3 gap-2">
                <span className="text-muted small">{pending.length} pending · {done.length} done</span>
                <input
                    className="form-control form-control-sm"
                    style={{ maxWidth: 220 }}
                    placeholder="Search tasks…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <button className="btn btn-primary btn-sm" onClick={openNew}>+ New Task</button>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                {/* ── Table ── */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card border-0 shadow-sm">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ width: 40 }}></th>
                                    <th>Title</th>
                                    <th>Due Date</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 && (
                                    <tr><td colSpan={5} className="text-center text-muted py-4">No tasks found.</td></tr>
                                )}
                                {filtered.map(task => (
                                    <tr
                                        key={task.id}
                                        className={selected?.id === task.id ? 'table-active' : ''}
                                        style={{ cursor: 'pointer', opacity: task.is_completed ? 0.55 : 1 }}
                                        onClick={() => openEdit(task)}
                                    >
                                        <td className="align-middle" onClick={e => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                checked={task.is_completed}
                                                onChange={() => toggle(task)}
                                                style={{ cursor: 'pointer', width: '1.1rem', height: '1.1rem' }}
                                            />
                                        </td>
                                        <td className="align-middle">
                                            <span className={`fw-semibold ${task.is_completed ? 'text-decoration-line-through' : ''}`}>
                                                {task.title}
                                            </span>
                                            {task.description && (
                                                <div className="small text-muted" style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {task.description}
                                                </div>
                                            )}
                                        </td>
                                        <td className="align-middle small text-muted">
                                            {task.due_date || '—'}
                                        </td>
                                        <td className="align-middle">
                                            <span className={`badge ${task.is_completed ? 'bg-success' : 'bg-secondary'}`}>
                                                {task.is_completed ? 'Done' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="align-middle text-end" onClick={e => e.stopPropagation()}>
                                            <button onClick={() => askDelete(task.id)} className="btn btn-outline-danger btn-sm">Delete</button>
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
                    title={selected ? 'Edit Task' : 'New Task'}
                    onClose={closePanel}
                    width={360}
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
                            <label className="form-label fw-semibold small">Description <span className="text-muted fw-normal">Markdown supported</span></label>
                            <textarea
                                className="form-control font-monospace"
                                rows={4}
                                placeholder="Add task details…"
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="form-label fw-semibold small">Due Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={data.due_date}
                                onChange={e => setData('due_date', e.target.value)}
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
                                {processing ? 'Saving…' : selected ? 'Save Changes' : 'Create Task'}
                            </button>
                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={closePanel}>Cancel</button>
                        </div>
                    </form>
                </SlidePanel>
            </div>
        </DashboardLayout>
    );
}
