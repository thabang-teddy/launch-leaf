import ConfirmModal from '@/Components/ConfirmModal';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function PagesIndex({ pages }) {
    const [modal, setModal] = useState(null);

    const askDelete = (id) => setModal({ id });
    const handleConfirm = () => {
        router.delete(route('dashboard.pages.destroy', modal.id));
        setModal(null);
    };

    return (
        <DashboardLayout header="Pages">
            <Head title="Pages" />

            <ConfirmModal
                open={modal !== null}
                title="Delete page?"
                message="This will permanently delete the page and cannot be recovered."
                onConfirm={handleConfirm}
                onCancel={() => setModal(null)}
            />

            <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted small">{pages.length} pages</span>
                <Link href={route('dashboard.pages.create')} className="btn btn-primary btn-sm">+ New Page</Link>
            </div>

            <div className="card border-0 shadow-sm">
                <table className="table table-hover mb-0">
                    <thead className="table-light">
                        <tr><th>Title</th><th>Slug</th><th>Published</th><th></th></tr>
                    </thead>
                    <tbody>
                        {pages.length === 0 && <tr><td colSpan={4} className="text-center text-muted py-4">No pages yet.</td></tr>}
                        {pages.map(page => (
                            <tr key={page.id}>
                                <td className="align-middle fw-semibold">{page.title}</td>
                                <td className="align-middle small text-muted">{page.slug}</td>
                                <td className="align-middle">
                                    <span className={`badge ${page.is_published ? 'bg-success' : 'bg-secondary'}`}>{page.is_published ? 'Yes' : 'Draft'}</span>
                                </td>
                                <td className="align-middle text-end">
                                    <div className="d-flex gap-1 justify-content-end">
                                        <Link href={route('dashboard.pages.edit', page.id)} className="btn btn-outline-primary btn-sm">Edit</Link>
                                        <button onClick={() => askDelete(page.id)} className="btn btn-outline-danger btn-sm">Delete</button>
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
