'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import LoginForm from '@/components/auth/LoginForm';

// Only addresses on this site are allowed, so a link cannot send people elsewhere after login.
const safe = (v: string | null) => (v && v.startsWith('/') && !v.startsWith('//') ? v : null);

function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const completeProfile = params.get('completeProfile') === 'true';
  const target = completeProfile ? '/profile' : safe(params.get('callbackUrl')) ?? '/';
  return (
    <Card padding="lg" className="w-full max-w-sm">
      <LoginForm
        signedUp={params.get('signedUp') === 'true'}
        completeProfile={completeProfile}
        googleCallback={target}
        onSuccess={() => { router.push(target); router.refresh(); }}
      />
    </Card>
  );
}

export default function Page() {
  return <Suspense fallback={null}><LoginPage /></Suspense>;
}
