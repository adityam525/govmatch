'use client';

import { useRouter } from 'next/navigation';
import Modal from '@/components/auth/Modal';
import SignupForm from '@/components/auth/SignupForm';

export default function SignupModalPage() {
  const router = useRouter();
  return (
    <Modal label="Create account">
      <SignupForm onSuccess={() => router.replace('/login?signedUp=true&completeProfile=true')} />
    </Modal>
  );
}
