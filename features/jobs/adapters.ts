import type { Job } from './types';
import { formatCalendarDate } from '@/lib/job-status';

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

// One Job per recruitment notification (not per post). Still returns an array
// so existing flatMap callers keep working.
export function notificationToJobs(notification: any): Job[] {
  const posts: any[] = notification.posts ?? [];
  const postVacancies = posts.reduce((sum, post) => sum + (post.vacancies ?? 0), 0);

  return [
    {
      id: notification.id,
      title: notification.title,
      org: notification.organization?.name ?? 'Unknown',
      orgIconName: ORG_ICONS[notification.organization?.shortName] ?? 'shield',
      category: CATEGORY_MAP[notification.organization?.category?.slug] ?? 'central',
      vacancies: posts.length > 0 ? postVacancies : (notification.totalVacancies ?? 0),
      lastDate: formatCalendarDate(notification.applicationEndDate),
      slug: notification.slug,
    },
  ];
}
