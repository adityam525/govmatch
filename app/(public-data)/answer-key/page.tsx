'use client';

import { useEffect, useState } from 'react';
import { KeyRound } from 'lucide-react';
import Card from '@/components/ui/Card';
import SectionHeader from '@/components/ui/SectionHeader';
import InfoListItem from '@/components/shared/InfoListItem';

export default function AnswerKeyPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/answer-keys').then((r) => r.json()).then((d) => setItems(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Card padding="lg">
        <SectionHeader title="Answer Keys" />
        {loading ? (
          <p className="text-sm text-neutral-600 py-8 text-center">Loading...</p>
        ) : items.length === 0 ? (
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
