'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/features/auth/hooks';

interface JobActionButtonsProps {
  notificationId: string;
  applyUrl: string;
}

export default function JobActionButtons({ notificationId, applyUrl }: JobActionButtonsProps) {
  const { user, isLoggedIn } = useAuth();
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleSave = async () => {
    if (!user?.id) return;
    await fetch(`/api/users/${user.id}/saved-jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId }),
    });
    setSaved(true);
  };

  const handleMarkApplied = async () => {
    if (!user?.id) return;
    await fetch(`/api/users/${user.id}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId, status: 'APPLIED' }),
    });
    setApplied(true);
  };

  return (
    <div className="flex flex-wrap gap-3 mt-6">
      <a href={applyUrl} target="_blank" rel="noopener noreferrer">
        <Button variant="primary" icon={<ExternalLink size={16} />}>Apply on Official Website</Button>
      </a>
      {isLoggedIn && (
        <>
          <Button variant="secondary" onClick={handleSave} disabled={saved}>
            {saved ? 'Saved' : 'Save Job'}
          </Button>
          <Button variant="secondary" onClick={handleMarkApplied} disabled={applied}>
            {applied ? 'Marked as Applied' : 'Mark as Applied'}
          </Button>
        </>
      )}
    </div>
  );
}
