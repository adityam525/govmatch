'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/features/auth/hooks';

export default function JobDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, isLoggedIn } = useAuth();
  const [notification, setNotification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((all) => setNotification(all.find((n: any) => n.slug === slug) ?? null))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSave = async () => {
    if (!user?.id || !notification) return;
    await fetch(`/api/users/${user.id}/saved-jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: notification.id }),
    });
    setSaved(true);
  };

  const handleMarkApplied = async () => {
    if (!user?.id || !notification) return;
    await fetch(`/api/users/${user.id}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: notification.id, status: 'APPLIED' }),
    });
    setApplied(true);
  };

  if (loading) return <div className="max-w-4xl mx-auto px-6 py-8 text-sm text-neutral-600">Loading...</div>;
  if (!notification) return <div className="max-w-4xl mx-auto px-6 py-8 text-sm text-neutral-600">Job not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Card padding="lg">
        <h1 className="text-xl font-bold text-neutral-900">{notification.title}</h1>
        <p className="text-sm text-neutral-600 mt-1">{notification.organization?.name}</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          <div>
            <p className="text-xs text-neutral-400">Total Vacancies</p>
            <p className="text-sm font-semibold text-neutral-900">{notification.totalVacancies}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-400">Last Date</p>
            <p className="text-sm font-semibold text-danger">
              {notification.applicationEndDate ? new Date(notification.applicationEndDate).toLocaleDateString('en-IN') : 'TBA'}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-400">Status</p>
            <p className="text-sm font-semibold text-neutral-900">{notification.status}</p>
          </div>
        </div>

        {notification.posts?.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-semibold text-neutral-900 mb-3">Posts</p>
            <div className="space-y-2">
              {notification.posts.map((post: any) => (
                <div key={post.id} className="border border-neutral-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-neutral-900">{post.title}</p>
                  <p className="text-xs text-neutral-600 mt-1">
                    {post.vacancies} vacancies
                    {post.minAge && post.maxAge ? ` - Age ${post.minAge}-${post.maxAge}` : ''}
                    {post.payScale ? ` - ${post.payScale}` : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mt-6">
          <a href={notification.officialLink} target="_blank" rel="noopener noreferrer">
            <Button variant="primary">Apply on Official Website</Button>
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
      </Card>
    </div>
  );
}
