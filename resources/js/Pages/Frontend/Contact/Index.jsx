import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function Contact() {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '', email: '', subject: '', message: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('contact.store'), { onSuccess: () => reset() });
    };

    return (
        <FrontendLayout>
            <Head title="Contact" />
            <div className="container py-5" style={{ maxWidth: '640px' }}>
                <h1 className="h2 mb-4">Get in touch</h1>

                {flash?.success && (
                    <div className="alert alert-success">{flash.success}</div>
                )}

                <form onSubmit={submit}>
                    <div className="mb-3">
                        <label className="form-label">Name</label>
                        <input className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                            value={data.name} onChange={e => setData('name', e.target.value)} />
                        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                            value={data.email} onChange={e => setData('email', e.target.value)} />
                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Subject <span className="text-muted">(optional)</span></label>
                        <input className="form-control" value={data.subject}
                            onChange={e => setData('subject', e.target.value)} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Message</label>
                        <textarea rows={6} className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                            value={data.message} onChange={e => setData('message', e.target.value)} />
                        {errors.message && <div className="invalid-feedback">{errors.message}</div>}
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={processing}>
                        {processing ? 'Sending…' : 'Send message'}
                    </button>
                </form>
            </div>
        </FrontendLayout>
    );
}
