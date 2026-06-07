import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head, Link } from '@inertiajs/react';

export default function AccountShow({ account }) {
    return (
        <FrontendLayout>
            <Head title={account.title} />
            <div className="container py-5">
                <Link href={route('accounts.index')} className="text-muted small">&larr; Accounts</Link>
                <div className="mt-2 mb-1">
                    <span className="badge bg-secondary me-2">{account.platform}</span>
                    <span className="text-muted small">@{account.username}</span>
                </div>
                <h1 className="h2 mb-1">{account.title}</h1>
                {account.github_url && (
                    <a href={account.github_url} target="_blank" rel="noreferrer" className="text-muted small">
                        {account.github_url}
                    </a>
                )}

                {account.description && <p className="mt-3">{account.description}</p>}

                {account.readme_content && (
                    <div className="mt-4">
                        <h5>README</h5>
                        <pre className="bg-light p-3 rounded" style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>
                            {account.readme_content}
                        </pre>
                    </div>
                )}

                {account.file_tree?.length > 0 && (
                    <div className="mt-4">
                        <h5>Files</h5>
                        <ul className="list-unstyled font-monospace small">
                            {account.file_tree.map(f => <li key={f}>{f}</li>)}
                        </ul>
                    </div>
                )}
            </div>
        </FrontendLayout>
    );
}
