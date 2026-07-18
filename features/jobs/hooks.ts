'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Job } from './types';
import { notificationToJobs } from './adapters';

interface UseJobSearchOptions {
  query?: string;
  category?: string;
  qualificationSlugs?: string[];
  organizationIds?: string[];
}

const SEARCH_ALIASES: Record<string, string[]> = {
  'bank po': ['probationary officer', 'management trainee', 'po'],
  po: ['probationary officer', 'management trainee'],
  clerk: ['clerk', 'office assistant'],
  je: ['junior engineer'],
  ae: ['assistant engineer'],
  technician: ['technician'],
  teacher: ['teacher', 'tgt', 'pgt'],
  officer: ['officer'],
};

function expandQuery(q: string): string[] {
  const lower = q.toLowerCase().trim();
  const aliasMatches = SEARCH_ALIASES[lower] ?? [];
  return [lower, ...aliasMatches];
}

export function useJobSearch({ query, category, qualificationSlugs, organizationIds }: UseJobSearchOptions) {
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
    let filtered = notifications;

    if (organizationIds && organizationIds.length > 0) {
      filtered = filtered.filter((n) => organizationIds.includes(n.organizationId));
    }

    if (qualificationSlugs && qualificationSlugs.length > 0) {
      filtered = filtered.filter((n) =>
        (n.posts ?? []).some((p: any) => qualificationSlugs.includes(p.qualification?.slug))
      );
    }

    let allJobs = filtered.flatMap(notificationToJobs);

    if (category && category !== 'all') {
      allJobs = allJobs.filter((job) => job.category === category);
    }

    if (query && query.trim()) {
      const terms = expandQuery(query);
      allJobs = allJobs.filter((job) => {
        const haystack = (job.title + ' ' + job.org + ' ' + job.category).toLowerCase();
        return terms.some((term) => haystack.includes(term));
      });
    }

    return allJobs;
  }, [notifications, query, category, JSON.stringify(qualificationSlugs), JSON.stringify(organizationIds)]);

  return { jobs, loading };
}
