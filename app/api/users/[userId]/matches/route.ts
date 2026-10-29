import { NextResponse } from 'next/server';
import { requireSelf } from '@/lib/require-user';
import { getPublishedJobs } from '@/lib/job-queries';
import { evaluatePost, loadFitContext, type Evaluation } from '@/lib/job-fit';
import { ageInYears } from '@/lib/eligibility-reasons';

interface Params { params: Promise<{ userId: string }> }

// The old response shape, rebuilt from the new checks so existing callers keep working.
function legacyBreakdown(evaluation: Evaluation, dateOfBirth: Date | null) {
  const find = (label: string) => evaluation.checks.find((c) => c.label === label);
  const qualification = find('Qualification');
  const age = find('Age');
  const field = find('Field');
  const role = find('Role');
  return {
    qualification: { match: !qualification || qualification.state === 'ok', weight: 40 },
    age: { match: !age || age.state === 'ok', weight: 30, userAge: dateOfBirth ? ageInYears(dateOfBirth) : null },
    branch: { match: field?.state === 'ok', weight: 20, applicable: !!field },
    role: { match: role?.state === 'ok', weight: 10, applicable: !!role },
  };
}

const rank = (verdict: string) => (verdict === 'eligible' ? 2 : verdict === 'unknown' ? 1 : 0);

export async function GET(request: Request, { params }: Params) {
  const { userId } = await params;
  const guard = await requireSelf(userId);
  if (!guard.ok) return guard.response;

  try {
    const ctx = await loadFitContext(userId);
    if (!ctx.hasProfile) {
      return NextResponse.json({ message: 'No profile found for this user' }, { status: 404 });
    }

    const jobs = (await getPublishedJobs()).filter(
      (job) => (job.phase === 'LIVE' && job.applicationOpen) || job.phase === 'UPCOMING',
    );

    const matches = jobs.flatMap((job) =>
      job.posts.map((post) => {
        const evaluation = evaluatePost(ctx, post as any);
        return {
          notificationId: job.id,
          notificationTitle: job.title,
          slug: job.slug,
          organization: job.organization?.name,
          postId: post.id,
          postTitle: post.title,
          vacancies: post.vacancies,
          applicationEndDate: job.applicationEndDate,
          matchScore: evaluation.score,
          eligible: evaluation.verdict === 'eligible',
          verdict: evaluation.verdict,
          label: evaluation.label,
          checks: evaluation.checks,
          breakdown: legacyBreakdown(evaluation, ctx.user.dateOfBirth),
        };
      }),
    );

    // Clear yes first, then "add details to check", then the rest; best score first within each.
    matches.sort((a, b) => rank(b.verdict) - rank(a.verdict) || b.matchScore - a.matchScore);

    return NextResponse.json(matches);
  } catch (error) {
    console.error('Failed to compute matches:', error);
    return NextResponse.json({ message: 'Failed to compute matches' }, { status: 500 });
  }
}
