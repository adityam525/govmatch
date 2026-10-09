'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useAuth } from '@/features/auth/hooks';
import Button from '@/components/ui/Button';

export default function DeleteAccountButton() {
  const { user } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!user?.id) return;
    setDeleting(true);
    setError('');
    try {
      const res = await fetch(`/api/users/${user.id}/delete-account`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? 'Could not delete your account. Please try again.');
        setDeleting(false);
        return;
      }
      await signOut({ callbackUrl: '/' });
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
      setDeleting(false);
    }
  };

  if (!confirming) {
    return (
      <Button variant="secondary" size="sm" className="mt-3 border-red-200 text-danger hover:bg-red-50" onClick={() => setConfirming(true)}>
        Delete My Account
      </Button>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" className="border-red-200 text-danger hover:bg-red-50" onClick={handleDelete} disabled={deleting}>
          {deleting ? 'Deleting...' : 'Confirm Delete'}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setConfirming(false)} disabled={deleting}>
          Cancel
        </Button>
      </div>
      {error && <p className="text-xs text-danger mt-2">{error}</p>}
    </div>
  );
}
