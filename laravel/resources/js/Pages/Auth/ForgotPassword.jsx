import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const submit = e => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <h5 className="fw-800 text-dark-ll mb-1" style={{ fontSize: '1.15rem' }}>
                Forgot Password?
            </h5>
            <p className="text-muted-ll small mb-4">
                Enter your email and we'll send you a reset link.
            </p>

            {status && (
                <div className="mb-3 p-2 rounded small" style={{ background: 'rgba(25,135,84,0.08)', color: '#146c43' }}>
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div className="mb-3">
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        placeholder="your@email.com"
                        isFocused
                        onChange={e => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} />
                </div>

                <div className="d-flex justify-content-end mt-3">
                    <PrimaryButton disabled={processing}>
                        {processing ? 'Sending…' : 'Email Reset Link'}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
