import ConfirmModal from '@/Components/ConfirmModal';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function ProjectsIndex({ projects }) {
    const [modal, setModal] = useState(null);

    const askDelete = (id) => setModal({ id });
    const handleConfirm = () => {
        router.delete(route('dashboard.projects.destroy', modal.id));
        setModal(null);
    };

    const sync = (id) => router.post(route('dashboard.projects.sync', id));

    return (
        <DashboardLayout header="GitHub Projects">
            <Head title="GitHub Projects" />

            <ConfirmModal
                open={modal !== null}
                title="Delete project?"
                message="This will permanently delete the project and all its data."
                onConfirm={handleConfirm}
                onCancel={() => setModal(null)}
            />

            <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted small">{projects.length} projects</span>
                <Link href={route('dashboard.projects.create')} className="btn btn-primary btn-sm">
                    + New Project
                </Link>
            </div>

            <div className="card border-0 shadow-sm">
                <table className="table table-hover mb-0">
                    <thead className="table-light">
                        <tr>
                            <th>Title</th>
                            <th>GitHub URL</th>
                            <th>Order</th>
                            <th>Active</th>
                            <th>Synced</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.length === 0 && (
                            <tr><td colSpan={6} className="text-center text-muted py-4">No projects yet.</td></tr>
                        )}
                        {projects.map(p => (
                            <tr key={p.id}>
                                <td className="align-middle fw-semibold">{p.title}</td>
                                <td className="align-middle">
                                    <a href={p.github_url} target="_blank" rel="noreferrer" className="text-decoration-none small">
                                        {p.github_url}
                                    </a>
                                </td>
                                <td className="align-middle">{p.order}</td>
                                <td className="align-middle">
                                    <span className={`badge ${p.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                        {p.is_active ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td className="align-middle small text-muted">
                                    {p.synced_at ? new Date(p.synced_at).toLocaleDateString() : '—'}
                                </td>
                                <td className="align-middle text-end">
                                    <div className="d-flex gap-1 justify-content-end">
                                        <button onClick={() => sync(p.id)} className="btn btn-outline-secondary btn-sm">Sync</button>
                                        <Link href={route('dashboard.projects.edit', p.id)} className="btn btn-outline-primary btn-sm">Edit</Link>
                                        <button onClick={() => askDelete(p.id)} className="btn btn-outline-danger btn-sm">Delete</button>
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
