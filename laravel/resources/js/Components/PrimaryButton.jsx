export default function PrimaryButton({ className = '', disabled, children, ...props }) {
    return (
        <button
            {...props}
            className={`btn-accent ${disabled ? 'opacity-50' : ''} ${className}`}
            style={{ opacity: disabled ? 0.55 : undefined, cursor: disabled ? 'not-allowed' : undefined }}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
