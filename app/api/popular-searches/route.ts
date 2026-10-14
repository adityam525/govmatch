import { NextResponse } from 'next/server';
import { getPublishedJobs } from '@/lib/job-queries';

// Organizations behind the most recently published jobs that are still active.
export async function GET() {
  const jobs = (await getPublishedJobs())
    .filter((job) => job.phase === 'LIVE' || job.phase === 'UPCOMING')
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const seen = new Set<string>();
  const popular: { label: string; query: string }[] = [];
  for (const job of jobs) {
    const shortName = job.organization?.shortName;
    if (!shortName || seen.has(shortName)) continue;
    seen.add(shortName);
    popular.push({ label: shortName, query: shortName });
    if (popular.length >= 6) break;
  }

  return NextResponse.json(popular);
}
