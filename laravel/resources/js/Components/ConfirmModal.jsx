import { useEffect, useState } from 'react';

/**
 * Reusable confirmation modal.
 *
 * Props:
 *   open        – boolean: show/hide the modal
 *   title       – string: modal heading  (default "Are you sure?")
 *   message     – string: body text       (default "This action cannot be undone.")
 *   confirmLabel– string: confirm button text (default "Delete")
 *   onConfirm   – () => void
 *   onCancel    – () => void
 */
export default function ConfirmModal({
    open,
    title    = 'Are you sure?',
    message  = 'This action cannot be undone.',
    confirmLabel = 'Delete',
    onConfirm,
    onCancel,
}) {
    // Animate in/out
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (open) {
            // tiny delay so the CSS transition fires
            const t = setTimeout(() => setVisible(true), 10);
            return () => clearTimeout(t);
        } else {
            setVisible(false);
        }
    }, [open]);

    // Close on ESC
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onCancel?.(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onCancel]);

    if (!open) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onCancel}
                style={{
                    position: 'fixed', inset: 0, zIndex: 1040,
                    background: 'rgba(15, 25, 22, 0.45)',
                    backdropFilter: 'blur(3px)',
                    opacity: visible ? 1 : 0,
                    transition: 'opacity 180ms ease',
                }}
            />

            {/* Dialog wrapper */}
            <div
                role="dialog"
                aria-modal="true"
                style={{
                    position: 'fixed', inset: 0, zIndex: 1050,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 16, pointerEvents: 'none',
                }}
            >
                {/* Card */}
                <div
                    style={{
                        background: '#FFFFFF', borderRadius: 16,
                        padding: '28px 28px 24px',
                        width: '100%', maxWidth: 400,
                        boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10)',
                        pointerEvents: 'auto',
                        transform: visible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.97)',
                        opacity: visible ? 1 : 0,
                        transition: 'transform 200ms cubic-bezier(0.34,1.56,0.64,1), opacity 180ms ease',
                    }}
                >
                    {/* Trash icon */}
                    <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: '#FEF2F2', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        marginBottom: 18,
                    }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                             stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6"/>
                            <path d="M14 11v6"/>
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                    </div>

                    {/* Text */}
                    <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: '#1B2E2B', lineHeight: 1.3 }}>
                        {title}
                    </h3>
                    <p style={{ margin: '0 0 24px', fontSize: 13.5, color: '#748D8A', lineHeight: 1.6 }}>
                        {message}
                    </p>

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <CancelBtn onClick={onCancel} />
                        <ConfirmBtn onClick={onConfirm} label={confirmLabel} />
                    </div>
                </div>
            </div>
        </>
    );
}

function CancelBtn({ onClick }) {
    const [hov, setHov] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                padding: '8px 20px', borderRadius: 9, fontSize: 13.5, fontWeight: 600,
                cursor: 'pointer', border: '1px solid #E3EDEA',
                background: hov ? '#F0F4F3' : '#FAFCFB',
                color: '#1B2E2B', transition: 'all 140ms ease',
            }}
        >
            Cancel
        </button>
    );
}

function ConfirmBtn({ onClick, label }) {
    const [hov, setHov] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                padding: '8px 20px', borderRadius: 9, fontSize: 13.5, fontWeight: 600,
                cursor: 'pointer', border: 'none',
                background: hov ? '#DC2626' : '#EF4444',
                color: 'white', transition: 'background 140ms ease',
            }}
        >
            {label}
        </button>
    );
}
