import ConfirmModal from '@/Components/ConfirmModal';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    closestCorners,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    horizontalListSortingStrategy,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
    green: '#2DC9A2', greenSoft: '#E8F7F2', greenText: '#1A9A7E',
    bg: '#F0F4F3', border: '#E3EDEA', text: '#1B2E2B', muted: '#748D8A', card: '#FFFFFF',
};

const COLUMN_COLORS = {
    primary: '#0d6efd', secondary: '#6c757d', success: '#198754',
    danger: '#dc3545', warning: '#ffc107', info: '#0dcaf0', dark: '#212529',
};

// ─── Persist helpers (fire-and-forget via axios) ──────────────────────────────
function persistColumnOrder(cols) {
    axios
        .post(route('dashboard.kanban.columns.reorder'), {
            items: cols.map((col, idx) => ({ id: col.id, order: idx })),
        })
        .catch(() => {});
}

function persistCardOrder(cols) {
    const items = [];
    cols.forEach(col =>
        col.cards.forEach((card, idx) =>
            items.push({ id: card.id, kanban_column_id: col.id, order: idx }),
        ),
    );
    axios.post(route('dashboard.kanban.cards.reorder'), { items }).catch(() => {});
}

// ─── Board ────────────────────────────────────────────────────────────────────
export default function Board({ project, columns }) {
    const [localColumns, setLocalColumns] = useState(columns);

    // Sync when Inertia delivers fresh props after a delete (or any server-side change).
    // The version key is stable during DnD (IDs and card counts don't change via axios)
    // but changes whenever a column or card is added/removed via Inertia navigation.
    const columnsVersion = columns.map(c => `${c.id}:${c.cards.length}`).join('|');
    useEffect(() => {
        setLocalColumns(columns);
    // columnsVersion is the derived stable key — listing `columns` directly would
    // fire on every render because Inertia creates a new array reference each time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [columnsVersion]);
    const [activeId, setActiveId]         = useState(null);
    const [activeData, setActiveData]     = useState(null);
    const [modal, setModal]               = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    // ── Confirm modal ──
    const askDeleteColumn = (id) => setModal({
        routeName: 'dashboard.kanban.columns.destroy', id,
        title: 'Delete column?', message: 'All its cards will also be permanently deleted.', label: 'Delete Column',
    });
    const askDeleteCard = (id) => setModal({
        routeName: 'dashboard.kanban.cards.destroy', id,
        title: 'Delete card?', message: 'This card will be permanently deleted.', label: 'Delete Card',
    });
    const handleConfirm = () => {
        router.delete(route(modal.routeName, modal.id));
        setModal(null);
    };

    // ── Drag handlers ──
    function handleDragStart({ active }) {
        setActiveId(active.id);
        setActiveData(active.data.current);
    }

    // Cross-column card moves happen here (optimistic UI)
    function handleDragOver({ active, over }) {
        if (!over) return;
        if (active.data.current?.type !== 'card') return;

        const activeCardId = active.data.current.card.id;
        const overType     = over.data.current?.type;

        setLocalColumns(prev => {
            const srcIdx = prev.findIndex(c => c.cards.some(cd => cd.id === activeCardId));
            if (srcIdx === -1) return prev;

            let dstIdx;
            if (overType === 'column') {
                dstIdx = prev.findIndex(c => c.id === over.data.current.column.id);
            } else if (overType === 'card') {
                dstIdx = prev.findIndex(c => c.cards.some(cd => cd.id === over.data.current.card.id));
            }
            if (dstIdx == null || dstIdx === -1 || srcIdx === dstIdx) return prev;

            const newCols  = prev.map(c => ({ ...c, cards: [...c.cards] }));
            const cardPos  = newCols[srcIdx].cards.findIndex(cd => cd.id === activeCardId);
            const [moved]  = newCols[srcIdx].cards.splice(cardPos, 1);
            moved.kanban_column_id = newCols[dstIdx].id;

            if (overType === 'card') {
                const overPos = newCols[dstIdx].cards.findIndex(cd => cd.id === over.data.current.card.id);
                newCols[dstIdx].cards.splice(overPos >= 0 ? overPos : newCols[dstIdx].cards.length, 0, moved);
            } else {
                newCols[dstIdx].cards.push(moved);
            }
            return newCols;
        });
    }

    function handleDragEnd({ active, over }) {
        setActiveId(null);
        setActiveData(null);
        if (!over) return;

        const activeType = active.data.current?.type;

        // ── Column reorder ──
        if (activeType === 'column') {
            setLocalColumns(prev => {
                const oldIdx = prev.findIndex(c => `col-${c.id}` === active.id);
                const newIdx = prev.findIndex(c => `col-${c.id}` === over.id);
                if (oldIdx === newIdx || newIdx === -1) return prev;
                const reordered = arrayMove(prev, oldIdx, newIdx);
                persistColumnOrder(reordered);
                return reordered;
            });
            return;
        }

        // ── Card reorder / settle ──
        if (activeType === 'card') {
            const activeCardId = active.data.current.card.id;
            const overType     = over.data.current?.type;

            setLocalColumns(prev => {
                // Dropped on a column: cross-column already done in onDragOver — just persist
                if (overType !== 'card') {
                    persistCardOrder(prev);
                    return prev;
                }

                const overCardId = over.data.current.card.id;
                if (activeCardId === overCardId) { persistCardOrder(prev); return prev; }

                const srcColIdx = prev.findIndex(c => c.cards.some(cd => cd.id === activeCardId));
                const dstColIdx = prev.findIndex(c => c.cards.some(cd => cd.id === overCardId));

                // Cross-column: onDragOver already moved it — just persist
                if (srcColIdx !== dstColIdx) { persistCardOrder(prev); return prev; }

                // Same-column reorder
                const newCols = prev.map(c => ({ ...c, cards: [...c.cards] }));
                const col     = newCols[srcColIdx];
                const from    = col.cards.findIndex(cd => cd.id === activeCardId);
                const to      = col.cards.findIndex(cd => cd.id === overCardId);
                col.cards     = arrayMove(col.cards, from, to);
                persistCardOrder(newCols);
                return newCols;
            });
        }
    }

    const columnIds = localColumns.map(c => `col-${c.id}`);

    return (
        <DashboardLayout header={project.name}>
            <Head title={`${project.name} — Kanban`} />

            <ConfirmModal
                open={modal !== null}
                title={modal?.title}
                message={modal?.message}
                confirmLabel={modal?.label}
                onConfirm={handleConfirm}
                onCancel={() => setModal(null)}
            />

            {/* Breadcrumb + actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link href={route('dashboard.kanban.index')} style={{ color: C.muted, fontSize: '0.85rem', textDecoration: 'none' }}>
                        ← All Projects
                    </Link>
                    <span style={{ color: C.border }}>|</span>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: project.color || C.green, flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, color: C.text, fontSize: '0.95rem' }}>{project.name}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Link href={route('dashboard.kanban.columns.create', { project_id: project.id })}
                        style={{ background: C.card, color: C.text, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '6px 14px', fontWeight: 600, fontSize: '0.8rem', textDecoration: 'none' }}>
                        + Column
                    </Link>
                    <Link href={route('dashboard.kanban.cards.create', { project_id: project.id })}
                        style={{ background: C.green, color: '#fff', borderRadius: '8px', padding: '6px 14px', fontWeight: 600, fontSize: '0.8rem', textDecoration: 'none' }}>
                        + Card
                    </Link>
                    <Link href={route('dashboard.kanban.projects.edit', project.id)}
                        style={{ background: C.bg, color: C.muted, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '6px 12px', fontSize: '0.8rem', textDecoration: 'none' }}>
                        ✏ Edit
                    </Link>
                </div>
            </div>

            {/* DnD Board */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
                    <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1.5rem', alignItems: 'flex-start', minHeight: '200px' }}>
                        {localColumns.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '3rem 2rem', width: '100%', background: C.card, borderRadius: '14px', border: `1px dashed ${C.border}` }}>
                                <p style={{ color: C.muted, marginBottom: '1rem' }}>No columns yet. Add one to get started.</p>
                                <Link href={route('dashboard.kanban.columns.create', { project_id: project.id })}
                                    style={{ background: C.greenSoft, color: C.greenText, borderRadius: '8px', padding: '8px 20px', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
                                    + Add Column
                                </Link>
                            </div>
                        )}
                        {localColumns.map(col => (
                            <SortableColumn
                                key={col.id}
                                column={col}
                                project={project}
                                onAskDeleteColumn={askDeleteColumn}
                                onAskDeleteCard={askDeleteCard}
                            />
                        ))}
                    </div>
                </SortableContext>

                <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
                    {activeId && activeData?.type === 'column' && <ColumnOverlay column={activeData.column} />}
                    {activeId && activeData?.type === 'card'   && <CardOverlay   card={activeData.card}     />}
                </DragOverlay>
            </DndContext>
        </DashboardLayout>
    );
}

// ─── Sortable Column ──────────────────────────────────────────────────────────
function SortableColumn({ column, project, onAskDeleteColumn, onAskDeleteCard }) {
    const {
        attributes, listeners, setNodeRef,
        transform, transition, isDragging,
    } = useSortable({
        id: `col-${column.id}`,
        data: { type: 'column', column },
    });

    const headerBg   = column.color ? (COLUMN_COLORS[column.color] || column.color) : C.greenSoft;
    const headerText = column.color ? '#fff' : C.greenText;

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                opacity: isDragging ? 0.35 : 1,
                minWidth: '270px',
                maxWidth: '300px',
                flexShrink: 0,
            }}
        >
            <div style={{ background: '#fff', borderRadius: '12px', border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>

                {/* Header with drag handle */}
                <div style={{ background: headerBg, padding: '10px 10px 10px 6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                        {...attributes} {...listeners}
                        title="Drag to reorder column"
                        style={{ background: 'none', border: 'none', padding: '2px 5px', cursor: 'grab', color: headerText, opacity: 0.65, fontSize: '1rem', lineHeight: 1, touchAction: 'none', flexShrink: 0 }}
                    >
                        ⠿
                    </button>
                    <span style={{ flex: 1, fontWeight: 600, color: headerText, fontSize: '0.875rem' }}>
                        {column.title}
                        <span style={{ marginLeft: '6px', fontSize: '0.7rem', opacity: 0.75, background: 'rgba(255,255,255,0.22)', borderRadius: '10px', padding: '1px 6px' }}>
                            {column.cards.length}
                        </span>
                    </span>
                    <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
                        <Link
                            href={route('dashboard.kanban.columns.edit', column.id)}
                            style={{ width: '22px', height: '22px', borderRadius: '4px', background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: headerText, textDecoration: 'none', fontSize: '0.65rem' }}
                        >✏</Link>
                        <button
                            onClick={() => onAskDeleteColumn(column.id)}
                            style={{ width: '22px', height: '22px', borderRadius: '4px', background: 'rgba(255,255,255,0.22)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: headerText, fontSize: '0.65rem' }}
                        >✕</button>
                    </div>
                </div>

                {/* Cards (vertical sortable context) */}
                <SortableContext
                    items={column.cards.map(c => `card-${c.id}`)}
                    strategy={verticalListSortingStrategy}
                >
                    <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px', minHeight: '64px' }}>
                        {column.cards.length === 0 && (
                            <div style={{ border: `1.5px dashed ${C.border}`, borderRadius: '8px', padding: '14px 8px', textAlign: 'center', color: C.muted, fontSize: '0.78rem' }}>
                                Drop cards here
                            </div>
                        )}
                        {column.cards.map(card => (
                            <SortableCard
                                key={card.id}
                                card={card}
                                onAskDelete={onAskDeleteCard}
                            />
                        ))}
                    </div>
                </SortableContext>

                {/* Add card shortcut */}
                <div style={{ padding: '0 8px 8px' }}>
                    <Link
                        href={route('dashboard.kanban.cards.create', { project_id: project.id })}
                        style={{ display: 'block', textAlign: 'center', padding: '6px', color: C.muted, fontSize: '0.78rem', textDecoration: 'none', borderRadius: '6px', border: `1px dashed ${C.border}` }}
                    >
                        + Add card
                    </Link>
                </div>
            </div>
        </div>
    );
}

// ─── Sortable Card ────────────────────────────────────────────────────────────
function SortableCard({ card, onAskDelete }) {
    const {
        attributes, listeners, setNodeRef,
        transform, transition, isDragging,
    } = useSortable({
        id: `card-${card.id}`,
        data: { type: 'card', card },
    });

    const isOverdue = card.due_date && new Date(card.due_date) < new Date();

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                opacity: isDragging ? 0.3 : 1,
                background: '#fff',
                border: `1px solid ${C.border}`,
                borderRadius: '8px',
                padding: '8px 10px',
                display: 'flex',
                gap: '7px',
                alignItems: 'flex-start',
            }}
        >
            {/* Drag handle */}
            <button
                {...attributes} {...listeners}
                title="Drag to move card"
                style={{ background: 'none', border: 'none', padding: '1px 3px', cursor: 'grab', color: C.muted, fontSize: '0.9rem', lineHeight: 1, flexShrink: 0, touchAction: 'none', marginTop: '2px', opacity: 0.5 }}
            >
                ⠿
            </button>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 3px', fontWeight: 600, color: C.text, fontSize: '0.82rem', lineHeight: 1.4 }}>
                    {card.title}
                </p>
                {card.description && (
                    <p style={{ margin: '0 0 5px', color: C.muted, fontSize: '0.75rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {card.description}
                    </p>
                )}
                {card.due_date && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: isOverdue ? '#FEF2F2' : C.bg, color: isOverdue ? '#EF4444' : C.muted, borderRadius: '4px', padding: '1px 6px', fontSize: '0.7rem', marginBottom: '5px' }}>
                        📅 {card.due_date}
                    </span>
                )}
                <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                    <Link
                        href={route('dashboard.kanban.cards.edit', card.id)}
                        style={{ flex: 1, textAlign: 'center', padding: '3px', background: C.greenSoft, color: C.greenText, borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, textDecoration: 'none' }}
                    >
                        Edit
                    </Link>
                    <button
                        onClick={() => onAskDelete(card.id)}
                        style={{ padding: '3px 8px', background: '#FEF2F2', border: 'none', borderRadius: '4px', color: '#EF4444', cursor: 'pointer', fontSize: '0.7rem' }}
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Drag Overlay Previews ────────────────────────────────────────────────────
function ColumnOverlay({ column }) {
    const headerBg   = column.color ? (COLUMN_COLORS[column.color] || column.color) : C.greenSoft;
    const headerText = column.color ? '#fff' : C.greenText;
    return (
        <div style={{ minWidth: '270px', maxWidth: '300px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.2)', transform: 'rotate(2deg)', pointerEvents: 'none' }}>
            <div style={{ background: headerBg, padding: '10px 12px' }}>
                <span style={{ fontWeight: 600, color: headerText, fontSize: '0.875rem' }}>
                    {column.title}
                    <span style={{ marginLeft: '6px', fontSize: '0.7rem', opacity: 0.75 }}>
                        ({column.cards.length} cards)
                    </span>
                </span>
            </div>
            <div style={{ background: '#fff', height: '72px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: C.muted, fontSize: '0.78rem' }}>Moving column…</span>
            </div>
        </div>
    );
}

function CardOverlay({ card }) {
    return (
        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px 12px', boxShadow: '0 10px 32px rgba(0,0,0,0.18)', minWidth: '240px', transform: 'rotate(1.5deg)', pointerEvents: 'none' }}>
            <p style={{ margin: 0, fontWeight: 600, color: C.text, fontSize: '0.85rem' }}>{card.title}</p>
            {card.description && (
                <p style={{ margin: '3px 0 0', color: C.muted, fontSize: '0.78rem', lineHeight: 1.4 }}>
                    {card.description.length > 70 ? card.description.slice(0, 70) + '…' : card.description}
                </p>
            )}
        </div>
    );
}
