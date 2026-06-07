import { Link } from '@inertiajs/react';

export default function FrontendLayout({ children }) {
    return (
        <div className="d-flex flex-column min-vh-100">
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container">
                    <Link className="navbar-brand fw-bold" href="/">
                        LaunchLeaf
                    </Link>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#mainNav"
                        aria-controls="mainNav"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon" />
                    </button>
                    <div className="collapse navbar-collapse" id="mainNav">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <Link className="nav-link" href={route('projects.index')}>Projects</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" href={route('portfolio.index')}>Portfolio</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" href={route('experience.index')}>Experience</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" href={route('tips.index')}>Tips</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" href={route('cv')}>CV</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" href={route('contact')}>Contact</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            <main className="flex-grow-1">
                {children}
            </main>

            <footer className="bg-dark text-secondary py-4 mt-auto">
                <div className="container text-center">
                    <small>&copy; {new Date().getFullYear()} LaunchLeaf</small>
                </div>
            </footer>
        </div>
    );
}
