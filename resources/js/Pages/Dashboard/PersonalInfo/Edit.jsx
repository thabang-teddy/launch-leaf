import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';

export default function PersonalInfoEdit({ info }) {
    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        name:         info.name         ?? '',
        headline:     info.headline     ?? '',
        bio:          info.bio          ?? '',
        email:        info.email        ?? '',
        phone:        info.phone        ?? '',
        location:     info.location     ?? '',
        website_url:  info.website_url  ?? '',
        avatar_path:  info.avatar_path  ?? '',
        linkedin_url: info.linkedin_url ?? '',
        github_url:   info.github_url   ?? '',
        twitter_url:  info.twitter_url  ?? '',
        resume_url:   info.resume_url   ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('dashboard.personal-info.update'));
    };

    const field = (label, key, type = 'text', hint = null) => (
        <div className="mb-3" key={key}>
            <label className="form-label fw-semibold small">{label}</label>
            {type === 'textarea' ? (
                <textarea
                    className={`form-control ${errors[key] ? 'is-invalid' : ''}`}
                    rows={5}
                    value={data[key]}
                    onChange={e => setData(key, e.target.value)}
                />
            ) : (
                <input
                    type={type}
                    className={`form-control ${errors[key] ? 'is-invalid' : ''}`}
                    value={data[key]}
                    onChange={e => setData(key, e.target.value)}
                />
            )}
            {hint && <div className="form-text text-muted">{hint}</div>}
            {errors[key] && <div className="invalid-feedback">{errors[key]}</div>}
        </div>
    );

    return (
        <DashboardLayout header="Personal Info">
            <Head title="Personal Info" />

            <div style={{ maxWidth: '720px' }}>
                {recentlySuccessful && (
                    <div className="alert alert-success py-2 mb-4">Saved successfully.</div>
                )}

                <form onSubmit={submit}>
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-white fw-semibold">Basic Info</div>
                        <div className="card-body">
                            {field('Full Name *', 'name')}
                            {field('Headline', 'headline', 'text', 'e.g. "Full-stack developer"')}
                            {field('Bio', 'bio', 'textarea')}
                            {field('Avatar Path', 'avatar_path', 'text', 'Relative path in storage, e.g. avatars/me.jpg')}
                            {field('Location', 'location')}
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-white fw-semibold">Contact</div>
                        <div className="card-body">
                            {field('Email', 'email', 'email')}
                            {field('Phone', 'phone', 'tel')}
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-white fw-semibold">Links</div>
                        <div className="card-body">
                            {field('Website URL', 'website_url', 'url')}
                            {field('GitHub URL', 'github_url', 'url')}
                            {field('LinkedIn URL', 'linkedin_url', 'url')}
                            {field('Twitter URL', 'twitter_url', 'url')}
                            {field('Resume URL', 'resume_url', 'url')}
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={processing}>
                        {processing ? 'Saving…' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </DashboardLayout>
    );
}
