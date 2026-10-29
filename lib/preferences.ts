import { prisma } from '@/lib/prisma';

export interface PreferenceSets {
  states: Set<string>;
  sectors: Set<string>;
  organizations: Set<string>;
}

export async function loadPreferenceSets(userId: string): Promise<PreferenceSets> {
  const p = await prisma.userProfile.findUnique({
    where: { userId },
    select: { preferredStateCodes: true, preferredSectorSlugs: true, preferredOrganizationSlugs: true },
  });
  return {
    states: new Set(p?.preferredStateCodes ?? []),
    sectors: new Set(p?.preferredSectorSlugs ?? []),
    organizations: new Set(p?.preferredOrganizationSlugs ?? []),
  };
}

export interface JobPlaces {
  organizationSlug?: string | null;
  sectorSlug?: string | null;
  stateCodes?: string[];
}

/** True when the job is in a state, sector or organization the user prefers. */
export function jobMatchesPreferences(job: JobPlaces, prefs: PreferenceSets): boolean {
  return (
    (!!job.organizationSlug && prefs.organizations.has(job.organizationSlug)) ||
    (!!job.sectorSlug && prefs.sectors.has(job.sectorSlug)) ||
    (job.stateCodes ?? []).some((code) => prefs.states.has(code))
  );
}

export const PREFERENCE_BONUS = 10;
