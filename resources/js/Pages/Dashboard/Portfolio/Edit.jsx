import DashboardLayout from '@/Layouts/DashboardLayout';
import WysiwygEditor from '@/Components/WysiwygEditor';
import { Head, Link, useForm } from '@inertiajs/react';

export default function PortfolioEdit({ item }) {
    const { data, setData, put, processing, errors } = useForm({
        title: item.title ?? '',
        description: item.description ?? '',
        content: item.content ?? '',
        image_path: item.image_path ?? '',
        tech_stack: item.tech_stack ?? '',
        live_url: item.live_url ?? '',
        repo_url: item.repo_url ?? '',
        order: item.order ?? 1,
        is_active: item.is_active ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('dashboard.portfolio.update', item.id));
    };

    return (
        <DashboardLayout header="Edit Portfolio Item">
            <Head title="Edit Portfolio Item" />
            <div style={{ maxWidth: '720px' }}>
                <form onSubmit={submit}>
                    <div className="card border-0 shadow-sm mb-3">
                        <div className="card-header bg-white fw-semibold">Details</div>
                        <div className="card-body d-flex flex-column gap-3">
                            <div>
                                <label className="form-label fw-semibold small">Title *</label>
                                <input className={`form-control ${errors.title ? 'is-invalid' : ''}`} value={data.title} onChange={e => setData('title', e.target.value)} />
                                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                            </div>
                            <div>
                                <label className="form-label fw-semibold small">Short Description</label>
                                <textarea className="form-control" rows={2} value={data.description} onChange={e => setData('description', e.target.value)} />
                            </div>
                            <div>
                                <label className="form-label fw-semibold small">Full Content</label>
                                <WysiwygEditor value={data.content} onChange={val => setData('content', val)} placeholder="Describe the project in detail…" />
                            </div>
                            <div>
                                <label className="form-label fw-semibold small">Tech Stack <span className="text-muted fw-normal">(comma separated)</span></label>
                                <input className="form-control" value={data.tech_stack} onChange={e => setData('tech_stack', e.target.value)} />
                            </div>
                            <div className="row g-3">
                                <div className="col-sm-6">
                                    <label className="form-label fw-semibold small">Live URL</label>
                                    <input type="url" className={`form-control ${errors.live_url ? 'is-invalid' : ''}`} value={data.live_url} onChange={e => setData('live_url', e.target.value)} />
                                    {errors.live_url && <div className="invalid-feedback">{errors.live_url}</div>}
                                </div>
                                <div className="col-sm-6">
                                    <label className="form-label fw-semibold small">Repo URL</label>
                                    <input type="url" className={`form-control ${errors.repo_url ? 'is-invalid' : ''}`} value={data.repo_url} onChange={e => setData('repo_url', e.target.value)} />
                                    {errors.repo_url && <div className="invalid-feedback">{errors.repo_url}</div>}
                                </div>
                            </div>
                            <div>
                                <label className="form-label fw-semibold small">Image Path</label>
                                <input className="form-control" value={data.image_path} onChange={e => setData('image_path', e.target.value)} />
                            </div>
                            <div className="row g-3">
                                <div className="col-sm-6">
                                    <label className="form-label fw-semibold small">Order</label>
                                    <input type="number" className="form-control" value={data.order} onChange={e => setData('order', parseInt(e.target.value) || 1)} />
                                </div>
                                <div className="col-sm-6 d-flex align-items-end">
                                    <div className="form-check">
                                        <input type="checkbox" className="form-check-input" id="is_active" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} />
                                        <label className="form-check-label fw-semibold small" htmlFor="is_active">Active</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="card-footer bg-transparent d-flex gap-2">
                            <button type="submit" className="btn btn-primary" disabled={processing}>{processing ? 'Saving…' : 'Save Changes'}</button>
                            <Link href={route('dashboard.portfolio.index')} className="btn btn-outline-secondary">Cancel</Link>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
