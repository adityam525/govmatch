'use client';

import { useState } from 'react';
import JobCard, { type JobCardData } from '@/components/jobs/JobCard';
import TabFilterBar from './TabFilterBar';

export interface LatestJobItem {
  category: string;
  card: JobCardData;
}

// The grid follows this section's own width (container queries), so it stays
// tidy whether it has the full row or shares it with the Last Date Today panel.
export default function LatestJobsTabs({ items }: { items: LatestJobItem[] }) {
  const [activeTab, setActiveTab] = useState('all');
  const visible = activeTab === 'all' ? items : items.filter((item) => item.category === activeTab);

  return (
    <div className="@container">
      <TabFilterBar activeTab={activeTab} onChange={setActiveTab} />
      <div className="mt-4 overflow-y-auto" style={{ maxHeight: '1088px' }}>
        {visible.length === 0 ? (
          <p className="text-sm text-neutral-400 py-6 text-center">
            No jobs are open for applications in this category right now.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 pb-1 @md:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-4">
            {visible.map(({ card }) => (
              <JobCard key={card.id} job={card} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
