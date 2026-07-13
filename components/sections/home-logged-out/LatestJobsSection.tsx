'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import SectionHeader from '@/components/ui/SectionHeader';
import JobListItem from '@/components/jobs/JobListItem';
import TabFilterBar from './TabFilterBar';
import ViewAllBanner from '@/components/shared/ViewAllBanner';
import { useJobSearch } from '@/features/jobs/hooks';

export default function LatestJobsSection() {
  const [activeTab, setActiveTab] = useState('all');
  const { jobs, loading } = useJobSearch({ category: activeTab });

  return (
    <Card padding="lg">
      <SectionHeader title="Latest Government Job Notifications" viewAllHref="/jobs" />
      <TabFilterBar activeTab={activeTab} onChange={setActiveTab} />
      <div className="mt-2">
        {loading ? (
          <p className="text-sm text-neutral-400 py-6 text-center">Loading...</p>
        ) : jobs.length === 0 ? (
          <p className="text-sm text-neutral-400 py-6 text-center">No jobs found.</p>
        ) : (
          jobs.slice(0, 4).map((job) => <JobListItem key={job.id} job={job} />)
        )}
      </div>
      <ViewAllBanner href="/jobs" label="View All Latest Jobs" />
    </Card>
  );
}
