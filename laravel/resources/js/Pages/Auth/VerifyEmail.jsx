import GuestLayout from '@/Layouts/GuestLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = e => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <h5 className="fw-800 text-dark-ll mb-2" style={{ fontSize: '1.15rem' }}>
                Verify Your Email
            </h5>

            <p className="text-muted-ll small mb-3">
                Thanks for signing up! Please verify your email address by clicking the link we sent you.
                Didn't receive it? We'll send another.
            </p>

            {status === 'verification-link-sent' && (
                <div className="mb-3 p-2 rounded small" style={{ background: 'rgba(25,135,84,0.08)', color: '#146c43' }}>
                    A new verification link has been sent to your email address.
                </div>
            )}

            <form onSubmit={submit}>
                <div className="d-flex align-items-center justify-content-between mt-3">
                    <PrimaryButton disabled={processing}>
                        {processing ? 'Sending…' : 'Resend Verification Email'}
                    </PrimaryButton>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="border-0 bg-transparent small text-decoration-none"
                        style={{ color: 'var(--ll-muted)', cursor: 'pointer' }}
                    >
                        Log Out
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
