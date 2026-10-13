import SectionHeader from '@/components/ui/SectionHeader';
import ViewAllBanner from '@/components/shared/ViewAllBanner';
import type { JobCardData } from '@/components/jobs/JobCard';
import { getPublishedJobs } from '@/lib/job-queries';
import { daysBetween, formatCalendarDate, todayIST } from '@/lib/job-status';
import LatestJobsTabs, { type LatestJobItem } from './LatestJobsTabs';

const ORG_ICONS: Record<string, string> = {
  SSC: 'crown', RRB: 'train', IBPS: 'landmark', UPSC: 'crown',
  IAF: 'shield', NAVY: 'shield', DSSSB: 'landmark', ISRO: 'shield', IOCL: 'shield',
};

const CATEGORY_TABS: Record<string, string> = {
  ssc: 'central', railway: 'central', banking: 'banking', upsc: 'central',
  'state-government': 'state', defence: 'defence', psu: 'psu', 'police-security': 'defence',
  teaching: 'teaching', healthcare: 'central', 'judiciary-law': 'central', agriculture: 'central',
};

const MAX_CARDS = 40;
const NEW_FOR_DAYS = 14;

function unique(values: (string | null | undefined)[]): string[] {
  return [...new Set(values.filter((v): v is string => !!v))];
}

// The homepage still passes the old `initialNotifications` prop. It is ignored:
// this section now reads jobs itself and shows one card per job (not per post).
export default async function LatestJobsSection(_props: Record<string, unknown>) {
  const today = todayIST();

  const jobs = (await getPublishedJobs())
    .filter((job) => job.phase === 'LIVE' && job.applicationOpen)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, MAX_CARDS);

  const items: LatestJobItem[] = jobs.map((job) => {
    const end = job.applicationEndDate;
    const daysLeft = end ? daysBetween(today, end) : null;
    const isNew = Date.now() - job.createdAt.getTime() < NEW_FOR_DAYS * 24 * 60 * 60 * 1000;
    const badge: JobCardData['badge'] = isNew ? 'NEW' : daysLeft !== null && daysLeft <= 3 ? 'HOT' : null;

    const qualifications = unique(job.posts.flatMap((post) => post.qualifications.map((q) => q.name)));
    const payScales = unique(job.posts.map((post) => post.payScale));

    return {
      category: CATEGORY_TABS[job.organization?.category?.slug ?? ''] ?? 'central',
      card: {
        id: job.id,
        title: job.title,
        org: job.organization?.name ?? 'Unknown',
        orgIconName: ORG_ICONS[job.organization?.shortName ?? ''] ?? 'shield',
        slug: job.slug,
        vacancies: job.vacancyTotal,
        lastDate: formatCalendarDate(end),
        daysLeft,
        payScale: payScales.length === 1 ? payScales[0] : null,
        qualificationName:
          qualifications.length === 0
            ? null
            : qualifications.length <= 2
              ? qualifications.join(', ')
              : `${qualifications.slice(0, 2).join(', ')} +${qualifications.length - 2}`,
        badge,
      },
    };
  });

  return (
    <section>
      <SectionHeader
        title="Latest Government Job Notifications"
        description="Open for applications now, newest first"
        viewAllHref="/jobs"
      />
      <LatestJobsTabs items={items} />
      <ViewAllBanner href="/jobs" label="View All Latest Jobs" />
    </section>
  );
}
