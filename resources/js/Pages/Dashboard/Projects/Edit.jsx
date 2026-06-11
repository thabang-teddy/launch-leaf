import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ProjectEdit({ project }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        title: project.title ?? '',
        description: project.description ?? '',
        content: project.content ?? '',
        github_url: project.github_url ?? '',
        image: null,
        order: project.order ?? 0,
        is_active: project.is_active ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.projects.update', project.id));
    };

    return (
        <DashboardLayout header="Edit Project">
            <Head title="Edit Project" />
            <div style={{ maxWidth: '640px' }}>
                <form onSubmit={submit} encType="multipart/form-data">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body d-flex flex-column gap-3">
                            <div>
                                <label className="form-label fw-semibold small">Title *</label>
                                <input className={`form-control ${errors.title ? 'is-invalid' : ''}`} value={data.title} onChange={e => setData('title', e.target.value)} />
                                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                            </div>
                            <div>
                                <label className="form-label fw-semibold small">GitHub URL *</label>
                                <input type="url" className={`form-control ${errors.github_url ? 'is-invalid' : ''}`} value={data.github_url} onChange={e => setData('github_url', e.target.value)} />
                                {errors.github_url && <div className="invalid-feedback">{errors.github_url}</div>}
                            </div>
                            <div>
                                <label className="form-label fw-semibold small">Description</label>
                                <textarea className="form-control" rows={3} value={data.description} onChange={e => setData('description', e.target.value)} />
                            </div>
                            <div>
                                <label className="form-label fw-semibold small">Content <span className="text-muted fw-normal">(Markdown, max 10 000 chars)</span></label>
                                <textarea
                                    className={`form-control font-monospace ${errors.content ? 'is-invalid' : ''}`}
                                    rows={8}
                                    value={data.content}
                                    onChange={e => setData('content', e.target.value)}
                                    maxLength={10000}
                                />
                                <div className="form-text text-end">{data.content.length} / 10 000</div>
                                {errors.content && <div className="invalid-feedback">{errors.content}</div>}
                            </div>
                            <div>
                                <label className="form-label fw-semibold small">Image <span className="text-muted fw-normal">(JPEG/PNG/GIF/WebP, max 2 MB)</span></label>
                                {project.image && (
                                    <div className="mb-2">
                                        <img
                                            src={`/storage/${project.image}`}
                                            alt="Current project image"
                                            style={{ maxHeight: '160px', maxWidth: '100%', objectFit: 'contain', borderRadius: '6px' }}
                                        />
                                        <div className="form-text">Upload a new file to replace the current image.</div>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className={`form-control ${errors.image ? 'is-invalid' : ''}`}
                                    onChange={e => setData('image', e.target.files[0] ?? null)}
                                />
                                {errors.image && <div className="invalid-feedback">{errors.image}</div>}
                            </div>
                            <div className="row g-3">
                                <div className="col-sm-6">
                                    <label className="form-label fw-semibold small">Order</label>
                                    <input type="number" className="form-control" value={data.order} onChange={e => setData('order', parseInt(e.target.value) || 0)} />
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
                            <button type="submit" className="btn btn-primary" disabled={processing}>
                                {processing ? 'Saving…' : 'Save Changes'}
                            </button>
                            <Link href={route('dashboard.projects.index')} className="btn btn-outline-secondary">Cancel</Link>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
