import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function TipCreate() {
    const { data, setData, post, processing, errors } = useForm({
        title: '', problem: '', solution: '', tags: '', is_published: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.tips.store'));
    };

    return (
        <DashboardLayout header="New Tip">
            <Head title="New Tip" />
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
                                <label className="form-label fw-semibold small">Problem * <span className="text-muted fw-normal">Markdown supported</span></label>
                                <textarea className={`form-control font-monospace ${errors.problem ? 'is-invalid' : ''}`} rows={6} value={data.problem} onChange={e => setData('problem', e.target.value)} />
                                {errors.problem && <div className="invalid-feedback">{errors.problem}</div>}
                            </div>
                            <div>
                                <label className="form-label fw-semibold small">Solution * <span className="text-muted fw-normal">Markdown supported</span></label>
                                <textarea className={`form-control font-monospace ${errors.solution ? 'is-invalid' : ''}`} rows={6} value={data.solution} onChange={e => setData('solution', e.target.value)} />
                                {errors.solution && <div className="invalid-feedback">{errors.solution}</div>}
                            </div>
                            <div>
                                <label className="form-label fw-semibold small">Tags <span className="text-muted fw-normal">(comma separated)</span></label>
                                <input className="form-control" placeholder="laravel, react, debugging" value={data.tags} onChange={e => setData('tags', e.target.value)} />
                            </div>
                            <div className="form-check">
                                <input type="checkbox" className="form-check-input" id="is_published" checked={data.is_published} onChange={e => setData('is_published', e.target.checked)} />
                                <label className="form-check-label fw-semibold small" htmlFor="is_published">Publish</label>
                            </div>
                        </div>
                        <div className="card-footer bg-transparent d-flex gap-2">
                            <button type="submit" className="btn btn-primary" disabled={processing}>{processing ? 'Saving…' : 'Create Tip'}</button>
                            <Link href={route('dashboard.tips.index')} className="btn btn-outline-secondary">Cancel</Link>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
