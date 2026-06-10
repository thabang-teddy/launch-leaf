import ConfirmModal from '@/Components/ConfirmModal';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function SkillsIndex({ items }) {
    const [modal, setModal] = useState(null);

    const askDelete = (id) => setModal({ id });
    const handleConfirm = () => {
        router.delete(route('dashboard.skills.destroy', modal.id));
        setModal(null);
    };

    return (
        <DashboardLayout header="Skills">
            <Head title="Skills" />

            <ConfirmModal
                open={modal !== null}
                title="Delete skill?"
                message="This will permanently delete this skill and cannot be recovered."
                onConfirm={handleConfirm}
                onCancel={() => setModal(null)}
            />

            <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted small">{items.length} skills</span>
                <Link href={route('dashboard.skills.create')} className="btn btn-primary btn-sm">+ New Skill</Link>
            </div>

            <div className="card border-0 shadow-sm">
                <table className="table table-hover mb-0">
                    <thead className="table-light">
                        <tr><th>Icon</th><th>Name</th><th>Description</th><th>Order</th><th></th></tr>
                    </thead>
                    <tbody>
                        {items.length === 0 && (
                            <tr><td colSpan={5} className="text-center text-muted py-4">No skills yet.</td></tr>
                        )}
                        {items.map(item => (
                            <tr key={item.id}>
                                <td className="align-middle" style={{ width: 56 }}>
                                    {item.icon
                                        ? <i className={`${item.icon}`} style={{ fontSize: '1.6rem' }} />
                                        : <span className="text-muted">—</span>}
                                </td>
                                <td className="align-middle fw-semibold">{item.name}</td>
                                <td className="align-middle text-muted small" style={{ maxWidth: 340, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {item.description ?? '—'}
                                </td>
                                <td className="align-middle">{item.order}</td>
                                <td className="align-middle text-end">
                                    <div className="d-flex gap-1 justify-content-end">
                                        <Link href={route('dashboard.skills.edit', item.id)} className="btn btn-outline-primary btn-sm">Edit</Link>
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
