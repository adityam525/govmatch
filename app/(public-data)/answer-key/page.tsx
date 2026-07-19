import { KeyRound } from 'lucide-react';
import Card from '@/components/ui/Card';
import SectionHeader from '@/components/ui/SectionHeader';
import InfoListItem from '@/components/shared/InfoListItem';
import { prisma } from '@/lib/prisma';

export default async function AnswerKeyPage() {
  const items = await prisma.answerKey.findMany({
    include: { notification: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Card padding="lg">
        <SectionHeader title="Answer Keys" />
        {items.length === 0 ? (
          <p className="text-sm text-neutral-600 py-8 text-center">No answer keys published yet.</p>
        ) : (
          <div>
            {items.map((item) => (
              <InfoListItem
                key={item.id}
                icon={KeyRound}
                title={item.title}
                subtitle={item.notification?.title ?? ''}
                date={item.releaseDate ? new Date(item.releaseDate).toLocaleDateString('en-IN') : 'TBA'}
                href={item.downloadLink}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
