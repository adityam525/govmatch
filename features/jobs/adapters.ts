import type { Job } from './types';

export function notificationToJobs(notification: any): Job[] {
  const orgIconMap: Record<string, Job['orgIconName']> = {
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

  const categoryMap: Record<string, Job['category']> = {
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

  const lastDate = notification.applicationEndDate
    ? new Date(notification.applicationEndDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'TBA';

  const orgIconName = orgIconMap[notification.organization?.shortName] ?? 'shield';
  const category = categoryMap[notification.organization?.category?.slug] ?? 'central';

  if (!notification.posts || notification.posts.length === 0) {
    return [{
      id: notification.id,
      title: notification.title,
      org: notification.organization?.name ?? 'Unknown',
      orgIconName,
      category,
      vacancies: notification.totalVacancies ?? 0,
      lastDate,
      slug: notification.slug,
    }];
  }

  return notification.posts.map((post: any) => ({
    id: post.id,
    title: `${notification.title} - ${post.title}`,
    org: notification.organization?.name ?? 'Unknown',
    orgIconName,
    category,
    vacancies: post.vacancies ?? 0,
    lastDate,
    slug: notification.slug,
  }));
}
