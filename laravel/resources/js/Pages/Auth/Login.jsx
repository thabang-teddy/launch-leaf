import { useEffect, useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => () => reset('password'), []);

    const submit = e => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <h5 className="fw-800 text-dark-ll mb-1" style={{ fontSize: '1.15rem' }}>
                Dashboard Login
            </h5>
            <p className="text-muted-ll small mb-4">Sign in to manage your portfolio.</p>

            {status && (
                <div className="mb-3 p-2 rounded small" style={{ background: 'rgba(25,135,84,0.08)', color: '#146c43' }}>
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div className="mb-3">
                    <InputLabel htmlFor="email" value="Email Address" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        autoComplete="username"
                        isFocused
                        onChange={e => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} />
                </div>

                <div className="mb-3">
                    <InputLabel htmlFor="password" value="Password" />
                    <div style={{ position: 'relative' }}>
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            autoComplete="current-password"
                            onChange={e => setData('password', e.target.value)}
                        />
                        <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowPassword(v => !v)}
                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '0.75rem', fontWeight: 600, padding: '2px', userSelect: 'none' }}
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    <InputError message={errors.password} />
                </div>

                <div className="mb-3 form-check">
                    <Checkbox
                        id="remember"
                        name="remember"
                        checked={data.remember}
                        onChange={e => setData('remember', e.target.checked)}
                        className="me-2"
                    />
                    <label htmlFor="remember" className="form-check-label small text-muted-ll">
                        Remember me
                    </label>
                </div>

                <div className="d-flex align-items-center justify-content-between mt-4">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="small text-decoration-none"
                            style={{ color: 'var(--ll-muted)' }}
                        >
                            Forgot password?
                        </Link>
                    )}
                    <PrimaryButton disabled={processing}>
                        {processing ? 'Signing in…' : 'Log In'}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
