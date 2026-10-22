import { getPublishedJobs } from '@/lib/job-queries';
import { bestFitForJob, loadFitContext } from '@/lib/job-fit';
import { daysBetween, todayIST } from '@/lib/job-status';

export interface Recommendation {
  id: string;
  slug: string;
  title: string;
  organization: string;
  orgShortName: string | null;
  orgLogoUrl: string | null;
  matchScore: number;
  eligible: boolean;
  bestPost: string | null;
  postCount: number;
  vacancies: number;
  opensOn: Date | null;
  lastDate: Date | null;
  daysLeft: number | null;
}

export interface RecommendationResult {
  status: 'ok' | 'no-profile';
  /** True when the profile lacks a qualification or date of birth, which most of the score depends on. */
  incomplete: boolean;
  strength: number;
  items: Recommendation[];
}

// One entry per job (best-fitting post), for jobs you can still act on: applications open,
// or opening soon. Eligible first, then best score, then soonest deadline.
export async function getRecommendations(userId: string): Promise<RecommendationResult> {
  const ctx = await loadFitContext(userId);
  if (!ctx.hasProfile) return { status: 'no-profile', incomplete: true, strength: 0, items: [] };

  const today = todayIST();
  const jobs = (await getPublishedJobs()).filter(
    (job) => (job.phase === 'LIVE' && job.applicationOpen) || job.phase === 'UPCOMING',
  );

  const items: Recommendation[] = [];
  for (const job of jobs) {
    const fit = bestFitForJob(ctx, job.posts);
    if (!fit) continue; // nothing to score without posts

    items.push({
      id: job.id,
      slug: job.slug,
      title: job.title,
      organization: job.organization?.name ?? 'Unknown',
      orgShortName: job.organization?.shortName ?? null,
      orgLogoUrl: job.organization?.logoUrl ?? null,
      matchScore: fit.evaluation.score,
      eligible: fit.evaluation.verdict === 'eligible',
      bestPost: fit.postTitle,
      postCount: fit.postCount,
      vacancies: job.vacancyTotal,
      opensOn: job.phase === 'UPCOMING' ? job.applicationStartDate : null,
      lastDate: job.applicationEndDate,
      daysLeft: job.applicationEndDate ? daysBetween(today, job.applicationEndDate) : null,
    });
  }

  items.sort((a, b) => {
    if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
    if (a.matchScore !== b.matchScore) return b.matchScore - a.matchScore;
    const aEnd = a.lastDate ? a.lastDate.getTime() : Infinity;
    const bEnd = b.lastDate ? b.lastDate.getTime() : Infinity;
    return aEnd - bEnd;
  });

  return { status: 'ok', incomplete: !ctx.profileComplete, strength: ctx.strength, items };
}
