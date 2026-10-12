import { EmploymentType, ApplicationMode, NotificationStatus, LinkType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { validateNotificationDates } from '@/features/jobs/validation';

export const MAX_JOBS_PER_IMPORT = 100;

const EMPLOYMENT_TYPES = ['PERMANENT', 'CONTRACT', 'APPRENTICE', 'INTERNSHIP', 'TEMPORARY', 'DEPUTATION'];
const APPLICATION_MODES = ['ONLINE', 'OFFLINE', 'BOTH'];
const STATUSES = ['UPCOMING', 'LIVE', 'CLOSED', 'CANCELLED'];
const LINK_TYPES = [
  'APPLY_ONLINE', 'NOTIFICATION_PDF', 'OFFICIAL_WEBSITE', 'ADMIT_CARD',
  'RESULT', 'SYLLABUS', 'SHORT_NOTICE', 'OTHER',
];

export type RowStatus = 'created' | 'valid' | 'duplicate' | 'error';

export interface ImportRowResult {
  index: number;
  title: string;
  status: RowStatus;
  messages: string[];
  id?: string;
}

type IdMap = Map<string, string>;
interface Lookups { orgs: IdMap; states: IdMap; quals: IdMap; branches: IdMap; roles: IdMap; }

interface PreparedPost {
  title: string;
  vacancies: number;
  minAge: number | null;
  maxAge: number | null;
  payScale: string | null;
  employmentType: EmploymentType;
  qualificationIds: string[];
  branchIds: string[];
  roleId: string | null;
}

interface PreparedJob {
  title: string;
  slug: string;
  organizationId: string;
  officialLink: string;
  advertisementNo: string | null;
  applicationMode: ApplicationMode;
  status: NotificationStatus;
  stateId: string | null;
  notificationDate: Date | null;
  applicationStartDate: Date | null;
  applicationEndDate: Date | null;
  examDate: Date | null;
  howToApply: string | null;
  directEligibility: string | null;
  selectionProcess: string[];
  fees: { categoryLabel: string; amount: string }[];
  links: { label: string; url: string; linkType: LinkType }[];
  importantDates: { label: string; date: Date }[];
  faqs: { question: string; answer: string }[];
  posts: PreparedPost[];
  totalVacancies: number;
}

const clean = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const norm = (v: string): string => v.trim().toLowerCase();
const slugify = (s: string): string =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const asArray = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

function isIsoDate(v: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(v);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

function isHttpUrl(v: string): boolean {
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function parseAge(value: unknown, field: string, errors: string[]): number | null {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > 100) {
    errors.push(`${field} must be a whole number between 0 and 100`);
    return null;
  }
  return n;
}

function buildMap<T extends { id: string }>(items: T[], keys: (item: T) => string[]): IdMap {
  const map: IdMap = new Map();
  for (const item of items) {
    for (const k of keys(item)) {
      if (k) map.set(norm(k), item.id);
    }
  }
  return map;
}

async function loadLookups(): Promise<Lookups> {
  const [orgs, states, quals, branches, roles] = await Promise.all([
    prisma.organization.findMany({ select: { id: true, name: true, shortName: true } }),
    prisma.state.findMany({ select: { id: true, name: true, code: true } }),
    prisma.qualification.findMany({ select: { id: true, name: true, slug: true } }),
    prisma.branch.findMany({ select: { id: true, name: true, slug: true } }),
    prisma.role.findMany({ select: { id: true, name: true, slug: true } }),
  ]);
  return {
    orgs: buildMap(orgs, (o) => [o.shortName, o.name]),
    states: buildMap(states, (s) => [s.name, s.code]),
    quals: buildMap(quals, (q) => [q.slug, q.name]),
    branches: buildMap(branches, (b) => [b.slug, b.name]),
    roles: buildMap(roles, (r) => [r.slug, r.name]),
  };
}

function prepareRow(
  raw: any,
  lookups: Lookups,
): { errors: string[]; warnings: string[]; job?: PreparedJob } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { errors: ['Each job must be a JSON object'], warnings };
  }

  const title = clean(raw.title);
  const slug = slugify(title);
  if (!title) errors.push('title is required');
  else if (title.length > 250) errors.push('title is too long (max 250 characters)');
  else if (!slug) errors.push('title must contain letters or numbers');

  const orgText = clean(raw.organization);
  let organizationId = '';
  if (!orgText) {
    errors.push('organization is required (short name or full name)');
  } else {
    const id = lookups.orgs.get(norm(orgText));
    if (!id) errors.push(`organization not found: "${orgText}"`);
    else organizationId = id;
  }

  const officialLink = clean(raw.officialLink);
  if (!officialLink) errors.push('officialLink is required');
  else if (!isHttpUrl(officialLink)) errors.push('officialLink must be a valid http(s) URL');

  const modeText = clean(raw.applicationMode).toUpperCase() || 'ONLINE';
  if (!APPLICATION_MODES.includes(modeText)) {
    errors.push(`applicationMode must be one of ${APPLICATION_MODES.join(', ')}`);
  }
  const statusText = clean(raw.status).toUpperCase() || 'LIVE';
  if (!STATUSES.includes(statusText)) {
    errors.push(`status must be one of ${STATUSES.join(', ')}`);
  }

  const dateKeys = ['notificationDate', 'applicationStartDate', 'applicationEndDate', 'examDate'] as const;
  const dates: Record<string, string> = {};
  for (const k of dateKeys) {
    const v = clean(raw[k]);
    if (!v) continue;
    if (!isIsoDate(v)) errors.push(`${k} must be a real date in YYYY-MM-DD format`);
    else dates[k] = v;
  }
  const dateError = validateNotificationDates({
    notificationDate: dates.notificationDate,
    applicationStartDate: dates.applicationStartDate,
    applicationEndDate: dates.applicationEndDate,
  });
  if (dateError) errors.push(dateError);
  if (!dates.applicationEndDate) {
    warnings.push('no applicationEndDate - it will show as "To Be Announced"');
  }

  const stateText = clean(raw.state);
  let stateId: string | null = null;
  if (stateText) {
    const id = lookups.states.get(norm(stateText));
    if (!id) errors.push(`state not found: "${stateText}"`);
    else stateId = id;
  }

  const advertisementNo = clean(raw.advertisementNo) || null;
  if (advertisementNo && advertisementNo.length > 100) errors.push('advertisementNo is too long (max 100)');
  const howToApply = clean(raw.howToApply) || null;
  if (howToApply && howToApply.length > 5000) errors.push('howToApply is too long (max 5000)');
  const directEligibility = clean(raw.directEligibility) || null;
  if (directEligibility && directEligibility.length > 2000) errors.push('directEligibility is too long (max 2000)');

  const selectionProcess = asArray(raw.selectionProcess).map(clean).filter(Boolean);

  const fees: PreparedJob['fees'] = [];
  asArray(raw.fees).forEach((f: any, i) => {
    const categoryLabel = clean(f?.category);
    const amount = clean(f?.amount);
    if (!categoryLabel || !amount) errors.push(`fees[${i}] needs both category and amount`);
    else fees.push({ categoryLabel, amount });
  });

  const links: PreparedJob['links'] = [];
  asArray(raw.links).forEach((l: any, i) => {
    const url = clean(l?.url);
    const type = clean(l?.type).toUpperCase() || 'OTHER';
    if (!url || !isHttpUrl(url)) {
      errors.push(`links[${i}].url must be a valid http(s) URL`);
      return;
    }
    if (!LINK_TYPES.includes(type)) {
      errors.push(`links[${i}].type must be one of ${LINK_TYPES.join(', ')}`);
      return;
    }
    links.push({ label: clean(l?.label) || type.replace(/_/g, ' '), url, linkType: type as LinkType });
  });

  const importantDates: PreparedJob['importantDates'] = [];
  asArray(raw.importantDates).forEach((d: any, i) => {
    const label = clean(d?.label);
    const date = clean(d?.date);
    if (!label || !isIsoDate(date)) {
      errors.push(`importantDates[${i}] needs a label and a real date (YYYY-MM-DD)`);
      return;
    }
    importantDates.push({ label, date: new Date(date) });
  });

  const faqs: PreparedJob['faqs'] = [];
  asArray(raw.faqs).forEach((f: any, i) => {
    const question = clean(f?.question);
    const answer = clean(f?.answer);
    if (!question || !answer) errors.push(`faqs[${i}] needs both question and answer`);
    else faqs.push({ question, answer });
  });

  const posts: PreparedPost[] = [];
  asArray(raw.posts).forEach((p: any, i) => {
    const label = `posts[${i}]`;
    const postTitle = clean(p?.title);
    if (!postTitle) {
      errors.push(`${label}.title is required`);
      return;
    }

    let vacancies = 0;
    if (p?.vacancies !== undefined && p?.vacancies !== null && p?.vacancies !== '') {
      const n = Number(p.vacancies);
      if (!Number.isInteger(n) || n < 0) errors.push(`${label}.vacancies must be a whole number`);
      else vacancies = n;
    }

    const minAge = parseAge(p?.minAge, `${label}.minAge`, errors);
    const maxAge = parseAge(p?.maxAge, `${label}.maxAge`, errors);
    if (minAge !== null && maxAge !== null && minAge > maxAge) {
      errors.push(`${label}: minAge cannot be greater than maxAge`);
    }

    const empText = clean(p?.employmentType).toUpperCase() || 'PERMANENT';
    if (!EMPLOYMENT_TYPES.includes(empText)) {
      errors.push(`${label}.employmentType must be one of ${EMPLOYMENT_TYPES.join(', ')}`);
    }

    const qualTexts = [...asArray(p?.qualifications), ...(p?.qualification ? [p.qualification] : [])]
      .map(clean)
      .filter(Boolean);
    const qualificationIds: string[] = [];
    if (qualTexts.length === 0) {
      errors.push(`${label} needs a qualification (name or slug)`);
    }
    for (const q of qualTexts) {
      const id = lookups.quals.get(norm(q));
      if (!id) errors.push(`${label}: qualification not found: "${q}"`);
      else if (!qualificationIds.includes(id)) qualificationIds.push(id);
    }

    const branchIds: string[] = [];
    for (const b of asArray(p?.branches).map(clean).filter(Boolean)) {
      const id = lookups.branches.get(norm(b));
      if (!id) errors.push(`${label}: branch not found: "${b}"`);
      else if (!branchIds.includes(id)) branchIds.push(id);
    }

    let roleId: string | null = null;
    const roleText = clean(p?.role);
    if (roleText) {
      const id = lookups.roles.get(norm(roleText));
      if (!id) errors.push(`${label}: role not found: "${roleText}"`);
      else roleId = id;
    }

    posts.push({
      title: postTitle,
      vacancies,
      minAge,
      maxAge,
      payScale: clean(p?.payScale) || null,
      employmentType: empText as EmploymentType,
      qualificationIds,
      branchIds,
      roleId,
    });
  });

  if (posts.length === 0 && !directEligibility) {
    warnings.push('no posts and no directEligibility - the job page will say eligibility is coming soon');
  }

  if (errors.length > 0) return { errors, warnings };

  const toDate = (v?: string) => (v ? new Date(v) : null);
  return {
    errors,
    warnings,
    job: {
      title,
      slug,
      organizationId,
      officialLink,
      advertisementNo,
      applicationMode: modeText as ApplicationMode,
      status: statusText as NotificationStatus,
      stateId,
      notificationDate: toDate(dates.notificationDate),
      applicationStartDate: toDate(dates.applicationStartDate),
      applicationEndDate: toDate(dates.applicationEndDate),
      examDate: toDate(dates.examDate),
      howToApply,
      directEligibility,
      selectionProcess,
      fees,
      links,
      importantDates,
      faqs,
      posts,
      totalVacancies: posts.reduce((sum, p) => sum + p.vacancies, 0),
    },
  };
}

async function createJob(job: PreparedJob) {
  return prisma.notification.create({
    data: {
      title: job.title,
      slug: job.slug,
      published: false,
      officialLink: job.officialLink,
      advertisementNo: job.advertisementNo,
      applicationMode: job.applicationMode,
      status: job.status,
      totalVacancies: job.totalVacancies,
      howToApply: job.howToApply,
      directEligibility: job.directEligibility,
      selectionProcess: job.selectionProcess,
      notificationDate: job.notificationDate,
      applicationStartDate: job.applicationStartDate,
      applicationEndDate: job.applicationEndDate,
      examDate: job.examDate,
      organization: { connect: { id: job.organizationId } },
      states: job.stateId ? { connect: [{ id: job.stateId }] } : undefined,
      applicationFees: job.fees.length
        ? { create: job.fees.map((f, i) => ({ ...f, order: i })) }
        : undefined,
      links: job.links.length
        ? { create: job.links.map((l, i) => ({ ...l, order: i })) }
        : undefined,
      importantDates: job.importantDates.length
        ? { create: job.importantDates.map((d, i) => ({ ...d, order: i })) }
        : undefined,
      faqs: job.faqs.length
        ? { create: job.faqs.map((f, i) => ({ ...f, order: i })) }
        : undefined,
      posts: job.posts.length
        ? {
            create: job.posts.map((p) => ({
              title: p.title,
              vacancies: p.vacancies,
              minAge: p.minAge,
              maxAge: p.maxAge,
              payScale: p.payScale,
              employmentType: p.employmentType,
              qualification: { connect: { id: p.qualificationIds[0] } },
              qualifications: { connect: p.qualificationIds.map((id) => ({ id })) },
              branches: p.branchIds.length ? { connect: p.branchIds.map((id) => ({ id })) } : undefined,
              roles: p.roleId ? { connect: [{ id: p.roleId }] } : undefined,
            })),
          }
        : undefined,
    },
    select: { id: true },
  });
}

export async function importJobs(rawJobs: unknown[], dryRun: boolean): Promise<ImportRowResult[]> {
  const lookups = await loadLookups();

  const rows = rawJobs.map((raw, index) => ({
    index,
    title: clean((raw as any)?.title) || '(untitled)',
    ...prepareRow(raw, lookups),
  }));

  const valid = rows.filter((r) => r.job).map((r) => r.job as PreparedJob);
  const existingSlugs = new Set<string>();
  const existingAdv = new Set<string>();

  if (valid.length > 0) {
    const advNos = valid.map((j) => j.advertisementNo).filter((a): a is string => !!a);
    const existing = await prisma.notification.findMany({
      where: {
        OR: [
          { slug: { in: valid.map((j) => j.slug) } },
          ...(advNos.length ? [{ advertisementNo: { in: advNos } }] : []),
        ],
      },
      select: { slug: true, advertisementNo: true, organizationId: true },
    });
    for (const e of existing) {
      existingSlugs.add(e.slug);
      if (e.advertisementNo) existingAdv.add(`${e.organizationId}:${e.advertisementNo}`);
    }
  }

  const seenSlugs = new Set<string>();
  const seenAdv = new Set<string>();
  const results: ImportRowResult[] = [];

  for (const row of rows) {
    if (!row.job) {
      results.push({ index: row.index, title: row.title, status: 'error', messages: row.errors });
      continue;
    }
    const job = row.job;
    const advKey = job.advertisementNo ? `${job.organizationId}:${job.advertisementNo}` : null;

    let duplicateMessage: string | null = null;
    if (existingSlugs.has(job.slug)) {
      duplicateMessage = 'A job with this title already exists - change the title to import it anyway';
    } else if (advKey && existingAdv.has(advKey)) {
      duplicateMessage = 'A job with this organization and advertisement number already exists';
    } else if (seenSlugs.has(job.slug) || (advKey && seenAdv.has(advKey))) {
      duplicateMessage = 'Duplicate of an earlier row in this file';
    }
    if (duplicateMessage) {
      results.push({ index: row.index, title: row.title, status: 'duplicate', messages: [duplicateMessage] });
      continue;
    }

    seenSlugs.add(job.slug);
    if (advKey) seenAdv.add(advKey);

    if (dryRun) {
      results.push({ index: row.index, title: row.title, status: 'valid', messages: row.warnings });
      continue;
    }

    try {
      const created = await createJob(job);
      results.push({ index: row.index, title: row.title, status: 'created', messages: row.warnings, id: created.id });
    } catch (error) {
      if ((error as any)?.code === 'P2002') {
        results.push({
          index: row.index,
          title: row.title,
          status: 'duplicate',
          messages: ['A job with this title already exists'],
        });
      } else {
        console.error(`Import failed for row ${row.index}:`, error);
        results.push({
          index: row.index,
          title: row.title,
          status: 'error',
          messages: ['Database error while saving this job (see server log)'],
        });
      }
    }
  }

  return results;
}
