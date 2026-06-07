import ConfirmModal from '@/Components/ConfirmModal';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function NotesIndex({ notes }) {
    const [modal, setModal] = useState(null);

    const askDelete = (id) => setModal({ id });
    const handleConfirm = () => {
        router.delete(route('dashboard.notes.destroy', modal.id));
        setModal(null);
    };

    return (
        <DashboardLayout header="Notes">
            <Head title="Notes" />

            <ConfirmModal
                open={modal !== null}
                title="Delete note?"
                message="This will permanently delete the note and cannot be recovered."
                onConfirm={handleConfirm}
                onCancel={() => setModal(null)}
            />

            <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted small">{notes.length} notes</span>
                <Link href={route('dashboard.notes.create')} className="btn btn-primary btn-sm">+ New Note</Link>
            </div>

            <div className="row g-3">
                {notes.length === 0 && <div className="col-12 text-center text-muted py-4">No notes yet.</div>}
                {notes.map(note => (
                    <div key={note.id} className="col-md-6 col-lg-4">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <h6 className="fw-semibold mb-2">{note.title}</h6>
                                <p className="text-muted small mb-0" style={{ whiteSpace: 'pre-wrap', maxHeight: '80px', overflow: 'hidden' }}>
                                    {note.content || 'No content.'}
                                </p>
                            </div>
                            <div className="card-footer bg-transparent d-flex gap-2">
                                <Link href={route('dashboard.notes.edit', note.id)} className="btn btn-outline-primary btn-sm">Edit</Link>
                                <button onClick={() => askDelete(note.id)} className="btn btn-outline-danger btn-sm">Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
}
