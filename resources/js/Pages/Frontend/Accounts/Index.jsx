import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head, Link } from '@inertiajs/react';

export default function AccountsIndex({ accounts }) {
    return (
        <FrontendLayout>
            <Head title="Accounts" />
            <div className="container py-5">
                <h1 className="h2 mb-4">Other Accounts</h1>
                {accounts.length === 0 ? (
                    <p className="text-muted">No accounts yet.</p>
                ) : (
                    <div className="row row-cols-1 row-cols-md-2 g-4">
                        {accounts.map(a => (
                            <div key={a.id} className="col">
                                <div className="card h-100">
                                    <div className="card-body">
                                        <span className="badge bg-secondary mb-2">{a.platform}</span>
                                        <h5 className="card-title">
                                            <Link href={route('accounts.show', a.slug)}>{a.title}</Link>
                                        </h5>
                                        <p className="text-muted small mb-1">@{a.username}</p>
                                        {a.description && <p className="card-text">{a.description}</p>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </FrontendLayout>
    );
}
