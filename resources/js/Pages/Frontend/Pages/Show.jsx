import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head } from '@inertiajs/react';

export default function PageShow({ page }) {
    return (
        <FrontendLayout>
            <Head title={page.title} />

            <div className="container py-5" style={{ maxWidth: '800px' }}>
                <h1 className="ll-title mb-4">{page.title}</h1>

                {page.content && (
                    <div className="ll-prose" dangerouslySetInnerHTML={{ __html: page.content }} />
                )}
            </div>
        </FrontendLayout>
    );
}
