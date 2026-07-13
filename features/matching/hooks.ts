'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks';

export interface JobMatch {
  notificationId: string;
  notificationTitle: string;
  slug: string;
  organization: string;
  postId: string;
  postTitle: string;
  vacancies: number;
  applicationEndDate: string | null;
  matchScore: number;
  eligible: boolean;
}

export function useJobMatches() {
  const { user, isLoggedIn } = useAuth();
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn || !user?.id) {
      setMatches([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/users/${user.id}/matches`)
      .then((res) => res.json())
      .then((data) => setMatches(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Failed to load matches:', err))
      .finally(() => setLoading(false));
  }, [user?.id, isLoggedIn]);

  return { matches, loading };
}
