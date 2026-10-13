import type { LucideIcon } from 'lucide-react';
import Card from '@/components/ui/Card';
import SectionHeader from '@/components/ui/SectionHeader';
import InfoListItem from '@/components/shared/InfoListItem';
import type { UpdateRow } from '@/lib/job-queries';

interface UpdatesListPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  rows: UpdateRow[];
  emptyText: string;
}

export default function UpdatesListPage({ title, description, icon, rows, emptyText }: UpdatesListPageProps) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Card padding="lg">
        <SectionHeader title={title} description={description} />
        {rows.length === 0 ? (
          <p className="text-sm text-neutral-600 py-8 text-center">{emptyText}</p>
        ) : (
          <div>
            {rows.map((row) => (
              <InfoListItem
                key={row.id}
                icon={icon}
                title={row.title}
                subtitle={row.subtitle}
                date={row.date}
                href={row.href}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
