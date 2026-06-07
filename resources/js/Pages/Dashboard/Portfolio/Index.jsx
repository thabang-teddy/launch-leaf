import ConfirmModal from '@/Components/ConfirmModal';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function PortfolioIndex({ items }) {
    const [modal, setModal] = useState(null);

    const askDelete = (id) => setModal({ id });
    const handleConfirm = () => {
        router.delete(route('dashboard.portfolio.destroy', modal.id));
        setModal(null);
    };

    return (
        <DashboardLayout header="Portfolio">
            <Head title="Portfolio" />

            <ConfirmModal
                open={modal !== null}
                title="Delete portfolio item?"
                message="This will permanently delete the portfolio item and cannot be recovered."
                onConfirm={handleConfirm}
                onCancel={() => setModal(null)}
            />

            <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted small">{items.length} items</span>
                <Link href={route('dashboard.portfolio.create')} className="btn btn-primary btn-sm">+ New Item</Link>
            </div>

            <div className="card border-0 shadow-sm">
                <table className="table table-hover mb-0">
                    <thead className="table-light">
                        <tr><th>Title</th><th>Tech Stack</th><th>Order</th><th>Active</th><th></th></tr>
                    </thead>
                    <tbody>
                        {items.length === 0 && (
                            <tr><td colSpan={5} className="text-center text-muted py-4">No portfolio items yet.</td></tr>
                        )}
                        {items.map(item => (
                            <tr key={item.id}>
                                <td className="align-middle fw-semibold">{item.title}</td>
                                <td className="align-middle small">{(item.tech_stack ?? []).join(', ') || '—'}</td>
                                <td className="align-middle">{item.order}</td>
                                <td className="align-middle">
                                    <span className={`badge ${item.is_active ? 'bg-success' : 'bg-secondary'}`}>{item.is_active ? 'Yes' : 'No'}</span>
                                </td>
                                <td className="align-middle text-end">
                                    <div className="d-flex gap-1 justify-content-end">
                                        <Link href={route('dashboard.portfolio.edit', item.id)} className="btn btn-outline-primary btn-sm">Edit</Link>
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
