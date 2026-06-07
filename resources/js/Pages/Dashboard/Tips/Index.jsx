import ConfirmModal from '@/Components/ConfirmModal';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function TipsIndex({ tips }) {
    const [modal, setModal] = useState(null);

    const askDelete = (id) => setModal({ id });
    const handleConfirm = () => {
        router.delete(route('dashboard.tips.destroy', modal.id));
        setModal(null);
    };

    return (
        <DashboardLayout header="Tips">
            <Head title="Tips" />

            <ConfirmModal
                open={modal !== null}
                title="Delete tip?"
                message="This will permanently delete the tip and cannot be recovered."
                onConfirm={handleConfirm}
                onCancel={() => setModal(null)}
            />

            <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted small">{tips.length} tips</span>
                <Link href={route('dashboard.tips.create')} className="btn btn-primary btn-sm">+ New Tip</Link>
            </div>

            <div className="card border-0 shadow-sm">
                <table className="table table-hover mb-0">
                    <thead className="table-light">
                        <tr><th>Title</th><th>Tags</th><th>Published</th><th></th></tr>
                    </thead>
                    <tbody>
                        {tips.length === 0 && <tr><td colSpan={4} className="text-center text-muted py-4">No tips yet.</td></tr>}
                        {tips.map(tip => (
                            <tr key={tip.id}>
                                <td className="align-middle fw-semibold">{tip.title}</td>
                                <td className="align-middle small">{(tip.tags ?? []).join(', ') || '—'}</td>
                                <td className="align-middle">
                                    <span className={`badge ${tip.is_published ? 'bg-success' : 'bg-secondary'}`}>{tip.is_published ? 'Yes' : 'Draft'}</span>
                                </td>
                                <td className="align-middle text-end">
                                    <div className="d-flex gap-1 justify-content-end">
                                        <Link href={route('dashboard.tips.edit', tip.id)} className="btn btn-outline-primary btn-sm">Edit</Link>
                                        <button onClick={() => askDelete(tip.id)} className="btn btn-outline-danger btn-sm">Delete</button>
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
