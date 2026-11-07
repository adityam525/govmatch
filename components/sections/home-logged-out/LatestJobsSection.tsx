import SectionHeader from '@/components/ui/SectionHeader';
import ViewAllBanner from '@/components/shared/ViewAllBanner';
import type { JobCardData } from '@/components/jobs/JobCard';
import { getPublishedJobs } from '@/lib/job-queries';
import { daysBetween, formatCalendarDate, todayIST } from '@/lib/job-status';
import { getRecentlyPostponedJobIds } from '@/lib/schedule-queries';
import LatestJobsTabs, { type LatestJobItem } from './LatestJobsTabs';

const CATEGORY_TABS: Record<string, string> = {
  ssc: 'central', railway: 'central', banking: 'banking', upsc: 'central',
  'state-government': 'state', defence: 'defence', psu: 'psu', 'police-security': 'defence',
  teaching: 'teaching', healthcare: 'central', 'judiciary-law': 'central', agriculture: 'central',
};

const MAX_JOBS = 40;
const MAX_CARDS = 80;
const NEW_FOR_DAYS = 14;

function unique(values: (string | null | undefined)[]): string[] {
  return [...new Set(values.filter((v): v is string => !!v))];
}
const shortList = (names: string[]) =>
  names.length === 0 ? null : names.length <= 2 ? names.join(', ') : `${names.slice(0, 2).join(', ')} +${names.length - 2}`;

// One card per post of each open notice. A notice with no posts stays one card.
// The homepage may still pass an old `initialNotifications` prop. It is ignored.
export default async function LatestJobsSection(_props: Record<string, unknown>) {
  const today = todayIST();
  const postponed = await getRecentlyPostponedJobIds().catch(() => new Set<string>());

  const jobs = (await getPublishedJobs())
    .filter((job) => job.phase === 'LIVE' && job.applicationOpen)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, MAX_JOBS);

  const items: LatestJobItem[] = jobs
    .flatMap((job): LatestJobItem[] => {
      const end = job.applicationEndDate;
      const daysLeft = end ? daysBetween(today, end) : null;
      const isNew = Date.now() - job.createdAt.getTime() < NEW_FOR_DAYS * 24 * 60 * 60 * 1000;
      const badge: JobCardData['badge'] = postponed.has(job.id) ? 'POSTPONED' : isNew ? 'NEW' : daysLeft !== null && daysLeft <= 3 ? 'HOT' : null;
      const category = CATEGORY_TABS[job.organization?.category?.slug ?? ''] ?? 'central';
      const base = {
        title: job.title,
        org: job.organization?.name ?? 'Unknown',
        orgShortName: job.organization?.shortName ?? null,
        orgLogoUrl: job.organization?.logoUrl ?? null,
        slug: job.slug,
        lastDate: formatCalendarDate(end),
        daysLeft,
        badge,
      };

      if (job.posts.length === 0) {
        return [{ category, card: { ...base, id: job.id, vacancies: job.vacancyTotal, payScale: null, qualificationName: null } }];
      }
      return job.posts.map((post) => ({
        category,
        card: {
          ...base,
          id: job.id + ':' + post.id,
          postTitle: post.title,
          vacancies: post.vacancies,
          payScale: post.payScale ?? null,
          qualificationName: shortList(unique([...post.qualifications.map((q) => q.name), post.qualification?.name])),
        },
      }));
    })
    .slice(0, MAX_CARDS);

  return (
    <section>
      <SectionHeader title="Latest Government Job Notifications" description="Open for applications now, newest first" viewAllHref="/jobs" />
      <LatestJobsTabs items={items} />
      <ViewAllBanner href="/jobs" label="View All Latest Jobs" />
    </section>
  );
}
