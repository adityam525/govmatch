'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Divider from '@/components/ui/Divider';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const signedUp = searchParams.get('signedUp') === 'true';
  const completeProfile = searchParams.get('completeProfile') === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await signIn('credentials', { email, password, redirect: false });

    if (res?.error) {
      setError('Invalid email or password');
    } else {
      router.push(completeProfile ? '/profile' : '/');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <Card padding="lg" className="w-full max-w-sm">
      <h1 className="text-lg font-bold text-neutral-900 mb-1">Welcome back</h1>
      <p className="text-sm text-neutral-600 mb-1">Log in to see your personalized job matches.</p>
      {signedUp && (
        <p className="text-xs text-success mb-4">Account created! Log in to complete your profile.</p>
      )}

      <Button variant="secondary" fullWidth onClick={() => signIn('google', { callbackUrl: completeProfile ? '/profile' : '/' })}>
        Continue with Google
      </Button>

      <Divider label="Or" className="my-4" />

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500"
          required
        />
        {error && <p className="text-xs text-danger">{error}</p>}
        <Button type="submit" variant="primary" fullWidth disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </Button>
      </form>

      <p className="text-xs text-neutral-600 text-center mt-4">
        Don't have an account?{' '}
        <Link href="/signup" className="text-primary-600 hover:underline">Sign up</Link>
      </p>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-6">
      <Suspense fallback={<div className="text-sm text-neutral-400">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
