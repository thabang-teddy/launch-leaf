import DashboardLayout from '@/Layouts/DashboardLayout';
import WysiwygEditor from '@/Components/WysiwygEditor';
import { Head, Link, useForm } from '@inertiajs/react';

export default function PageCreate() {
    const { data, setData, post, processing, errors } = useForm({
        title: '', content: '', is_published: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.pages.store'));
    };

    return (
        <DashboardLayout header="New Page">
            <Head title="New Page" />
            <div style={{ maxWidth: '720px' }}>
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
                                <WysiwygEditor value={data.content} onChange={val => setData('content', val)} placeholder="Write your page content…" />
                            </div>
                            <div className="form-check">
                                <input type="checkbox" className="form-check-input" id="is_published" checked={data.is_published} onChange={e => setData('is_published', e.target.checked)} />
                                <label className="form-check-label fw-semibold small" htmlFor="is_published">Publish</label>
                            </div>
                        </div>
                        <div className="card-footer bg-transparent d-flex gap-2">
                            <button type="submit" className="btn btn-primary" disabled={processing}>{processing ? 'Saving…' : 'Create Page'}</button>
                            <Link href={route('dashboard.pages.index')} className="btn btn-outline-secondary">Cancel</Link>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
