import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';

const sections = [
    { label: 'GitHub Projects', href: 'dashboard.projects.index' },
    { label: 'Accounts',        href: 'dashboard.accounts.index' },
    { label: 'Portfolio',       href: 'dashboard.portfolio.index' },
    { label: 'Experience',      href: 'dashboard.experience.index' },
    { label: 'Personal Info',   href: 'dashboard.personal-info' },
    { label: 'Tips',            href: 'dashboard.tips.index' },
    { label: 'Pages',           href: 'dashboard.pages.index' },
    { label: 'Notes',           href: 'dashboard.notes.index' },
    { label: 'Kanban',          href: 'dashboard.kanban.index' },
    { label: 'Tasks',           href: 'dashboard.tasks.index' },
    { label: 'Contact',         href: 'dashboard.contact.index' },
];

export default function DashboardHome() {
    return (
        <DashboardLayout header="Dashboard">
            <Head title="Dashboard" />
            <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
                {sections.map(({ label, href }) => (
                    <div key={href} className="col">
                        <Link href={route(href)} className="text-decoration-none">
                            <div className="card h-100 border-0 shadow-sm">
                                <div className="card-body">
                                    <h6 className="card-title mb-0">{label}</h6>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
}
