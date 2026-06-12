import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function NoteCreate() {
    const { data, setData, post, processing, errors } = useForm({ title: '', content: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.notes.store'));
    };

    return (
        <DashboardLayout header="New Note">
            <Head title="New Note" />
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
                                <label className="form-label fw-semibold small">Content <span className="text-muted fw-normal">Markdown supported</span></label>
                                <textarea
                                    className="form-control font-monospace"
                                    rows={12}
                                    placeholder="# Heading&#10;&#10;Write your note in **markdown**…"
                                    value={data.content}
                                    onChange={e => setData('content', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="card-footer bg-transparent d-flex gap-2">
                            <button type="submit" className="btn btn-primary" disabled={processing}>{processing ? 'Saving…' : 'Create Note'}</button>
                            <Link href={route('dashboard.notes.index')} className="btn btn-outline-secondary">Cancel</Link>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
