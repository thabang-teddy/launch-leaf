import { useEffect, useState } from 'react';

export default function SlidePanel({ open, title, onClose, children, width = 400 }) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    if (!open) return null;

    if (isMobile) {
        return (
            <>
                <style>{`
                    @keyframes slideInFromBottom {
                        from { opacity: 0; transform: translateY(40px); }
                        to   { opacity: 1; transform: translateY(0); }
                    }
                    .slide-panel-mobile { animation: slideInFromBottom 0.25s ease; }
                    .slide-panel-header {
                        position: sticky; top: 0; z-index: 10;
                        background: #fff; border-bottom: 1px solid #ebebeb;
                        padding: 12px 16px;
                        display: flex; align-items: center; justify-content: space-between;
                    }
                `}</style>
                {/* Backdrop */}
                <div
                    onClick={onClose}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 1040,
                        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)',
                    }}
                />
                {/* Bottom drawer */}
                <div
                    className="slide-panel-mobile card border-0 shadow"
                    style={{
                        position: 'fixed', bottom: 0, left: 0, right: 0,
                        zIndex: 1045, maxHeight: '82vh', overflowY: 'auto',
                        borderRadius: '16px 16px 0 0',
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
