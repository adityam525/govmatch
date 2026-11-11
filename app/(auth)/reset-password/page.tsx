'use client';

import PasswordInput from '@/components/ui/PasswordInput';
import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

function ResetForm() {
  const token = useSearchParams().get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setMessage('');
    if (password !== confirm) { setMessage('Passwords do not match.'); return; }
    setBusy(true);
    try {
      const res = await fetch('/api/password-reset/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) });
      const d = await res.json().catch(() => ({}));
      setOk(res.ok); setMessage(d.message ?? (res.ok ? 'Done.' : 'Something went wrong.'));
    } finally { setBusy(false); }
  };
  const field = 'w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-500';
  return (
    <Card padding="lg" className="w-full max-w-sm">
      <h1 className="mb-3 text-lg font-bold text-neutral-900">Set a new password</h1>
      {ok ? (
        <p className="text-sm text-neutral-600">{message} <Link href="/login" className="font-semibold text-primary-600 hover:underline">Log in</Link></p>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <PasswordInput required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" autoComplete="new-password" className={field} />
          <PasswordInput required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password" autoComplete="new-password" className={field} />
          {message && <p role="alert" className="text-xs text-danger">{message}</p>}
          <Button type="submit" variant="primary" fullWidth disabled={busy || !token}>{busy ? 'Saving...' : 'Change password'}</Button>
        </form>
      )}
    </Card>
  );
}
export default function ResetPasswordPage() { return <Suspense fallback={null}><ResetForm /></Suspense>; }
