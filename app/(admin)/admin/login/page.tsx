'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      setError('Incorrect password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <Card padding="lg" className="w-full max-w-sm">
        <h1 className="text-lg font-bold text-neutral-900 mb-1">Admin Login</h1>
        <p className="text-sm text-neutral-600 mb-5">Enter the admin password to continue.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500"
            autoFocus
          />
          {error && <p className="text-xs text-danger">{error}</p>}
          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? 'Checking...' : 'Login'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
