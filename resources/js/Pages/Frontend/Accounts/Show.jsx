import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head, Link } from '@inertiajs/react';

export default function AccountShow({ account }) {
    return (
        <FrontendLayout>
            <Head title={account.title} />

            <div className="container py-5" style={{ maxWidth: '900px' }}>
                {/* Back */}
                <Link href={route('accounts.index')} className="ll-back-link">
                    ← Back to Accounts
                </Link>

                {/* Header */}
                <div className="mt-3 mb-4">
                    <span className="ll-platform-badge mb-2 d-inline-block">{account.platform}</span>
                    <h1 className="ll-title mb-1">{account.title}</h1>
                    <p className="text-muted-ll small mb-2">@{account.username}</p>
                    {account.github_url && (
                        <a
                            href={account.github_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-accent"
                            style={{ fontSize: '0.875rem', textDecoration: 'none', fontWeight: 600 }}
                        >
                            🔗 {account.github_url}
                        </a>
                    )}
                    {account.description && (
                        <p className="text-muted-ll mt-2 mb-0" style={{ lineHeight: 1.75 }}>
                            {account.description}
                        </p>
                    )}
                </div>

                <div className="row g-4">
                    {/* README */}
                    {account.readme_content && (
                        <div className="col-12">
                            <h5 className="fw-800 text-dark-ll mb-2">
                                <span className="text-accent me-2">📄</span>README
                            </h5>
                            <div className="ll-readme">{account.readme_content}</div>
                        </div>
                    )}

                    {/* File tree */}
                    {account.file_tree?.length > 0 && (
                        <div className="col-12">
                            <h5 className="fw-800 text-dark-ll mb-2">
                                <span className="text-accent me-2">📁</span>
                                File Tree
                                <span
                                    className="text-muted-ll fw-400 ms-2"
                                    style={{ fontSize: '0.8rem' }}
                                >
                                    ({account.file_tree.length} files)
                                </span>
                            </h5>
                            <div className="ll-file-tree">
                                {account.file_tree.map(f => (
                                    <div key={f}>{f}</div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No content */}
                    {!account.readme_content && !account.file_tree?.length && (
                        <div className="col-12 text-center py-4">
                            <p className="text-muted-ll small">
                                No synced content yet.{' '}
                                <span className="text-accent">Sync from the dashboard to populate README &amp; file tree.</span>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </FrontendLayout>
    );
}
