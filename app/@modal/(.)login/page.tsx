'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Modal from '@/components/auth/Modal';
import LoginForm from '@/components/auth/LoginForm';

function LoginDialog() {
  const router = useRouter();
  const params = useSearchParams();
  const completeProfile = params.get('completeProfile') === 'true';
  return (
    <Modal label="Log in">
      <LoginForm
        signedUp={params.get('signedUp') === 'true'}
        completeProfile={completeProfile}
        onSuccess={() => {
          if (completeProfile) router.replace('/profile');
          else router.back();
          router.refresh();
        }}
      />
    </Modal>
  );
}

export default function LoginModalPage() {
  return <Suspense fallback={null}><LoginDialog /></Suspense>;
}
