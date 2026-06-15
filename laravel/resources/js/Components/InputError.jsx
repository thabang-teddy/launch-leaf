export default function InputError({ message, className = '', ...props }) {
    return message ? (
        <p {...props} className={`text-danger small mt-1 mb-0 ${className}`}>
            {message}
        </p>
    ) : null;
}
