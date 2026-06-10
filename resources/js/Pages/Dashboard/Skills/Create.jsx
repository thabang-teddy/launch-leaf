import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function SkillCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '', icon: '', description: '', order: 0,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.skills.store'));
    };

    return (
        <DashboardLayout header="New Skill">
            <Head title="New Skill" />
            <div style={{ maxWidth: '640px' }}>
                <form onSubmit={submit}>
                    <div className="card border-0 shadow-sm">
                        <div className="card-body d-flex flex-column gap-3">
                            <div>
                                <label className="form-label fw-semibold small">Name *</label>
                                <input
                                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="e.g. React.js"
                                />
                                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                            </div>

                            <div>
                                <label className="form-label fw-semibold small">Icon class</label>
                                <div className="d-flex align-items-center gap-2">
                                    <input
                                        className="form-control"
                                        value={data.icon}
                                        onChange={e => setData('icon', e.target.value)}
                                        placeholder="e.g. devicon-react-original colored"
                                    />
                                    {data.icon && (
                                        <i className={data.icon} style={{ fontSize: '1.8rem', flexShrink: 0 }} />
                                    )}
                                </div>
                                <div className="form-text">
                                    Use a <a href="https://devicon.dev" target="_blank" rel="noreferrer">Devicon</a> class, e.g. <code>devicon-react-original colored</code>
                                </div>
                            </div>

                            <div>
                                <label className="form-label fw-semibold small">Description</label>
                                <textarea
                                    className="form-control"
                                    rows={4}
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
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
                        </div>
                        <div className="card-footer bg-transparent d-flex gap-2">
                            <button type="submit" className="btn btn-primary" disabled={processing}>
                                {processing ? 'Saving…' : 'Create'}
                            </button>
                            <Link href={route('dashboard.skills.index')} className="btn btn-outline-secondary">Cancel</Link>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
