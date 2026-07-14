'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useJobSearch } from '@/features/jobs/hooks';
import { useJobMatches } from '@/features/matching/hooks';
import JobListItem from '@/components/jobs/JobListItem';
import Card from '@/components/ui/Card';
import SectionHeader from '@/components/ui/SectionHeader';

function JobsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('search') ?? '';
  const category = searchParams.get('category') ?? 'all';

  const { jobs, loading } = useJobSearch({ query, category });
  const { matches } = useJobMatches();

  const matchByJobId = new Map<string, number>();
  matches.forEach((m) => {
    matchByJobId.set(m.postId, m.matchScore);
    matchByJobId.set(m.notificationId, m.matchScore);
  });

  return (
    <Card padding="lg">
      <SectionHeader title={query ? `Search results for "${query}"` : 'All Government Jobs'} />

      {loading ? (
        <p className="text-sm text-neutral-600 py-8 text-center">Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <p className="text-sm text-neutral-600 py-8 text-center">No jobs found. Try a different search term.</p>
      ) : (
        <div>
          {jobs.map((job) => (
            <div key={job.id} className="relative">
              <JobListItem job={job} />
              {matchByJobId.has(job.id) && (
                <span className="absolute top-4 right-32 text-xs font-bold text-success bg-green-50 px-2 py-0.5 rounded-full">
                  {matchByJobId.get(job.id)}% Match
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function JobsPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <Suspense fallback={<div className="text-sm text-neutral-600 py-8 text-center">Loading...</div>}>
        <JobsContent />
      </Suspense>
    </div>
  );
}
