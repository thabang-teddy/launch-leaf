import ConfirmModal from '@/Components/ConfirmModal';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

const C = {
    green: '#2DC9A2', greenSoft: '#E8F7F2', greenText: '#1A9A7E',
    bg: '#F0F4F3', border: '#E3EDEA', text: '#1B2E2B', muted: '#748D8A', card: '#FFFFFF',
};

export default function KanbanIndex({ boards }) {
    const [modal, setModal] = useState(null);

    const askDelete = (id, name) => setModal({ id, name });

    const handleConfirm = () => {
        router.delete(route('dashboard.kanban.boards.destroy', modal.id));
        setModal(null);
    };

    return (
        <DashboardLayout header="Kanban">
            <Head title="Kanban Boards" />

            <ConfirmModal
                open={modal !== null}
                title="Delete board?"
                message={`"${modal?.name}" and ALL its projects, columns, and cards will be permanently deleted.`}
                confirmLabel="Delete Board"
                onConfirm={handleConfirm}
                onCancel={() => setModal(null)}
            />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                    <h5 style={{ margin: 0, color: C.text, fontWeight: 700 }}>Boards</h5>
                    <p style={{ margin: 0, color: C.muted, fontSize: '0.85rem' }}>
                        {boards.length} board{boards.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <Link
                    href={route('dashboard.kanban.boards.create')}
                    style={{ background: C.green, color: '#fff', borderRadius: '8px', padding: '8px 18px', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                    <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span> New Board
                </Link>
            </div>

            {/* Empty state */}
            {boards.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', background: C.card, borderRadius: '16px', border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                    <h6 style={{ color: C.text, fontWeight: 600, marginBottom: '0.5rem' }}>No boards yet</h6>
                    <p style={{ color: C.muted, fontSize: '0.875rem', marginBottom: '1.5rem' }}>Create a board to group your Kanban projects.</p>
                    <Link href={route('dashboard.kanban.boards.create')} style={{ background: C.green, color: '#fff', borderRadius: '8px', padding: '10px 24px', fontWeight: 600, textDecoration: 'none' }}>
                        Create Board
                    </Link>
                </div>
            )}

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {boards.map(board => (
                    <BoardCard key={board.id} board={board} onDelete={() => askDelete(board.id, board.name)} />
                ))}
            </div>
        </DashboardLayout>
    );
}

function BoardCard({ board, onDelete }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            style={{ background: '#fff', borderRadius: '14px', border: `1px solid ${C.border}`, overflow: 'hidden', transition: 'box-shadow 0.18s ease, transform 0.18s ease', boxShadow: hovered ? '0 8px 28px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.05)', transform: hovered ? 'translateY(-2px)' : 'none' }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div style={{ height: '6px', background: board.color || C.green }} />
            <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h6 style={{ margin: 0, fontWeight: 700, color: C.text, fontSize: '1rem', lineHeight: 1.3 }}>{board.name}</h6>
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0, marginLeft: '8px' }}>
                        <Link href={route('dashboard.kanban.boards.edit', board.id)} title="Edit board" style={{ width: '28px', height: '28px', borderRadius: '6px', background: C.bg, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, textDecoration: 'none', fontSize: '0.8rem' }}>✏</Link>
                        <button onClick={onDelete} title="Delete board" style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#FEF2F2', border: '1px solid #FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
                    </div>
                </div>

                {board.description && (
                    <p style={{ margin: '0 0 1rem', color: C.muted, fontSize: '0.825rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {board.description}
                    </p>
                )}
                {!board.description && <div style={{ marginBottom: '1rem' }} />}

                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <Pill value={board.projects_count} label="projects" color={C.greenText} bg={C.greenSoft} />
                </div>

                <Link href={route('dashboard.kanban.boards.show', board.id)} style={{ display: 'block', textAlign: 'center', background: C.greenSoft, color: C.greenText, borderRadius: '8px', padding: '8px', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}>
                    Open Board →
                </Link>
            </div>
        </div>
    );
}

function Pill({ value, label, color, bg }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: bg, borderRadius: '6px', padding: '4px 10px' }}>
            <span style={{ fontWeight: 700, color, fontSize: '0.9rem' }}>{value}</span>
            <span style={{ color, fontSize: '0.75rem', opacity: 0.8 }}>{label}</span>
        </div>
    );
}
