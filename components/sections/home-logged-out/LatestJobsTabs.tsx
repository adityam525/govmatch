'use client';

import { useState } from 'react';
import JobCard, { type JobCardData } from '@/components/jobs/JobCard';
import TabFilterBar from './TabFilterBar';

export interface LatestJobItem {
  category: string;
  card: JobCardData;
}

export default function LatestJobsTabs({ items }: { items: LatestJobItem[] }) {
  const [activeTab, setActiveTab] = useState('all');
  const visible = activeTab === 'all' ? items : items.filter((item) => item.category === activeTab);

  return (
    <>
      <TabFilterBar activeTab={activeTab} onChange={setActiveTab} />
      <div className="mt-4 overflow-y-auto" style={{ maxHeight: '1088px' }}>
        {visible.length === 0 ? (
          <p className="text-sm text-neutral-400 py-6 text-center">
            No jobs are open for applications in this category right now.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-1">
            {visible.map(({ card }) => (
              <JobCard key={card.id} job={card} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
