'use client';

import { CalendarDays, Trophy, FileCheck2, KeyRound, FileText, GraduationCap } from 'lucide-react';
import InfoListCard from '@/components/shared/InfoListCard';
import { useUpdatesList } from '@/features/updates/hooks';

function toItems(records: any[], titleKey: string, dateKey: string, hrefBuilder: (r: any) => string) {
  return records.slice(0, 4).map((r) => ({
    id: r.id,
    title: r[titleKey],
    subtitle: r.notification?.title ?? '',
    date: r[dateKey] ? new Date(r[dateKey]).toLocaleDateString('en-IN') : 'TBA',
    href: hrefBuilder(r),
  }));
}

export default function LatestUpdatesGrid() {
  const { items: notifications } = useUpdatesList('notifications');
  const { items: admitCards } = useUpdatesList('admit-cards');
  const { items: results } = useUpdatesList('results');
  const { items: answerKeys } = useUpdatesList('answer-keys');
  const { items: documents } = useUpdatesList('documents');

  const examItems = notifications
    .filter((n) => n.examDate)
    .slice(0, 4)
    .map((n) => ({
      id: n.id,
      title: n.title,
      subtitle: n.organization?.name ?? '',
      date: new Date(n.examDate).toLocaleDateString('en-IN'),
      href: `/exams/${n.slug}`,
    }));

  return (
    <section>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InfoListCard title="Upcoming Exams" icon={CalendarDays} items={examItems} viewAllHref="/exams" />
        <InfoListCard
          title="Admit Cards"
          icon={FileCheck2}
          items={toItems(admitCards, 'title', 'releaseDate', (r) => r.downloadLink)}
          viewAllHref="/admit-cards"
        />
        <InfoListCard
          title="Results"
          icon={Trophy}
          items={toItems(results, 'title', 'releaseDate', (r) => r.resultLink)}
          viewAllHref="/results"
        />
        <InfoListCard
          title="Answer Keys"
          icon={KeyRound}
          items={toItems(answerKeys, 'title', 'releaseDate', (r) => r.downloadLink)}
          viewAllHref="/answer-key"
        />
        <InfoListCard
          title="Documents"
          icon={FileText}
          items={toItems(documents, 'title', 'createdAt', (r) => r.fileUrl)}
          viewAllHref="/resources"
        />
        <InfoListCard
          title="Admission"
          icon={GraduationCap}
          items={[]}
          viewAllHref="/admission"
        />
      </div>
    </section>
  );
}
