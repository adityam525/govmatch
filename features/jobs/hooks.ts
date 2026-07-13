'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Job } from './types';
import { notificationToJobs } from './adapters';

interface UseJobSearchOptions {
  query?: string;
  category?: string;
}

export function useJobSearch({ query, category }: UseJobSearchOptions) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setNotifications(data);
        } else {
          console.error('Expected array from /api/notifications, got:', data);
          setNotifications([]);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch jobs:', err);
        setNotifications([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const jobs: Job[] = useMemo(() => {
    let allJobs = notifications.flatMap(notificationToJobs);

    if (category && category !== 'all') {
      allJobs = allJobs.filter((job) => job.category === category);
    }

    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      allJobs = allJobs.filter(
        (job) =>
          job.title.toLowerCase().includes(q) ||
          job.org.toLowerCase().includes(q) ||
          job.category.toLowerCase().includes(q)
      );
    }

    return allJobs;
  }, [notifications, query, category]);

  return { jobs, loading };
}
