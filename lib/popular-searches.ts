import { getPublishedJobs, type PublishedJob } from '@/lib/job-queries';

const RECENT_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

// When fewer organizations than requested have jobs listed in the window, fill
// the rest with the organizations that have the most open jobs overall.
const FILL_WITH_ACTIVE = true;

export interface PopularOrganization {
  slug: string;
  label: string;
  jobs: number;
  vacancies: number;
}

function tally(jobs: PublishedJob[]): PopularOrganization[] {
  const map = new Map<string, PopularOrganization>();
  for (const job of jobs) {
    const org = job.organization;
    if (!org?.slug) continue;
    const entry = map.get(org.slug) ?? {
      slug: org.slug,
      label: org.shortName || org.name,
      jobs: 0,
      vacancies: 0,
    };
    entry.jobs += 1;
    entry.vacancies += job.vacancyTotal;
    map.set(org.slug, entry);
  }
  return [...map.values()].sort(
    (a, b) => b.jobs - a.jobs || b.vacancies - a.vacancies || a.label.localeCompare(b.label),
  );
}

export async function getPopularOrganizations(limit = 5): Promise<PopularOrganization[]> {
  const jobs = (await getPublishedJobs()).filter((job) => job.phase !== 'CANCELLED');
  const cutoff = Date.now() - RECENT_DAYS * DAY_MS;

  const picked = tally(jobs.filter((job) => job.createdAt.getTime() >= cutoff)).slice(0, limit);

  if (FILL_WITH_ACTIVE && picked.length < limit) {
    const have = new Set(picked.map((p) => p.slug));
    const active = tally(jobs.filter((job) => job.phase === 'LIVE' || job.phase === 'UPCOMING')).filter(
      (t) => !have.has(t.slug),
    );
    picked.push(...active.slice(0, limit - picked.length));
  }

  return picked;
}
