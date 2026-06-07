import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function TaskCreate() {
    const { data, setData, post, processing, errors } = useForm({
        title: '', description: '', due_date: '', order: 0,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.tasks.store'));
    };

    return (
        <DashboardLayout header="New Task">
            <Head title="New Task" />
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
                                <label className="form-label fw-semibold small">Description</label>
                                <textarea className="form-control" rows={3} value={data.description} onChange={e => setData('description', e.target.value)} />
                            </div>
                            <div>
                                <label className="form-label fw-semibold small">Due Date</label>
                                <input type="date" className="form-control" value={data.due_date} onChange={e => setData('due_date', e.target.value)} />
                            </div>
                        </div>
                        <div className="card-footer bg-transparent d-flex gap-2">
                            <button type="submit" className="btn btn-primary" disabled={processing}>{processing ? 'Saving…' : 'Create Task'}</button>
                            <Link href={route('dashboard.tasks.index')} className="btn btn-outline-secondary">Cancel</Link>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
