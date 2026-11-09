'use client';

import Link from 'next/link';
import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    await fetch('/api/password-reset/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }).catch(() => {});
    setDone(true); setBusy(false);
  };
  return (
    <Card padding="lg" className="w-full max-w-sm">
      <h1 className="mb-1 text-lg font-bold text-neutral-900">Forgot your password?</h1>
      {done ? (
        <p className="mt-3 text-sm text-neutral-600">If that email has an account, we have sent a link to reset the password. Check your inbox and spam folder.</p>
      ) : (
        <form onSubmit={submit} className="mt-3 space-y-3">
          <p className="text-sm text-neutral-600">Enter your email and we will send you a link.</p>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoComplete="email" className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-500" />
          <Button type="submit" variant="primary" fullWidth disabled={busy}>{busy ? 'Sending...' : 'Send reset link'}</Button>
        </form>
      )}
      <p className="mt-4 text-center text-xs"><Link href="/login" className="text-primary-600 hover:underline">Back to log in</Link></p>
    </Card>
  );
}
