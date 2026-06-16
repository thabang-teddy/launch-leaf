import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function PersonalInfoEdit({ info }) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        _method:      'PUT',
        name:         info.name         ?? '',
        headline:     info.headline     ?? '',
        bio:          info.bio          ?? '',
        email:        info.email        ?? '',
        phone:        info.phone        ?? '',
        location:     info.location     ?? '',
        website_url:  info.website_url  ?? '',
        avatar:       null,
        linkedin_url: info.linkedin_url ?? '',
        github_url:   info.github_url   ?? '',
        twitter_url:  info.twitter_url  ?? '',
        resume_url:   info.resume_url   ?? '',
    });

    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(
        info.avatar_url ?? null
    );

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setData('avatar', file);
        setPreview(URL.createObjectURL(file));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.personal-info.update'), {
            forceFormData: true,
        });
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
                            {/* Avatar upload */}
                            <div className="mb-4">
                                <label className="form-label fw-semibold small">Profile Photo</label>
                                <div className="d-flex align-items-center gap-3">
                                    {/* Preview circle */}
                                    <div
                                        style={{
                                            width: '88px',
                                            height: '88px',
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                            border: '2px solid #dee2e6',
                                            flexShrink: 0,
                                            background: '#f8f9fa',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '2rem',
                                        }}
                                    >
                                        {preview ? (
                                            <img
                                                src={preview}
                                                alt="Avatar preview"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            '👤'
                                        )}
                                    </div>

                                    <div>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            {preview ? 'Change Photo' : 'Upload Photo'}
                                        </button>
                                        {preview && (
                                            <button
                                                type="button"
                                                className="btn btn-link btn-sm text-danger ms-2"
                                                onClick={() => {
                                                    setPreview(null);
                                                    setData('avatar', null);
                                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                                }}
                                            >
                                                Remove
                                            </button>
                                        )}
                                        <div className="form-text text-muted mt-1">
                                            JPG, PNG or WebP · max 2 MB
                                        </div>
                                    </div>
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="d-none"
                                    onChange={handleAvatarChange}
                                />
                                {errors.avatar && (
                                    <div className="text-danger small mt-1">{errors.avatar}</div>
                                )}
                            </div>

                            {field('Full Name *', 'name')}
                            {field('Headline', 'headline', 'text', 'e.g. "Full-stack developer"')}
                            {field('Bio', 'bio', 'textarea')}
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
