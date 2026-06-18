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
import { Head, Link, router, useForm } from '@inertiajs/react';
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

const COLOR_OPTIONS = [
    { value: '', label: 'Mint (default)' },
    { value: 'primary', label: 'Blue' },
    { value: 'secondary', label: 'Gray' },
    { value: 'success', label: 'Green' },
    { value: 'danger', label: 'Red' },
    { value: 'warning', label: 'Yellow' },
    { value: 'info', label: 'Cyan' },
    { value: 'dark', label: 'Dark' },
];

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

// ─── Shared Modal Shell ───────────────────────────────────────────────────────
function KanbanModal({ title, onClose, children }) {
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }} />
            <div style={{ position: 'relative', background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '480px', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <h6 style={{ margin: 0, fontWeight: 700, color: C.text, fontSize: '1rem' }}>{title}</h6>
                    <button onClick={onClose} style={{ background: C.bg, border: 'none', color: C.muted, cursor: 'pointer', width: '28px', height: '28px', borderRadius: '6px', fontSize: '0.9rem' }}>✕</button>
                </div>
                {children}
            </div>
        </div>
    );
}

const F = {
    input:  { width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${C.border}`, fontSize: '0.875rem', outline: 'none', color: C.text, boxSizing: 'border-box' },
    label:  { display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.8rem', color: C.text },
    error:  { color: '#EF4444', fontSize: '0.75rem', margin: '3px 0 0' },
    field:  { marginBottom: '1rem' },
    footer: { display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '1.5rem' },
    cancel: { padding: '8px 16px', borderRadius: '8px', border: `1px solid ${C.border}`, background: '#fff', color: C.text, cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem' },
    submit: (processing) => ({ padding: '8px 20px', borderRadius: '8px', border: 'none', background: C.green, color: '#fff', cursor: processing ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.875rem', opacity: processing ? 0.7 : 1 }),
};

// ─── Column Form Modal ────────────────────────────────────────────────────────
function ColumnFormModal({ project, column, onClose }) {
    const isEdit = !!column;
    const { data, setData, post, patch, processing, errors } = useForm({
        kanban_project_id: project.id,
        title: column?.title ?? '',
        color: column?.color ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            patch(route('dashboard.kanban.columns.update', column.id), { preserveScroll: true, onSuccess: onClose });
        } else {
            post(route('dashboard.kanban.columns.store'), { preserveScroll: true, onSuccess: onClose });
        }
    };

    return (
        <KanbanModal title={isEdit ? 'Edit Column' : 'Add Column'} onClose={onClose}>
            <form onSubmit={submit}>
                <div style={F.field}>
                    <label style={F.label}>Title <span style={{ color: '#EF4444' }}>*</span></label>
                    <input type="text" value={data.title} onChange={e => setData('title', e.target.value)}
                        style={F.input} placeholder="Column title" autoFocus />
                    {errors.title && <p style={F.error}>{errors.title}</p>}
                </div>

                <div style={F.field}>
                    <label style={F.label}>Header Color</label>
                    <select value={data.color} onChange={e => setData('color', e.target.value)} style={F.input}>
                        {COLOR_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <div style={F.footer}>
                    <button type="button" onClick={onClose} style={F.cancel}>Cancel</button>
                    <button type="submit" disabled={processing} style={F.submit(processing)}>
                        {processing ? 'Saving…' : isEdit ? 'Update Column' : 'Add Column'}
                    </button>
                </div>
            </form>
        </KanbanModal>
    );
}

// ─── Card Form Modal ──────────────────────────────────────────────────────────
function CardFormModal({ columns, card, defaultColumnId, onClose }) {
    const isEdit = !!card;
    const { data, setData, post, patch, processing, errors } = useForm({
        kanban_column_id: card?.kanban_column_id ?? defaultColumnId ?? (columns[0]?.id ?? ''),
        title:            card?.title ?? '',
        description:      card?.description ?? '',
        due_date:         card?.due_date ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            patch(route('dashboard.kanban.cards.update', card.id), { preserveScroll: true, onSuccess: onClose });
        } else {
            post(route('dashboard.kanban.cards.store'), { preserveScroll: true, onSuccess: onClose });
        }
    };

    return (
        <KanbanModal title={isEdit ? 'Edit Card' : 'Add Card'} onClose={onClose}>
            <form onSubmit={submit}>
                <div style={F.field}>
                    <label style={F.label}>Column</label>
                    <select value={data.kanban_column_id} onChange={e => setData('kanban_column_id', e.target.value)} style={F.input}>
                        {columns.map(col => <option key={col.id} value={col.id}>{col.title}</option>)}
                    </select>
                </div>

                <div style={F.field}>
                    <label style={F.label}>Title <span style={{ color: '#EF4444' }}>*</span></label>
                    <input type="text" value={data.title} onChange={e => setData('title', e.target.value)}
                        style={F.input} placeholder="Card title" autoFocus />
                    {errors.title && <p style={F.error}>{errors.title}</p>}
                </div>

                <div style={F.field}>
                    <label style={F.label}>Description</label>
                    <textarea value={data.description ?? ''} onChange={e => setData('description', e.target.value)}
                        rows={3} style={{ ...F.input, resize: 'vertical' }} placeholder="Optional description" />
                </div>

                <div style={F.field}>
                    <label style={F.label}>Due Date</label>
                    <input type="date" value={data.due_date ?? ''} onChange={e => setData('due_date', e.target.value)} style={F.input} />
                </div>

                <div style={F.footer}>
                    <button type="button" onClick={onClose} style={F.cancel}>Cancel</button>
                    <button type="submit" disabled={processing} style={F.submit(processing)}>
                        {processing ? 'Saving…' : isEdit ? 'Update Card' : 'Add Card'}
                    </button>
                </div>
            </form>
        </KanbanModal>
    );
}

// ─── Board ────────────────────────────────────────────────────────────────────
export default function Board({ project, columns }) {
    const [localColumns, setLocalColumns] = useState(columns);

    // Sync when Inertia delivers fresh props after a delete (or any server-side change).
    const columnsVersion = columns.map(c => `${c.id}:${c.cards.length}`).join('|');
    useEffect(() => {
        setLocalColumns(columns);
    // columnsVersion is the derived stable key — listing `columns` directly would
    // fire on every render because Inertia creates a new array reference each time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [columnsVersion]);

    const [activeId, setActiveId]         = useState(null);
    const [activeData, setActiveData]     = useState(null);
    const [modal, setModal]               = useState(null);         // confirm modal
    const [columnModal, setColumnModal]   = useState(null);         // null | {mode:'create'} | {mode:'edit', column}
    const [cardModal, setCardModal]       = useState(null);         // null | {mode:'create', columnId?} | {mode:'edit', card}

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

        if (activeType === 'card') {
            const activeCardId = active.data.current.card.id;
            const overType     = over.data.current?.type;

            setLocalColumns(prev => {
                if (overType !== 'card') {
                    persistCardOrder(prev);
                    return prev;
                }

                const overCardId = over.data.current.card.id;
                if (activeCardId === overCardId) { persistCardOrder(prev); return prev; }

                const srcColIdx = prev.findIndex(c => c.cards.some(cd => cd.id === activeCardId));
                const dstColIdx = prev.findIndex(c => c.cards.some(cd => cd.id === overCardId));

                if (srcColIdx !== dstColIdx) { persistCardOrder(prev); return prev; }

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

    const columnIds  = localColumns.map(c => `col-${c.id}`);
    const btnOutline = { border: `1px solid ${C.border}`, background: C.card, color: C.text, borderRadius: '8px', padding: '6px 14px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' };
    const btnPrimary = { border: 'none', background: C.green, color: '#fff', borderRadius: '8px', padding: '6px 14px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' };

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

            {columnModal?.mode === 'create' && (
                <ColumnFormModal project={project} onClose={() => setColumnModal(null)} />
            )}
            {columnModal?.mode === 'edit' && (
                <ColumnFormModal project={project} column={columnModal.column} onClose={() => setColumnModal(null)} />
            )}
            {cardModal?.mode === 'create' && (
                <CardFormModal columns={localColumns} defaultColumnId={cardModal.columnId} onClose={() => setCardModal(null)} />
            )}
            {cardModal?.mode === 'edit' && (
                <CardFormModal columns={localColumns} card={cardModal.card} onClose={() => setCardModal(null)} />
            )}

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
                    <button onClick={() => setColumnModal({ mode: 'create' })} style={btnOutline}>+ Column</button>
                    <button onClick={() => setCardModal({ mode: 'create', columnId: localColumns[0]?.id })} style={btnPrimary}>+ Card</button>
                    <Link href={route('dashboard.kanban.projects.edit', project.id)}
                        style={{ ...btnOutline, background: C.bg, color: C.muted, textDecoration: 'none' }}>
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
                                <button
                                    onClick={() => setColumnModal({ mode: 'create' })}
                                    style={{ background: C.greenSoft, color: C.greenText, borderRadius: '8px', padding: '8px 20px', fontWeight: 600, fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}
                                >
                                    + Add Column
                                </button>
                            </div>
                        )}
                        {localColumns.map(col => (
                            <SortableColumn
                                key={col.id}
                                column={col}
                                onAskDeleteColumn={askDeleteColumn}
                                onAskDeleteCard={askDeleteCard}
                                onEditColumn={(c) => setColumnModal({ mode: 'edit', column: c })}
                                onAddCard={(colId) => setCardModal({ mode: 'create', columnId: colId })}
                                onEditCard={(card) => setCardModal({ mode: 'edit', card })}
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
function SortableColumn({ column, onAskDeleteColumn, onAskDeleteCard, onEditColumn, onAddCard, onEditCard }) {
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
                        <button
                            onClick={() => onEditColumn(column)}
                            style={{ width: '22px', height: '22px', borderRadius: '4px', background: 'rgba(255,255,255,0.22)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: headerText, fontSize: '0.65rem' }}
                        >✏</button>
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
                                onEditCard={onEditCard}
                            />
                        ))}
                    </div>
                </SortableContext>

                {/* Add card shortcut */}
                <div style={{ padding: '0 8px 8px' }}>
                    <button
                        onClick={() => onAddCard(column.id)}
                        style={{ display: 'block', width: '100%', textAlign: 'center', padding: '6px', color: C.muted, fontSize: '0.78rem', cursor: 'pointer', borderRadius: '6px', border: `1px dashed ${C.border}`, background: 'none' }}
                    >
                        + Add card
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Sortable Card ────────────────────────────────────────────────────────────
function SortableCard({ card, onAskDelete, onEditCard }) {
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
                    <button
                        onClick={() => onEditCard(card)}
                        style={{ flex: 1, textAlign: 'center', padding: '3px', background: C.greenSoft, color: C.greenText, borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                    >
                        Edit
                    </button>
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
