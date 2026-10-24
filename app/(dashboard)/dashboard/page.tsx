import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Bookmark,
  Briefcase,
  CheckCircle2,
  Circle,
  ClipboardList,
  Crown,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getRecommendations, type RecommendationResult } from '@/lib/recommendations';
import { isPremiumSubscription } from '@/lib/plan';
import { computeCompleteness } from '@/lib/profile-completeness';
import { formatShortDate } from '@/lib/job-status';
import RecommendedList from '@/components/sections/home/RecommendedList';
import PremiumDashboardCards from '@/components/dashboard/PremiumDashboardCards';

export const dynamic = 'force-dynamic';

const STAGES: { id: string; label: string; tone: string }[] = [
  { id: 'APPLIED', label: 'Applied', tone: 'bg-sky-50 text-sky-700' },
  { id: 'EXAM_SCHEDULED', label: 'Exam scheduled', tone: 'bg-amber-50 text-amber-700' },
  { id: 'RESULT_AWAITED', label: 'Result awaited', tone: 'bg-violet-50 text-violet-700' },
  { id: 'SELECTED', label: 'Selected', tone: 'bg-green-50 text-green-700' },
  { id: 'REJECTED', label: 'Not selected', tone: 'bg-neutral-100 text-neutral-600' },
];
const STAGE_BY_ID = new Map(STAGES.map((stage) => [stage.id, stage]));

async function loadPicks(userId: string): Promise<RecommendationResult | null> {
  try {
    return await getRecommendations(userId);
  } catch (error) {
    console.error('Dashboard: could not load recommendations', error);
    return null;
  }
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3">
        <h2 className="text-sm font-bold text-neutral-900">{title}</h2>
        {action && (
          <Link href={action.href} className="text-xs font-medium text-primary-600 hover:underline">
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Kpi({
  icon,
  tint,
  value,
  label,
  href,
}: {
  icon: React.ReactNode;
  tint: string;
  value: string;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-neutral-300 hover:shadow-md"
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tint}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xl font-bold leading-none text-neutral-900">{value}</p>
        <p className="mt-1 truncate text-xs text-neutral-500">{label}</p>
      </div>
    </Link>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-8 text-center text-xs leading-relaxed text-neutral-500">{children}</div>;
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect('/login');

  const [user, profile, savedCount, applications, picks] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        role: true,
        subscription: { select: { plan: true, status: true, expiresAt: true } },
      },
    }),
    prisma.userProfile.findUnique({
      where: { userId },
      include: { preferredRoles: { select: { id: true } } },
    }),
    prisma.savedJob.count({ where: { userId } }),
    prisma.application.findMany({ where: { userId }, orderBy: { appliedAt: 'desc' } }),
    loadPicks(userId),
  ]);

  const recent = applications.slice(0, 5);
  const recentJobs = recent.length
    ? await prisma.notification.findMany({
        where: { id: { in: recent.map((a) => a.notificationId) } },
        select: { id: true, title: true, slug: true, organization: { select: { name: true } } },
      })
    : [];
  const jobById = new Map(recentJobs.map((job) => [job.id, job]));

  const stageCounts = new Map<string, number>();
  for (const application of applications) {
    stageCounts.set(application.status, (stageCounts.get(application.status) ?? 0) + 1);
  }

  const educationCount = await prisma.userEducation.count({ where: { userId } });
  const completenessResult = computeCompleteness({
    dateOfBirth: profile?.dateOfBirth ?? null,
    educationCount,
    category: profile?.category ?? null,
    gender: profile?.gender ?? null,
    phoneNumber: profile?.phoneNumber ?? null,
    preferenceCount: (profile?.preferredRoles.length ?? 0) + (profile?.preferredEmploymentTypes.length ?? 0),
  });
  const checklist = completenessResult.items;
  const doneCount = checklist.filter((item) => item.done).length;
  const completeness = completenessResult.percent;

  const premium = isPremiumSubscription(user?.subscription);
  const fits = (picks?.items ?? []).filter((item) => item.eligible);
  const topMatches = fits.slice(0, 5);
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  let matchesBody: React.ReactNode;
  if (!picks) {
    matchesBody = <Note>Your matches could not be loaded just now. Please refresh in a moment.</Note>;
  } else if (picks.status === 'no-profile' || picks.incomplete) {
    matchesBody = (
      <Note>
        Add your qualification and date of birth to see jobs that fit you.{' '}
        <Link href="/profile" className="font-semibold text-primary-600 underline">
          Complete profile
        </Link>
      </Note>
    );
  } else if (topMatches.length === 0) {
    matchesBody = <Note>No open jobs match your profile right now. New ones appear here as soon as they are posted.</Note>;
  } else {
    matchesBody = <RecommendedList items={topMatches} />;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-neutral-900">Welcome back, {firstName}</h1>
          <p className="mt-1 text-sm text-neutral-600">Here is where your job search stands today.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {premium ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700">
              <Crown size={13} />
              Premium
              {user?.subscription?.expiresAt ? ` until ${formatShortDate(user.subscription.expiresAt)}` : ''}
            </span>
          ) : (
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              <Crown size={13} className="text-amber-500" />
              Free plan - see Premium
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              <ShieldCheck size={13} />
              Admin panel
            </Link>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Kpi icon={<Briefcase size={18} />} tint="bg-green-50 text-success" value={picks && picks.status === 'ok' && !picks.incomplete ? String(fits.length) : '-'} label="Open jobs that fit you" href="/jobs?sort=relevance" />
        <Kpi icon={<Bookmark size={18} />} tint="bg-violet-50 text-violet-600" value={String(savedCount)} label="Saved jobs" href="/saved-jobs" />
        <Kpi icon={<ClipboardList size={18} />} tint="bg-amber-50 text-amber-600" value={String(applications.length)} label="Applications tracked" href="/applications" />
        <Kpi icon={<TrendingUp size={18} />} tint="bg-primary-50 text-primary-600" value={`${completeness}%`} label="Profile complete" href="/profile" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="min-w-0 space-y-6 xl:col-span-2">
          <Panel title="Top matches" action={{ href: '/jobs?sort=relevance', label: 'See all' }}>
            {matchesBody}
          </Panel>

          <Panel title="Application tracker" action={{ href: '/applications', label: 'Manage' }}>
            {applications.length === 0 ? (
              <Note>
                You are not tracking any applications yet. Open a job and mark it as applied to follow it here.
              </Note>
            ) : (
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {STAGES.map((stage) => (
                    <span key={stage.id} className={`rounded-full px-3 py-1 text-xs font-medium ${stage.tone}`}>
                      {stage.label}: {stageCounts.get(stage.id) ?? 0}
                    </span>
                  ))}
                </div>
                <div className="mt-4 divide-y divide-neutral-100">
                  {recent.map((application) => {
                    const job = jobById.get(application.notificationId);
                    const stage = STAGE_BY_ID.get(application.status);
                    return (
                      <div key={application.id} className="flex items-center justify-between gap-3 py-2.5">
                        <div className="min-w-0">
                          {job ? (
                            <Link href={`/jobs/${job.slug}`} className="block truncate text-sm font-medium text-neutral-900 hover:text-primary-700">
                              {job.title}
                            </Link>
                          ) : (
                            <p className="truncate text-sm text-neutral-500">This job is no longer listed</p>
                          )}
                          <p className="truncate text-xs text-neutral-500">
                            {job?.organization?.name ?? ''}
                            {job ? ' · ' : ''}applied {formatShortDate(application.appliedAt)}
                          </p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${stage?.tone ?? 'bg-neutral-100 text-neutral-600'}`}>
                          {stage?.label ?? application.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Panel>
        </div>

        <div className="min-w-0 space-y-6">
          <Panel title="Complete your profile">
            <div className="p-4">
              <div className="flex items-center justify-betwee text-xs text-neutral-600">
                <span>
                  {doneCount} of {checklist.length} done
                </span>
                <span className="font-semibold text-neutral-900">{completeness}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100">
                <div className="h-full rounded-full bg-primary-600" style={{ width: `${completeness}%` }} />
              </div>
              <ul className="mt-4 space-y-2">
                {checklist.map((item) => (
                  <li key={item.label} className="flex items-center gap-2 text-xs">
                    {item.done ? (
                      <CheckCircle2 size={15} className="shrink-0 text-success" />
                    ) : (
                      <Circle size={15} className="shrink-0 text-neutral-300" />
                    )}
                    <span className={item.done ? 'text-neutral-400 line-through' : 'text-neutral-800'}>{item.label}</span>
                  </li>
                ))}
              </ul>
              {doneCount < checklist.length && (
                <Link
                  href="/profile"
                  className="mt-4 block rounded-lg bg-primary-600 px-4 py-2.5 text-center text-xs font-semibold text-white hover:bg-primary-700"
                >
                  Update profile
                </Link>
              )}
            </div>
          </Panel>

          {premium ? (
            <PremiumDashboardCards />
          ) : (
            <Panel title="Deadline reminders">
              <div className="p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900">
                  <Crown size={13} className="text-amber-500" />
                  Premium
                </p>
                <p className="mt-1 text-xs leading-relaxed text-neutral-600">
                  See which of your saved jobs close in the next two weeks, soonest first.
                </p>
                <Link
                  href="/pricing"
                  className="mt-3 block rounded-lg border border-neutral-200 px-4 py-2 text-center text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  See plans
                </Link>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
