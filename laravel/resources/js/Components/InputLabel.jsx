export default function InputLabel({ value, className = '', children, ...props }) {
    return (
        <label {...props} className={`form-label fw-semibold small ${className}`}>
            {value ?? children}
        </label>
    );
}
