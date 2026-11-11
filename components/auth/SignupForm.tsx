'use client';

import PasswordInput from '@/components/ui/PasswordInput';
import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function SignupForm({ onSuccess }: { onSuccess: () => void }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? 'Signup failed');
        return;
      }
      onSuccess();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = 'w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500';
  const label = 'block text-xs font-medium text-neutral-600 mb-1.5';
  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-neutral-900">Create your GovMatch account</h1>
      <p className="mb-6 text-sm text-neutral-600">Get started in seconds. You can complete your profile right after.</p>
      <form onSubmit={submit} className="space-y-4">
        <div><label className={label}>Full name *</label><input required value={form.name} onChange={(e) => set('name', e.target.value)} className={field} autoComplete="name" /></div>
        <div><label className={label}>Email *</label><input required type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={field} autoComplete="email" /></div>
        <div><label className={label}>Password *</label><PasswordInput required minLength={8} value={form.password} onChange={(e) => set('password', e.target.value)} className={field} autoComplete="new-password" /></div>
        <div><label className={label}>Confirm password *</label><PasswordInput required minLength={8} value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} className={field} autoComplete="new-password" /></div>
        {error && <p role="alert" className="text-xs text-danger">{error}</p>}
        <Button type="submit" variant="primary" fullWidth disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</Button>
      </form>
      <p className="mt-4 text-center text-xs text-neutral-600">
        Already have an account? <Link href="/login" replace className="font-semibold text-primary-600 hover:underline">Log in</Link>
      </p>
    </div>
  );
}
