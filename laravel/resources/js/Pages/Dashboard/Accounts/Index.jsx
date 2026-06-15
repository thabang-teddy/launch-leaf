import ConfirmModal from '@/Components/ConfirmModal';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function AccountsIndex({ accounts }) {
    const [modal, setModal] = useState(null);

    const askDelete = (id) => setModal({ id });
    const handleConfirm = () => {
        router.delete(route('dashboard.accounts.destroy', modal.id));
        setModal(null);
    };

    const sync = (id) => router.post(route('dashboard.accounts.sync', id));

    return (
        <DashboardLayout header="Other Accounts">
            <Head title="Other Accounts" />

            <ConfirmModal
                open={modal !== null}
                title="Delete account?"
                message="This will permanently delete the account and all its data."
                onConfirm={handleConfirm}
                onCancel={() => setModal(null)}
            />

            <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted small">{accounts.length} accounts</span>
                <Link href={route('dashboard.accounts.create')} className="btn btn-primary btn-sm">
                    + New Account
                </Link>
            </div>

            <div className="card border-0 shadow-sm">
                <table className="table table-hover mb-0">
                    <thead className="table-light">
                        <tr>
                            <th>Title</th>
                            <th>Platform</th>
                            <th>Username</th>
                            <th>Active</th>
                            <th>Synced</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.length === 0 && (
                            <tr><td colSpan={6} className="text-center text-muted py-4">No accounts yet.</td></tr>
                        )}
                        {accounts.map(a => (
                            <tr key={a.id}>
                                <td className="align-middle fw-semibold">{a.title}</td>
                                <td className="align-middle">{a.platform}</td>
                                <td className="align-middle">{a.username}</td>
                                <td className="align-middle">
                                    <span className={`badge ${a.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                        {a.is_active ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td className="align-middle small text-muted">
                                    {a.synced_at ? new Date(a.synced_at).toLocaleDateString() : '—'}
                                </td>
                                <td className="align-middle text-end">
                                    <div className="d-flex gap-1 justify-content-end">
                                        {a.github_url && <button onClick={() => sync(a.id)} className="btn btn-outline-secondary btn-sm">Sync</button>}
                                        <Link href={route('dashboard.accounts.edit', a.id)} className="btn btn-outline-primary btn-sm">Edit</Link>
                                        <button onClick={() => askDelete(a.id)} className="btn btn-outline-danger btn-sm">Delete</button>
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
