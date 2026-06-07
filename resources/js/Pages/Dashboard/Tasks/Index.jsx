import ConfirmModal from '@/Components/ConfirmModal';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function TasksIndex({ tasks }) {
    const [modal, setModal] = useState(null);

    const askDelete = (id) => setModal({ id });
    const handleConfirm = () => {
        router.delete(route('dashboard.tasks.destroy', modal.id));
        setModal(null);
    };

    const toggle = (task) => {
        router.put(route('dashboard.tasks.update', task.id), {
            title:        task.title,
            description:  task.description,
            due_date:     task.due_date,
            is_completed: !task.is_completed,
            order:        task.order,
        }, { preserveScroll: true });
    };

    const pending = tasks.filter(t => !t.is_completed);
    const done    = tasks.filter(t =>  t.is_completed);

    return (
        <DashboardLayout header="Tasks">
            <Head title="Tasks" />

            <ConfirmModal
                open={modal !== null}
                title="Delete task?"
                message="This will permanently delete the task and cannot be recovered."
                onConfirm={handleConfirm}
                onCancel={() => setModal(null)}
            />

            <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted small">{pending.length} pending · {done.length} done</span>
                <Link href={route('dashboard.tasks.create')} className="btn btn-primary btn-sm">+ New Task</Link>
            </div>

            <div className="d-flex flex-column gap-2">
                {tasks.length === 0 && <p className="text-muted text-center py-4">No tasks yet.</p>}
                {tasks.map(task => (
                    <div key={task.id} className={`card border-0 shadow-sm ${task.is_completed ? 'opacity-50' : ''}`}>
                        <div className="card-body d-flex align-items-start gap-3 py-2">
                            <input
                                type="checkbox"
                                className="form-check-input mt-1 flex-shrink-0"
                                checked={task.is_completed}
                                onChange={() => toggle(task)}
                                style={{ cursor: 'pointer', width: '1.1rem', height: '1.1rem' }}
                            />
                            <div className="flex-grow-1">
                                <p className={`mb-0 fw-semibold ${task.is_completed ? 'text-decoration-line-through' : ''}`}>{task.title}</p>
                                {task.description && <p className="mb-0 small text-muted">{task.description}</p>}
                                {task.due_date && <p className="mb-0 small text-muted">Due: {task.due_date}</p>}
                            </div>
                            <div className="d-flex gap-1 flex-shrink-0">
                                <Link href={route('dashboard.tasks.edit', task.id)} className="btn btn-outline-primary btn-sm">Edit</Link>
                                <button onClick={() => askDelete(task.id)} className="btn btn-outline-danger btn-sm">Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
}
