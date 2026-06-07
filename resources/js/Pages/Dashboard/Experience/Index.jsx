import ConfirmModal from '@/Components/ConfirmModal';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function ExperienceIndex({ items }) {
    const [modal, setModal] = useState(null);

    const askDelete = (id) => setModal({ id });
    const handleConfirm = () => {
        router.delete(route('dashboard.experience.destroy', modal.id));
        setModal(null);
    };

    return (
        <DashboardLayout header="Experience">
            <Head title="Experience" />

            <ConfirmModal
                open={modal !== null}
                title="Delete experience entry?"
                message="This will permanently delete the experience entry and cannot be recovered."
                onConfirm={handleConfirm}
                onCancel={() => setModal(null)}
            />

            <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted small">{items.length} entries</span>
                <Link href={route('dashboard.experience.create')} className="btn btn-primary btn-sm">+ New Entry</Link>
            </div>

            <div className="card border-0 shadow-sm">
                <table className="table table-hover mb-0">
                    <thead className="table-light">
                        <tr><th>Title</th><th>Company</th><th>Type</th><th>Period</th><th></th></tr>
                    </thead>
                    <tbody>
                        {items.length === 0 && (
                            <tr><td colSpan={5} className="text-center text-muted py-4">No entries yet.</td></tr>
                        )}
                        {items.map(item => (
                            <tr key={item.id}>
                                <td className="align-middle fw-semibold">{item.title}</td>
                                <td className="align-middle">{item.company}</td>
                                <td className="align-middle">
                                    <span className={`badge ${item.type === 'work' ? 'bg-primary' : 'bg-info'}`}>{item.type}</span>
                                </td>
                                <td className="align-middle small">
                                    {item.start_date} — {item.is_current ? 'Present' : (item.end_date ?? '—')}
                                </td>
                                <td className="align-middle text-end">
                                    <div className="d-flex gap-1 justify-content-end">
                                        <Link href={route('dashboard.experience.edit', item.id)} className="btn btn-outline-primary btn-sm">Edit</Link>
                                        <button onClick={() => askDelete(item.id)} className="btn btn-outline-danger btn-sm">Delete</button>
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
