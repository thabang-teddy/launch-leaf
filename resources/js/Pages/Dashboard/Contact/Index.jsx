import ConfirmModal from '@/Components/ConfirmModal';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function ContactIndex({ contacts }) {
    const [modal, setModal] = useState(null);

    const askDelete = (id) => setModal({ id });
    const handleConfirm = () => {
        router.delete(route('dashboard.contact.destroy', modal.id));
        setModal(null);
    };

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

            <div className="card border-0 shadow-sm">
                <table className="table table-hover mb-0">
                    <thead className="table-light">
                        <tr><th>From</th><th>Subject</th><th>Received</th><th>Replied</th><th></th></tr>
                    </thead>
                    <tbody>
                        {contacts.length === 0 && <tr><td colSpan={5} className="text-center text-muted py-4">No messages yet.</td></tr>}
                        {contacts.map(c => (
                            <tr key={c.id}>
                                <td className="align-middle">
                                    <div className="fw-semibold">{c.name}</div>
                                    <div className="small text-muted">{c.email}</div>
                                </td>
                                <td className="align-middle">{c.subject || '—'}</td>
                                <td className="align-middle small text-muted">{new Date(c.created_at).toLocaleDateString()}</td>
                                <td className="align-middle">
                                    <span className={`badge ${c.replied_at ? 'bg-success' : 'bg-secondary'}`}>
                                        {c.replied_at ? 'Replied' : 'Pending'}
                                    </span>
                                </td>
                                <td className="align-middle text-end">
                                    <div className="d-flex gap-1 justify-content-end">
                                        <Link href={route('dashboard.contact.show', c.id)} className="btn btn-outline-primary btn-sm">View</Link>
                                        <button onClick={() => askDelete(c.id)} className="btn btn-outline-danger btn-sm">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </DashboardLayout>
    );
}
