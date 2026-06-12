export default function SlidePanel({ open, title, onClose, children, width = 400 }) {
    if (!open) return null;
    return (
        <>
            <style>{`
                @keyframes slideInFromRight {
                    from { opacity: 0; transform: translateX(18px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                .slide-panel-root { animation: slideInFromRight 0.22s ease; }
                .slide-panel-header {
                    position: sticky; top: 0; z-index: 10;
                    background: #fff; border-bottom: 1px solid #ebebeb;
                    padding: 12px 16px;
                    display: flex; align-items: center; justify-content: space-between;
                }
            `}</style>
            <div
                className="slide-panel-root card border-0 shadow"
                style={{
                    width,
                    flexShrink: 0,
                    position: 'sticky',
                    top: 0,
                    maxHeight: 'calc(100vh - 106px)',
                    overflowY: 'auto',
                    alignSelf: 'flex-start',
                }}
            >
                <div className="slide-panel-header">
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{title}</span>
                    <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
                </div>
                <div style={{ padding: '16px' }}>
                    {children}
                </div>
            </div>
        </>
    );
}
