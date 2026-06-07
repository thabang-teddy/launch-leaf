import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ExperienceCreate() {
    const { data, setData, post, processing, errors } = useForm({
        title: '', company: '', location: '', start_date: '', end_date: '',
        is_current: false, description: '', type: 'work', order: 0,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.experience.store'));
    };

    return (
        <DashboardLayout header="New Experience">
            <Head title="New Experience" />
            <div style={{ maxWidth: '640px' }}>
                <form onSubmit={submit}>
                    <div className="card border-0 shadow-sm">
                        <div className="card-body d-flex flex-column gap-3">
                            {[['Title *', 'title'], ['Company *', 'company'], ['Location', 'location']].map(([label, key]) => (
                                <div key={key}>
                                    <label className="form-label fw-semibold small">{label}</label>
                                    <input className={`form-control ${errors[key] ? 'is-invalid' : ''}`} value={data[key]} onChange={e => setData(key, e.target.value)} />
                                    {errors[key] && <div className="invalid-feedback">{errors[key]}</div>}
                                </div>
                            ))}
                            <div>
                                <label className="form-label fw-semibold small">Type *</label>
                                <select className="form-select" value={data.type} onChange={e => setData('type', e.target.value)}>
                                    <option value="work">Work</option>
                                    <option value="education">Education</option>
                                </select>
                            </div>
                            <div className="row g-3">
                                <div className="col-sm-6">
                                    <label className="form-label fw-semibold small">Start Date *</label>
                                    <input type="date" className={`form-control ${errors.start_date ? 'is-invalid' : ''}`} value={data.start_date} onChange={e => setData('start_date', e.target.value)} />
                                    {errors.start_date && <div className="invalid-feedback">{errors.start_date}</div>}
                                </div>
                                <div className="col-sm-6">
                                    <label className="form-label fw-semibold small">End Date</label>
                                    <input type="date" className="form-control" value={data.end_date} disabled={data.is_current} onChange={e => setData('end_date', e.target.value)} />
                                </div>
                            </div>
                            <div className="form-check">
                                <input type="checkbox" className="form-check-input" id="is_current" checked={data.is_current} onChange={e => { setData('is_current', e.target.checked); if (e.target.checked) setData('end_date', ''); }} />
                                <label className="form-check-label fw-semibold small" htmlFor="is_current">Currently here</label>
                            </div>
                            <div>
                                <label className="form-label fw-semibold small">Description</label>
                                <textarea className="form-control" rows={4} value={data.description} onChange={e => setData('description', e.target.value)} />
                            </div>
                            <div>
                                <label className="form-label fw-semibold small">Order</label>
                                <input type="number" className="form-control" value={data.order} onChange={e => setData('order', parseInt(e.target.value) || 0)} />
                            </div>
                        </div>
                        <div className="card-footer bg-transparent d-flex gap-2">
                            <button type="submit" className="btn btn-primary" disabled={processing}>{processing ? 'Saving…' : 'Create'}</button>
                            <Link href={route('dashboard.experience.index')} className="btn btn-outline-secondary">Cancel</Link>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
