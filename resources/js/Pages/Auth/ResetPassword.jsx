import { useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    useEffect(() => () => reset('password', 'password_confirmation'), []);

    const submit = e => {
        e.preventDefault();
        post(route('password.store'));
    };

    return (
        <GuestLayout>
            <Head title="Reset Password" />

            <h5 className="fw-800 text-dark-ll mb-4" style={{ fontSize: '1.15rem' }}>
                Reset Password
            </h5>

            <form onSubmit={submit}>
                <div className="mb-3">
                    <InputLabel htmlFor="email" value="Email Address" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        autoComplete="username"
                        onChange={e => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} />
                </div>

                <div className="mb-3">
                    <InputLabel htmlFor="password" value="New Password" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        autoComplete="new-password"
                        isFocused
                        onChange={e => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} />
                </div>

                <div className="mb-3">
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                    <TextInput
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        autoComplete="new-password"
                        onChange={e => setData('password_confirmation', e.target.value)}
                    />
                    <InputError message={errors.password_confirmation} />
                </div>

                <div className="d-flex justify-content-end mt-3">
                    <PrimaryButton disabled={processing}>
                        {processing ? 'Resetting…' : 'Reset Password'}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
