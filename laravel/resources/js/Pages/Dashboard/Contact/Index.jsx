import ConfirmModal from '@/Components/ConfirmModal';
import SlidePanel from '@/Components/SlidePanel';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function ContactIndex({ contacts }) {
    const [modal, setModal]         = useState(null);
    const [panelOpen, setPanelOpen] = useState(false);
    const [selected, setSelected]   = useState(null);
    const [search, setSearch]       = useState('');

    const { data, setData, post, processing, errors, recentlySuccessful, reset } = useForm({ reply: '' });

    const openMessage = (contact) => {
        reset('reply');
        setSelected(contact);
        setPanelOpen(true);
    };

    const closePanel = () => { setPanelOpen(false); setSelected(null); };

    const submitReply = (e) => {
        e.preventDefault();
        post(route('dashboard.contact.reply', selected.id), {
            onSuccess: () => reset('reply'),
        });
    };

    const askDelete = (id) => setModal({ id });
    const handleConfirm = () => {
        if (selected?.id === modal.id) closePanel();
        router.delete(route('dashboard.contact.destroy', modal.id));
        setModal(null);
    };

    const filtered = contacts.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.subject?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout header="Contact Messages">
            <Head title="Contact" />

            <ConfirmModal
                open={modal !== null}
                title="Delete message?"
                message="This will permanently delete the message and cannot be recovered."
                onConfirm={handleConfirm}
                onCancel={() => setModal(null)}
            />

            {/* toolbar */}
            <div className="d-flex justify-content-between align-items-center mb-3 gap-2">
                <span className="text-muted small">{contacts.length} messages</span>
                <input
                    className="form-control form-control-sm"
                    style={{ maxWidth: 220 }}
                    placeholder="Search messages…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                {/* ── Table ── */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card border-0 shadow-sm">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>From</th>
                                    <th>Subject</th>
                                    <th>Received</th>
                                    <th>Replied</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 && (
                                    <tr><td colSpan={5} className="text-center text-muted py-4">No messages found.</td></tr>
                                )}
                                {filtered.map(c => (
                                    <tr
                                        key={c.id}
                                        className={selected?.id === c.id ? 'table-active' : ''}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => openMessage(c)}
                                    >
                                        <td className="align-middle">
                                            <div className="fw-semibold">{c.name}</div>
                                            <div className="small text-muted">{c.email}</div>
                                        </td>
                                        <td className="align-middle">{c.subject || '—'}</td>
                                        <td className="align-middle small text-muted">
                                            {new Date(c.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="align-middle">
                                            <span className={`badge ${c.replied_at ? 'bg-success' : 'bg-secondary'}`}>
                                                {c.replied_at ? 'Replied' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="align-middle text-end" onClick={e => e.stopPropagation()}>
                                            <button onClick={() => askDelete(c.id)} className="btn btn-outline-danger btn-sm">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Slide panel ── */}
                <SlidePanel
                    open={panelOpen && selected !== null}
                    title="Message"
                    onClose={closePanel}
                    width={420}
                >
                    {selected && (
                        <div className="d-flex flex-column gap-3">
                            {/* message header */}
                            <div>
                                <div className="fw-semibold">{selected.name}
                                    <span className="text-muted fw-normal small ms-2">({selected.email})</span>
                                </div>
                                {selected.subject && <div className="small text-muted">Subject: {selected.subject}</div>}
                                <div className="small text-muted">{new Date(selected.created_at).toLocaleString()}</div>
                            </div>

                            {/* message body */}
                            <div className="p-3 rounded" style={{ background: '#f7f7f7', whiteSpace: 'pre-wrap', fontSize: 13.5 }}>
                                {selected.message}
                            </div>

                            {/* prior reply */}
                            {selected.reply && (
                                <div className="p-3 rounded border-start border-success border-3" style={{ background: '#f0faf5' }}>
                                    <div className="fw-semibold small text-success mb-1">
                                        Your reply
                                        {selected.replied_at && (
                                            <span className="text-muted fw-normal ms-2">
                                                {new Date(selected.replied_at).toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ whiteSpace: 'pre-wrap', fontSize: 13.5 }}>{selected.reply}</div>
                                </div>
                            )}

                            {/* reply form */}
                            <form onSubmit={submitReply} className="d-flex flex-column gap-2">
                                <label className="form-label fw-semibold small">
                                    {selected.reply ? 'Send another reply' : 'Reply'}
                                </label>
                                {recentlySuccessful && (
                                    <div className="alert alert-success py-2 mb-0">Reply sent!</div>
                                )}
                                <textarea
                                    className={`form-control ${errors.reply ? 'is-invalid' : ''}`}
                                    rows={5}
                                    placeholder="Write your reply…"
                                    value={data.reply}
                                    onChange={e => setData('reply', e.target.value)}
                                />
                                {errors.reply && <div className="invalid-feedback d-block">{errors.reply}</div>}
                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-primary btn-sm" disabled={processing}>
                                        {processing ? 'Sending…' : 'Send Reply'}
                                    </button>
                                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={closePanel}>Close</button>
                                </div>
                            </form>
                        </div>
                    )}
                </SlidePanel>
            </div>
        </DashboardLayout>
    );
}
