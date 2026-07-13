'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks';
import Card from '@/components/ui/Card';
import SectionHeader from '@/components/ui/SectionHeader';
import JobListItem from '@/components/jobs/JobListItem';
import { notificationToJobs } from '@/features/jobs/adapters';

export default function SavedJobsPage() {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/users/${user.id}/saved-jobs`)
      .then((r) => r.json())
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (authLoading) return <div className="max-w-4xl mx-auto px-6 py-8 text-sm text-neutral-600">Loading...</div>;
  if (!isLoggedIn) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card padding="lg"><p className="text-sm text-neutral-600">Please log in to view saved jobs.</p></Card>
      </div>
    );
  }

  const jobs = notifications.flatMap(notificationToJobs);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Card padding="lg">
        <SectionHeader title="Saved Jobs" />
        {loading ? (
          <p className="text-sm text-neutral-600 py-8 text-center">Loading...</p>
        ) : jobs.length === 0 ? (
          <p className="text-sm text-neutral-600 py-8 text-center">
            No saved jobs yet. Browse jobs and click save to track them here.
          </p>
        ) : (
          <div>{jobs.map((job) => <JobListItem key={job.id} job={job} />)}</div>
        )}
      </Card>
    </div>
  );
}
