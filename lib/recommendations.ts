import { prisma } from '@/lib/prisma';
import { computeMatch } from '@/features/matching/engine';
import { getPublishedJobs, type PublishedJob } from '@/lib/job-queries';
import { daysBetween, todayIST } from '@/lib/job-status';

type Post = PublishedJob['posts'][number];

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
  /** True when the profile lacks a qualification or date of birth, which are most of the score. */
  incomplete: boolean;
  strength: number;
  items: Recommendation[];
}

// A post can accept several qualifications (any one is enough), so the lowest
// level is the real entry bar.
function lowestQualificationLevel(post: Post): number | null {
  const levels = [...post.qualifications, ...(post.qualification ? [post.qualification] : [])].map((q) => q.level);
  return levels.length > 0 ? Math.min(...levels) : null;
}

// One entry per job (best-fitting post), for jobs you can still act on:
// applications open, or opening soon. Eligible first, then best score, then soonest deadline.
export async function getRecommendations(userId: string): Promise<RecommendationResult> {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    include: { preferredRoles: true },
  });
  if (!profile) return { status: 'no-profile', incomplete: true, strength: 0, items: [] };

  const qualification = profile.qualificationId
    ? await prisma.qualification.findUnique({ where: { id: profile.qualificationId } })
    : null;

  const user = {
    dateOfBirth: profile.dateOfBirth,
    category: profile.category,
    qualificationLevel: qualification?.level ?? null,
    branchId: profile.branchId,
    preferredRoleIds: profile.preferredRoles.map((role) => role.id),
    preferredEmploymentTypes: profile.preferredEmploymentTypes,
  };

  const today = todayIST();
  const jobs = (await getPublishedJobs()).filter(
    (job) => (job.phase === 'LIVE' && job.applicationOpen) || job.phase === 'UPCOMING',
  );

  const items: Recommendation[] = [];
  for (const job of jobs) {
    if (job.posts.length === 0) continue; // nothing to score without posts

    let best: { post: Post; score: number; eligible: boolean } | null = null;
    for (const post of job.posts) {
      const result = computeMatch(user, {
        minAge: post.minAge,
        maxAge: post.maxAge,
        qualificationLevel: lowestQualificationLevel(post),
        branchIds: post.branches.map((branch) => branch.id),
        roleIds: post.roles.map((role) => role.id),
        employmentType: post.employmentType,
      });
      const better =
        !best ||
        (result.eligible && !best.eligible) ||
        (result.eligible === best.eligible && result.score > best.score);
      if (better) best = { post, score: result.score, eligible: result.eligible };
    }
    if (!best) continue;

    items.push({
      id: job.id,
      slug: job.slug,
      title: job.title,
      organization: job.organization?.name ?? 'Unknown',
      orgShortName: job.organization?.shortName ?? null,
      orgLogoUrl: job.organization?.logoUrl ?? null,
      matchScore: best.score,
      eligible: best.eligible,
      bestPost: best.post.title,
      postCount: job.posts.length,
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

  return {
    status: 'ok',
    incomplete: !profile.qualificationId || !profile.dateOfBirth,
    strength: profile.profileStrength,
    items,
  };
}
