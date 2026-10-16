import type { Job } from './types';
import { formatCalendarDate, todayIST } from '@/lib/job-status';

const ORG_ICONS: Record<string, Job['orgIconName']> = {
  SSC: 'crown',
  RRB: 'train',
  IBPS: 'landmark',
  UPSC: 'crown',
  IAF: 'shield',
  NAVY: 'shield',
  DSSSB: 'landmark',
  ISRO: 'shield',
  IOCL: 'shield',
  DRDO: 'shield',
};

const CATEGORY_MAP: Record<string, Job['category']> = {
  ssc: 'central',
  railway: 'central',
  banking: 'banking',
  upsc: 'central',
  'state-government': 'state',
  defence: 'defence',
  psu: 'psu',
  'police-security': 'defence',
  teaching: 'teaching',
  healthcare: 'central',
  'judiciary-law': 'central',
  agriculture: 'central',
};

// A short note for jobs that are not simply "apply now".
function phaseLabelFor(notification: any, today: Date): string | null {
  if (notification.status === 'CANCELLED') return 'Cancelled';
  if (notification.status === 'CLOSED') return 'Closed';

  const start = notification.applicationStartDate ? new Date(notification.applicationStartDate) : null;
  const end = notification.applicationEndDate ? new Date(notification.applicationEndDate) : null;

  if (start && start > today) return `Opens ${formatCalendarDate(start)}`;
  if (!start && notification.status === 'UPCOMING') return 'Dates awaited';
  if (end && end < today) return 'Applications closed';
  return null;
}

// One Job per recruitment notification (not per post). Still returns an array
// so existing flatMap callers keep working.
export function notificationToJobs(notification: any): Job[] {
  const posts: any[] = notification.posts ?? [];
  const postVacancies = posts.reduce((sum, post) => sum + (post.vacancies ?? 0), 0);
  const end = notification.applicationEndDate ? new Date(notification.applicationEndDate) : null;

  return [
    {
      id: notification.id,
      title: notification.title,
      org: notification.organization?.name ?? 'Unknown',
      orgShortName: notification.organization?.shortName ?? null,
      orgLogoUrl: notification.organization?.logoUrl ?? null,
      orgIconName: ORG_ICONS[notification.organization?.shortName] ?? 'shield',
      category: CATEGORY_MAP[notification.organization?.category?.slug] ?? 'central',
      vacancies: posts.length > 0 ? postVacancies : (notification.totalVacancies ?? 0),
      lastDate: formatCalendarDate(end),
      deadline: end ? end.toISOString() : null,
      createdAt: notification.createdAt ? new Date(notification.createdAt).toISOString() : undefined,
      phaseLabel: phaseLabelFor(notification, todayIST()),
      slug: notification.slug,
    },
  ];
}
