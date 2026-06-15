import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function AccountCreate() {
    const { data, setData, post, processing, errors } = useForm({
        platform: '', username: '', title: '', description: '', github_url: '', order: 1, is_active: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.accounts.store'));
    };

    return (
        <DashboardLayout header="New Account">
            <Head title="New Account" />
            <div style={{ maxWidth: '640px' }}>
                <form onSubmit={submit}>
                    <div className="card border-0 shadow-sm">
                        <div className="card-body d-flex flex-column gap-3">
                            {[
                                ['Platform *', 'platform', 'text'],
                                ['Username *', 'username', 'text'],
                                ['Title *', 'title', 'text'],
                                ['GitHub URL', 'github_url', 'url'],
                            ].map(([label, key, type]) => (
                                <div key={key}>
                                    <label className="form-label fw-semibold small">{label}</label>
                                    <input type={type} className={`form-control ${errors[key] ? 'is-invalid' : ''}`} value={data[key]} onChange={e => setData(key, e.target.value)} />
                                    {errors[key] && <div className="invalid-feedback">{errors[key]}</div>}
                                </div>
                            ))}
                            <div>
                                <label className="form-label fw-semibold small">Description</label>
                                <textarea className="form-control" rows={3} value={data.description} onChange={e => setData('description', e.target.value)} />
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
                            <button type="submit" className="btn btn-primary" disabled={processing}>{processing ? 'Saving…' : 'Create Account'}</button>
                            <Link href={route('dashboard.accounts.index')} className="btn btn-outline-secondary">Cancel</Link>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
