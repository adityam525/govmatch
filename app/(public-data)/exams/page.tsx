import { CalendarDays } from 'lucide-react';
import Card from '@/components/ui/Card';
import SectionHeader from '@/components/ui/SectionHeader';
import InfoListItem from '@/components/shared/InfoListItem';
import { prisma } from '@/lib/prisma';

export default async function ExamsPage() {
  const notifications = await prisma.notification.findMany({
    where: { examDate: { not: null } },
    include: { organization: true },
    orderBy: { examDate: 'asc' },
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Card padding="lg">
        <SectionHeader title="Upcoming Exams" />
        {notifications.length === 0 ? (
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
