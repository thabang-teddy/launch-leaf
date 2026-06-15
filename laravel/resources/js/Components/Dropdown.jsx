import { useState, createContext, useContext } from 'react';
import { Link } from '@inertiajs/react';

const DropDownContext = createContext();

const Dropdown = ({ children }) => {
    const [open, setOpen] = useState(false);
    const toggleOpen = () => setOpen((prev) => !prev);

    return (
        <DropDownContext.Provider value={{ open, setOpen, toggleOpen }}>
            <div className="position-relative">{children}</div>
        </DropDownContext.Provider>
    );
};

const Trigger = ({ children }) => {
    const { toggleOpen } = useContext(DropDownContext);
    return <div onClick={toggleOpen}>{children}</div>;
};

const Content = ({ align = 'right', children }) => {
    const { open, setOpen } = useContext(DropDownContext);

    return (
        <>
            {open && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100"
                    style={{ zIndex: 40 }}
                    onClick={() => setOpen(false)}
                />
            )}
            <ul
                className={`dropdown-menu ${open ? 'show' : ''} ${align === 'right' ? 'dropdown-menu-end' : ''}`}
                style={{ zIndex: 50 }}
            >
                {children}
            </ul>
        </>
    );
};

const DropdownLink = ({ className = '', children, ...props }) => (
    <li>
        <Link {...props} className={`dropdown-item ${className}`}>
            {children}
        </Link>
    </li>
);

Dropdown.Trigger  = Trigger;
Dropdown.Content  = Content;
Dropdown.Link     = DropdownLink;

export default Dropdown;
