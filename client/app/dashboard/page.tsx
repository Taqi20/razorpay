'use client';
import { useEffect, useState } from 'react';

type Transaction = {
    id: string;
    type: string;
    amountPaise: number;
    status: string;
    razorpayOrderId?: string | null;
    createdAt: string;
};

type Subscription = {
    id: string;
    razorpaySubscriptionId: string;
    planAmountPaise: number;
    quantity: number;
    status: string;
    nextBillingAt?: string | null;
};

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'}/api/user`, {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data?.error || 'Failed to fetch');
                setUser(data.user);
            } catch (err: any) {
                setError(err.message || 'error');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return <div className="p-6">Loading...</div>;
    if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
    if (!user) return <div className="p-6">No user data</div>;

    return (
        <div className="min-h-screen p-6 bg-gray-50">
            <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Hello — {user.phone}</h1>
                        <p className="text-sm text-gray-600">Member since {new Date(user.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                        <button
                            onClick={async () => {
                                await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'}/api/auth/logout`, {
                                    method: 'POST',
                                    credentials: 'include',
                                });
                                window.location.href = '/';
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                <section className="mt-6">
                    <h2 className="text-lg font-semibold mb-2">Subscriptions</h2>
                    {user.subscriptions.length === 0 ? (
                        <div>No active subscriptions</div>
                    ) : (
                        <ul className="space-y-2">
                            {user.subscriptions.map((s: Subscription) => (
                                <li key={s.id} className="p-3 border rounded">
                                    <div>Plan: ₹{s.planAmountPaise / 100} × {s.quantity}</div>
                                    <div>Status: {s.status}</div>
                                    <div>Next billing: {s.nextBillingAt ? new Date(s.nextBillingAt).toLocaleString() : '—'}</div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="mt-6">
                    <h2 className="text-lg font-semibold mb-2">Transactions</h2>
                    {user.transactions.length === 0 ? (
                        <div>No transactions</div>
                    ) : (
                        <ul className="space-y-2">
                            {user.transactions.map((t: Transaction) => (
                                <li key={t.id} className="p-3 border rounded">
                                    <div>Type: {t.type}</div>
                                    <div>Amount: ₹{(t.amountPaise / 100).toFixed(2)}</div>
                                    <div>Status: {t.status}</div>
                                    <div>When: {new Date(t.createdAt).toLocaleString()}</div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
}
