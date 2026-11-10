'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import Button from '@/components/ui/Button';
import Divider from '@/components/ui/Divider';

interface Props {
  onSuccess: () => void;
  signedUp?: boolean;
  completeProfile?: boolean;
  googleCallback?: string;
}

export default function LoginForm({ onSuccess, signedUp = false, completeProfile = false, googleCallback = '/' }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await signIn('credentials', { email, password, redirect: false });
      if (res?.error) setError('Invalid email or password');
      else onSuccess();
    } catch {
      setError('Could not log in. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = 'w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500';
  return (
    <div>
      <h1 className="mb-1 text-lg font-bold text-neutral-900">Welcome back</h1>
      <p className="mb-1 text-sm text-neutral-600">Log in to see your personalized job matches.</p>
      {signedUp && <p className="mb-4 text-xs text-success">Account created! Log in to complete your profile.</p>}

      <Button variant="secondary" fullWidth className="mt-3" onClick={() => signIn('google', { callbackUrl: completeProfile ? '/profile' : googleCallback })}>
        Continue with Google
      </Button>
      <Divider label="Or" className="my-4" />

      <form onSubmit={submit} className="space-y-3">
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} autoComplete="email" required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} autoComplete="current-password" required />
        <div className="text-right"><Link href="/forgot-password" replace className="text-xs text-primary-600 hover:underline">Forgot password?</Link></div>
        {error && <p role="alert" className="text-xs text-danger">{error}</p>}
        <Button type="submit" variant="primary" fullWidth disabled={loading}>{loading ? 'Logging in...' : 'Log in'}</Button>
      </form>

      <p className="mt-4 text-center text-xs text-neutral-600">
        New here? <Link href="/signup" replace className="font-semibold text-primary-600 hover:underline">Create a free account</Link>
      </p>
    </div>
  );
}
