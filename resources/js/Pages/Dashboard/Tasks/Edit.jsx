import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function TaskEdit({ task }) {
    const { data, setData, put, processing, errors } = useForm({
        title: task.title ?? '',
        description: task.description ?? '',
        due_date: task.due_date ?? '',
        is_completed: task.is_completed ?? false,
        order: task.order ?? 0,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('dashboard.tasks.update', task.id));
    };

    return (
        <DashboardLayout header="Edit Task">
            <Head title="Edit Task" />
            <div style={{ maxWidth: '560px' }}>
                <form onSubmit={submit}>
                    <div className="card border-0 shadow-sm">
                        <div className="card-body d-flex flex-column gap-3">
                            <div>
                                <label className="form-label fw-semibold small">Title *</label>
                                <input className={`form-control ${errors.title ? 'is-invalid' : ''}`} value={data.title} onChange={e => setData('title', e.target.value)} />
                                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                            </div>
                            <div>
                                <label className="form-label fw-semibold small">Description <span className="text-muted fw-normal">Markdown supported</span></label>
                                <textarea
                                    className="form-control font-monospace"
                                    rows={4}
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="form-label fw-semibold small">Due Date</label>
                                <input type="date" className="form-control" value={data.due_date ?? ''} onChange={e => setData('due_date', e.target.value)} />
                            </div>
                            <div className="form-check">
                                <input type="checkbox" className="form-check-input" id="is_completed" checked={data.is_completed} onChange={e => setData('is_completed', e.target.checked)} />
                                <label className="form-check-label fw-semibold small" htmlFor="is_completed">Completed</label>
                            </div>
                        </div>
                        <div className="card-footer bg-transparent d-flex gap-2">
                            <button type="submit" className="btn btn-primary" disabled={processing}>{processing ? 'Saving…' : 'Save Changes'}</button>
                            <Link href={route('dashboard.tasks.index')} className="btn btn-outline-secondary">Cancel</Link>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
