import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function NoteEdit({ note }) {
    const { data, setData, put, processing, errors } = useForm({
        title: note.title ?? '',
        content: note.content ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('dashboard.notes.update', note.id));
    };

    return (
        <DashboardLayout header="Edit Note">
            <Head title="Edit Note" />
            <div style={{ maxWidth: '640px' }}>
                <form onSubmit={submit}>
                    <div className="card border-0 shadow-sm">
                        <div className="card-body d-flex flex-column gap-3">
                            <div>
                                <label className="form-label fw-semibold small">Title *</label>
                                <input className={`form-control ${errors.title ? 'is-invalid' : ''}`} value={data.title} onChange={e => setData('title', e.target.value)} />
                                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                            </div>
                            <div>
                                <label className="form-label fw-semibold small">Content</label>
                                <textarea className="form-control" rows={10} value={data.content} onChange={e => setData('content', e.target.value)} />
                            </div>
                        </div>
                        <div className="card-footer bg-transparent d-flex gap-2">
                            <button type="submit" className="btn btn-primary" disabled={processing}>{processing ? 'Saving…' : 'Save Changes'}</button>
                            <Link href={route('dashboard.notes.index')} className="btn btn-outline-secondary">Cancel</Link>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
