'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function ExamDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [notification, setNotification] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((all) => setNotification(Array.isArray(all) ? all.find((n: any) => n.slug === slug) : null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="max-w-3xl mx-auto px-6 py-8 text-sm text-neutral-600">Loading...</div>;
  if (!notification || !notification.examDate) {
    return <div className="max-w-3xl mx-auto px-6 py-8 text-sm text-neutral-600">Exam details not available.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <Card padding="lg">
        <h1 className="text-xl font-bold text-neutral-900">{notification.title}</h1>
        <p className="text-sm text-neutral-600 mt-1">{notification.organization?.name}</p>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <p className="text-xs text-neutral-400">Exam Date</p>
            <p className="text-sm font-semibold text-neutral-900">
              {new Date(notification.examDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-400">Application Last Date</p>
            <p className="text-sm font-semibold text-danger">
              {notification.applicationEndDate ? new Date(notification.applicationEndDate).toLocaleDateString('en-IN') : 'TBA'}
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <a href={`/jobs/${notification.slug}`}>
            <Button variant="secondary">View Job Details</Button>
          </a>
          <a href={notification.officialLink} target="_blank" rel="noopener noreferrer">
            <Button variant="primary">Official Notification</Button>
          </a>
        </div>
      </Card>
    </div>
  );
}
