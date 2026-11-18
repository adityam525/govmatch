'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import PasswordInput from '@/components/ui/PasswordInput';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [needsEmail, setNeedsEmail] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin-auth/mode').then((r) => r.json()).then((d) => setNeedsEmail(!!d.accounts)).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.push('/admin');
        router.refresh();
        return;
      }
      const d = await res.json().catch(() => ({}));
      setError(d.message ?? 'Could not log in.');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = 'w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-500';
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <Card padding="lg" className="w-full max-w-sm">
        <h1 className="mb-1 text-xl font-bold text-neutral-900">Admin Login</h1>
        <p className="mb-5 text-sm text-neutral-600">{needsEmail ? 'Enter your admin email and password.' : 'Enter the admin password to continue.'}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {needsEmail && (
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoComplete="username" required className={field} autoFocus />
          )}
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" required className={field} autoFocus={!needsEmail} />
          {error && <p role="alert" className="text-xs text-danger">{error}</p>}
          <Button type="submit" variant="primary" fullWidth disabled={loading}>{loading ? 'Checking...' : 'Login'}</Button>
        </form>
      </Card>
    </div>
  );
}
