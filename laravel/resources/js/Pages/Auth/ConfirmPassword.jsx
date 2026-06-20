import { useEffect, useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';

export default function ConfirmPassword() {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({ password: '' });

    useEffect(() => () => reset('password'), []);

    const submit = e => {
        e.preventDefault();
        post(route('password.confirm'));
    };

    return (
        <GuestLayout>
            <Head title="Confirm Password" />

            <h5 className="fw-800 text-dark-ll mb-2" style={{ fontSize: '1.15rem' }}>
                Confirm Password
            </h5>
            <p className="text-muted-ll small mb-4">
                This is a secure area. Please confirm your password before continuing.
            </p>

            <form onSubmit={submit}>
                <div className="mb-3">
                    <InputLabel htmlFor="password" value="Password" />
                    <div style={{ position: 'relative' }}>
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            isFocused
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

                <div className="d-flex justify-content-end mt-3">
                    <PrimaryButton disabled={processing}>
                        {processing ? 'Confirming…' : 'Confirm'}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
