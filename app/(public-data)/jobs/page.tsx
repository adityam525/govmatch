'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useJobSearch } from '@/features/jobs/hooks';
import { useJobMatches } from '@/features/matching/hooks';
import JobListItem from '@/components/jobs/JobListItem';
import JobFiltersSidebar from '@/components/jobs/JobFiltersSidebar';
import Card from '@/components/ui/Card';
import SectionHeader from '@/components/ui/SectionHeader';

function JobsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get('search') ?? '';
  const category = searchParams.get('category') ?? 'all';
  const qualifications = searchParams.get('qualifications')?.split(',').filter(Boolean) ?? [];
  const organizations = searchParams.get('organizations')?.split(',').filter(Boolean) ?? [];

  const { jobs, loading } = useJobSearch({
    query,
    category,
    qualificationSlugs: qualifications,
    organizationIds: organizations,
  });
  const { matches } = useJobMatches();

  const matchByJobId = new Map<string, number>();
  matches.forEach((m) => {
    matchByJobId.set(m.postId, m.matchScore);
    matchByJobId.set(m.notificationId, m.matchScore);
  });

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <div className="grid lg:grid-cols-10 gap-6 items-start">
      <div className="lg:col-span-3 lg:sticky lg:top-20">
        <JobFiltersSidebar
          selectedCategory={category}
          onCategoryChange={(c) => updateParams({ category: c === 'all' ? '' : c })}
          selectedQualifications={qualifications}
          onQualificationsChange={(q) => updateParams({ qualifications: q.join(',') })}
          selectedOrganizations={organizations}
          onOrganizationsChange={(o) => updateParams({ organizations: o.join(',') })}
        />
      </div>

      <div className="lg:col-span-7">
        <Card padding="lg">
          <SectionHeader
            title={query ? `Search results for "${query}"` : 'All Government Jobs'}
            description={`${jobs.length} job${jobs.length !== 1 ? 's' : ''} found`}
          />

          {loading ? (
            <p className="text-sm text-neutral-600 py-8 text-center">Loading jobs...</p>
          ) : jobs.length === 0 ? (
            <p className="text-sm text-neutral-600 py-8 text-center">No jobs found. Try adjusting your filters.</p>
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
      </div>
    </div>
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
