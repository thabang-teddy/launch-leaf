import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head } from '@inertiajs/react';

export default function Home({ personalInfo }) {
    return (
        <FrontendLayout>
            <Head title="Home" />
            <div className="container py-5">
                <h1 className="display-4 fw-bold">
                    {personalInfo?.name ?? 'Welcome'}
                </h1>
                {personalInfo?.headline && (
                    <p className="lead text-muted">{personalInfo.headline}</p>
                )}
            </div>
        </FrontendLayout>
    );
}
