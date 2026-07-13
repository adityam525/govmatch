'use client';

import { useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import Card from '@/components/ui/Card';
import SectionHeader from '@/components/ui/SectionHeader';
import InfoListItem from '@/components/shared/InfoListItem';

interface NotificationExam {
  id: string;
  title: string;
  slug: string;
  examDate: string | null;
  organization: { name: string };
}

export default function ExamsPage() {
  const [notifications, setNotifications] = useState<NotificationExam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => setNotifications(Array.isArray(data) ? data.filter((n: any) => n.examDate) : []))
      .catch((err) => console.error('Failed to fetch exams:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Card padding="lg">
        <SectionHeader title="Upcoming Exams" />

        {loading ? (
          <p className="text-sm text-neutral-600 py-8 text-center">Loading...</p>
        ) : notifications.length === 0 ? (
          <p className="text-sm text-neutral-600 py-8 text-center">No upcoming exams scheduled yet.</p>
        ) : (
          <div>
            {notifications.map((n) => (
              <InfoListItem
                key={n.id}
                icon={CalendarDays}
                title={n.title}
                subtitle={n.organization?.name ?? ''}
                date={n.examDate ? new Date(n.examDate).toLocaleDateString('en-IN') : 'TBA'}
                href={`/exams/${n.slug}`}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
