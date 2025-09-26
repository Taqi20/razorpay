'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
    const [phone, setPhone] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [message, setMessage] = useState('');

    const router = useRouter();

    async function sendOtp() {
        setSending(true);
        setMessage('');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'}/api/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone
                }),
                credentials: 'include',
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data?.error || 'Failed to send');
            setSent(true);
            setMessage('OTP sent. Check console (mock) or your SMS. For dev, code may be returned.');

            if (data.code) setMessage((m) => m + ` (dev code: ${data.code})`);
        } catch (err: any) {
            setMessage(err.message || 'Error');
        } finally {
            setSending(false);
        }
    }

    async function verifyOtp() {
        setMessage('');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone,
                    code: otp
                }),
                credentials: 'include',
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Invalid OTP');
            setMessage('Verified! Token set in cookie.');
            router.push('/dashboard');

        } catch (err: any) {
            setMessage(err.message || 'Error');
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-md bg-white p-8 rounded shadow">
                <h2 className="text-2xl font-semibold mb-4 text-black">Sign in with phone</h2>
                <input className="w-full border p-2 rounded mb-3 text-black" placeholder="+91xxxxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <button onClick={sendOtp} className="w-full bg-blue-600 text-white p-2 rounded" disabled={sending}>{sending ? 'Sending...' : 'Send OTP'}</button>

                {sent && (
                    <>
                        <div className="mt-4">
                            <input className="w-full border p-2 rounded mb-3" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
                            <button onClick={verifyOtp} className="w-full bg-green-600 text-white p-2 rounded">Verify OTP</button>
                        </div>
                    </>
                )}

                <p className="mt-4 text-sm text-gray-600">{message}</p>
            </div>
        </div>
    );
}
