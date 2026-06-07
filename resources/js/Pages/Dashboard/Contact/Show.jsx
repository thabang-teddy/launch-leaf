import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ContactShow({ contact }) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({ reply: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.contact.reply', contact.id));
    };

    return (
        <DashboardLayout header="Contact Message">
            <Head title="Message" />
            <div style={{ maxWidth: '720px' }}>
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-white">
                        <div className="d-flex justify-content-between">
                            <div>
                                <div className="fw-semibold">{contact.name} <span className="text-muted fw-normal small">({contact.email})</span></div>
                                {contact.subject && <div className="small text-muted">Subject: {contact.subject}</div>}
                            </div>
                            <div className="small text-muted">{new Date(contact.created_at).toLocaleString()}</div>
                        </div>
                    </div>
                    <div className="card-body">
                        <p style={{ whiteSpace: 'pre-wrap' }}>{contact.message}</p>
                    </div>
                </div>

                {contact.reply && (
                    <div className="card border-0 shadow-sm mb-4 border-start border-success border-3">
                        <div className="card-header bg-white">
                            <span className="fw-semibold text-success">Your reply</span>
                            {contact.replied_at && <span className="small text-muted ms-2">{new Date(contact.replied_at).toLocaleString()}</span>}
                        </div>
                        <div className="card-body">
                            <p style={{ whiteSpace: 'pre-wrap' }}>{contact.reply}</p>
                        </div>
                    </div>
                )}

                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white fw-semibold">
                        {contact.reply ? 'Send another reply' : 'Reply'}
                    </div>
                    <div className="card-body">
                        {recentlySuccessful && <div className="alert alert-success py-2 mb-3">Reply sent!</div>}
                        <form onSubmit={submit}>
                            <textarea
                                className={`form-control mb-3 ${errors.reply ? 'is-invalid' : ''}`}
                                rows={5}
                                placeholder="Write your reply…"
                                value={data.reply}
                                onChange={e => setData('reply', e.target.value)}
                            />
                            {errors.reply && <div className="invalid-feedback d-block">{errors.reply}</div>}
                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-primary" disabled={processing}>{processing ? 'Sending…' : 'Send Reply'}</button>
                                <Link href={route('dashboard.contact.index')} className="btn btn-outline-secondary">Back</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
