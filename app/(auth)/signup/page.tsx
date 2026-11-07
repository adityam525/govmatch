'use client';

import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import SignupForm from '@/components/auth/SignupForm';

export default function SignupPage() {
  const router = useRouter();
  return (
    <Card padding="lg" className="w-full max-w-md">
      <SignupForm onSuccess={() => router.replace('/login?signedUp=true&completeProfile=true')} />
    </Card>
  );
}
