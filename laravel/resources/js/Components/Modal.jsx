/**
 * Bootstrap-native modal — no @headlessui/react required.
 * Uses Bootstrap's modal classes and a backdrop overlay.
 */
export default function Modal({
    children,
    show = false,
    maxWidth = '2xl',
    closeable = true,
    onClose = () => {},
}) {
    const close = () => { if (closeable) onClose(); };

    const sizeClass = { sm: 'modal-sm', md: '', lg: 'modal-lg', xl: 'modal-xl', '2xl': 'modal-xl' }[maxWidth] ?? '';

    if (!show) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="modal-backdrop show" style={{ zIndex: 1040 }} onClick={close} />

            {/* Dialog */}
            <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
                <div
                    className={`modal-dialog modal-dialog-centered modal-dialog-scrollable ${sizeClass}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-content">
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
}
