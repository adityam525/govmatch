import { getPublishedJobs } from '@/lib/job-queries';
import { bestFitForJob, loadFitContext } from '@/lib/job-fit';

// Jobs open for applications right now where the user is fully eligible and the score is 100.
// Upcoming and closed jobs are not counted.
export async function countPerfectMatches(userId: string): Promise<{ count: number; profileComplete: boolean }> {
  const ctx = await loadFitContext(userId);
  if (!ctx.hasProfile || !ctx.profileComplete) return { count: 0, profileComplete: false };
  const jobs = (await getPublishedJobs()).filter((job) => job.phase === 'LIVE' && job.applicationOpen);
  let count = 0;
  for (const job of jobs) {
    const fit = bestFitForJob(ctx, job.posts);
    if (fit && fit.evaluation.verdict === 'eligible' && fit.evaluation.score >= 100) count++;
  }
  return { count, profileComplete: true };
}
