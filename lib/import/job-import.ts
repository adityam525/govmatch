import {
  EmploymentType,
  ApplicationMode,
  NotificationStatus,
  LinkType,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { validateNotificationDates } from "@/features/jobs/validation";
import { EVENT_KINDS, istDay, istToDate } from "@/lib/schedule";

export const MAX_JOBS_PER_IMPORT = 100;

const EMPLOYMENT_TYPES = [
  "PERMANENT",
  "CONTRACT",
  "APPRENTICE",
  "INTERNSHIP",
  "TEMPORARY",
  "DEPUTATION",
];
const APPLICATION_MODES = ["ONLINE", "OFFLINE", "BOTH"];
const STATUSES = ["UPCOMING", "LIVE", "CLOSED", "CANCELLED"];
const LINK_TYPES = [
  "APPLY_ONLINE",
  "NOTIFICATION_PDF",
  "OFFICIAL_WEBSITE",
  "ADMIT_CARD",
  "RESULT",
  "SYLLABUS",
  "SHORT_NOTICE",
  "OTHER",
];

export type RowStatus = "created" | "valid" | "duplicate" | "error";

export interface ImportRowResult {
  index: number;
  title: string;
  status: RowStatus;
  messages: string[];
  id?: string;
}

type IdMap = Map<string, string>;
import {
  readQualificationEntries,
  type BranchRow,
  type NewBranch,
  type QualificationRule,
} from "./qualification-entries";
interface Lookups {
  orgs: IdMap;
  states: IdMap;
  quals: IdMap;
  branches: IdMap;
  roles: IdMap;
  branchRows: BranchRow[];
}

interface PreparedPost {
  title: string;
  vacancies: number;
  minAge: number | null;
  maxAge: number | null;
  payScale: string | null;
  employmentType: EmploymentType;
  qualificationIds: string[];
  branchIds: string[];
  qualificationRules: QualificationRule[];
  newBranches: NewBranch[];
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
  scheduleEvents: {
    kind: string;
    label: string;
    at: Date;
    timeKnown: boolean;
  }[];
  faqs: { question: string; answer: string }[];
  posts: PreparedPost[];
  totalVacancies: number;
}

const clean = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
const norm = (v: string): string => v.trim().toLowerCase();
const slugify = (s: string): string =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
const asArray = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

function isIsoDate(v: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(v);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

function isHttpUrl(v: string): boolean {
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function parseAge(
  value: unknown,
  field: string,
  errors: string[],
): number | null {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > 100) {
    errors.push(`${field} must be a whole number between 0 and 100`);
    return null;
  }
  return n;
}

function buildMap<T extends { id: string }>(
  items: T[],
  keys: (item: T) => string[],
): IdMap {
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
    prisma.organization.findMany({
      select: { id: true, name: true, shortName: true },
    }),
    prisma.state.findMany({ select: { id: true, name: true, code: true } }),
    prisma.qualification.findMany({
      select: { id: true, name: true, slug: true },
    }),
    prisma.branch.findMany({
      select: { id: true, name: true, slug: true, qualificationId: true },
    }),
    prisma.role.findMany({ select: { id: true, name: true, slug: true } }),
  ]);
  return {
    orgs: buildMap(orgs, (o) => [o.shortName, o.name]),
    states: buildMap(states, (s) => [s.name, s.code]),
    quals: buildMap(quals, (q) => [q.slug, q.name]),
    branches: buildMap(branches, (b) => [b.slug, b.name]),
    branchRows: branches,
    roles: buildMap(roles, (r) => [r.slug, r.name]),
  };
}

function prepareRow(
  raw: any,
  lookups: Lookups,
): { errors: string[]; warnings: string[]; job?: PreparedJob } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { errors: ["Each job must be a JSON object"], warnings };
  }

  const title = clean(raw.title);
  const slug = slugify(title);
  if (!title) errors.push("title is required");
  else if (title.length > 250)
    errors.push("title is too long (max 250 characters)");
  else if (!slug) errors.push("title must contain letters or numbers");

  const orgText = clean(raw.organization);
  let organizationId = "";
  if (!orgText) {
    errors.push("organization is required (short name or full name)");
  } else {
    const id = lookups.orgs.get(norm(orgText));
    if (!id) errors.push(`organization not found: "${orgText}"`);
    else organizationId = id;
  }

  const officialLink = clean(raw.officialLink);
  if (!officialLink) errors.push("officialLink is required");
  else if (!isHttpUrl(officialLink))
    errors.push("officialLink must be a valid http(s) URL");

  const modeText = clean(raw.applicationMode).toUpperCase() || "ONLINE";
  if (!APPLICATION_MODES.includes(modeText)) {
    errors.push(
      `applicationMode must be one of ${APPLICATION_MODES.join(", ")}`,
    );
  }
  const statusText = clean(raw.status).toUpperCase() || "LIVE";
  if (!STATUSES.includes(statusText)) {
    errors.push(`status must be one of ${STATUSES.join(", ")}`);
  }

  const dateKeys = [
    "notificationDate",
    "applicationStartDate",
    "applicationEndDate",
    "examDate",
  ] as const;
  const dates: Record<string, string> = {};
  for (const k of dateKeys) {
    const v = clean(raw[k]);
    if (!v) continue;
    if (!isIsoDate(v))
      errors.push(`${k} must be a real date in YYYY-MM-DD format`);
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
  if (advertisementNo && advertisementNo.length > 100)
    errors.push("advertisementNo is too long (max 100)");
  const howToApply = clean(raw.howToApply) || null;
  if (howToApply && howToApply.length > 5000)
    errors.push("howToApply is too long (max 5000)");
  const directEligibility = clean(raw.directEligibility) || null;
  if (directEligibility && directEligibility.length > 2000)
    errors.push("directEligibility is too long (max 2000)");

  const selectionProcess = asArray(raw.selectionProcess)
    .map(clean)
    .filter(Boolean);

  const fees: PreparedJob["fees"] = [];
  asArray(raw.fees).forEach((f: any, i) => {
    const categoryLabel = clean(f?.category);
    const amount = clean(f?.amount);
    if (!categoryLabel || !amount)
      errors.push(`fees[${i}] needs both category and amount`);
    else fees.push({ categoryLabel, amount });
  });

  const links: PreparedJob["links"] = [];
  asArray(raw.links).forEach((l: any, i) => {
    const url = clean(l?.url);
    const type = clean(l?.type).toUpperCase() || "OTHER";
    if (!url || !isHttpUrl(url)) {
      errors.push(`links[${i}].url must be a valid http(s) URL`);
      return;
    }
    if (!LINK_TYPES.includes(type)) {
      errors.push(`links[${i}].type must be one of ${LINK_TYPES.join(", ")}`);
      return;
    }
    links.push({
      label: clean(l?.label) || type.replace(/_/g, " "),
      url,
      linkType: type as LinkType,
    });
  });

  const importantDates: PreparedJob["importantDates"] = [];
  asArray(raw.importantDates).forEach((d: any, i) => {
    const label = clean(d?.label);
    const date = clean(d?.date);
    if (!label || !isIsoDate(date)) {
      errors.push(
        `importantDates[${i}] needs a label and a real date (YYYY-MM-DD)`,
      );
      return;
    }
    importantDates.push({ label, date: new Date(date) });
  });

  const faqs: PreparedJob["faqs"] = [];
  asArray(raw.faqs).forEach((f: any, i) => {
    const question = clean(f?.question);
    const answer = clean(f?.answer);
    if (!question || !answer)
      errors.push(`faqs[${i}] needs both question and answer`);
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
    if (
      p?.vacancies !== undefined &&
      p?.vacancies !== null &&
      p?.vacancies !== ""
    ) {
      const n = Number(p.vacancies);
      if (!Number.isInteger(n) || n < 0)
        errors.push(`${label}.vacancies must be a whole number`);
      else vacancies = n;
    }

    const minAge = parseAge(p?.minAge, `${label}.minAge`, errors);
    const maxAge = parseAge(p?.maxAge, `${label}.maxAge`, errors);
    if (minAge !== null && maxAge !== null && minAge > maxAge) {
      errors.push(`${label}: minAge cannot be greater than maxAge`);
    }

    const empText = clean(p?.employmentType).toUpperCase() || "PERMANENT";
    if (!EMPLOYMENT_TYPES.includes(empText)) {
      errors.push(
        `${label}.employmentType must be one of ${EMPLOYMENT_TYPES.join(", ")}`,
      );
    }

    const entries = readQualificationEntries(
      {
        qualifications: p?.qualifications,
        qualification: p?.qualification,
        branches: p?.branches,
      },
      (t) => lookups.quals.get(norm(clean(t))),
      lookups.branchRows,
    );
    for (const message of entries.errors) errors.push(label + ": " + message);
    const { qualificationIds, branchIds, qualificationRules, newBranches } =
      entries;
    for (const nb of newBranches)
      warnings.push('will create branch "' + nb.name + '"');

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
      qualificationRules,
      newBranches,
      roleId,
    });
  });

  if (posts.length === 0 && !directEligibility) {
    warnings.push(
      "no posts and no directEligibility - the job page will say eligibility is coming soon",
    );
  }

  // Schedule: explicit events (with optional times), then the four main dates, then other dates.
  const kindCodes: string[] = EVENT_KINDS.map((k) => k.code);
  const sched: PreparedJob["scheduleEvents"] = [];
  asArray(raw.schedule).forEach((e: any, i) => {
    const kind = clean(e?.kind).toUpperCase();
    const day = clean(e?.date);
    const time = clean(e?.time);
    if (!kindCodes.includes(kind)) {
      errors.push(`schedule[${i}].kind must be one of ${kindCodes.join(", ")}`);
      return;
    }
    if (!isIsoDate(day)) {
      errors.push(
        `schedule[${i}].date must be a real date in YYYY-MM-DD format`,
      );
      return;
    }
    if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      errors.push(`schedule[${i}].time must look like 17:00`);
      return;
    }
    const at = istToDate(day, time || null);
    if (!at) {
      errors.push(`schedule[${i}] has an invalid date or time`);
      return;
    }
    sched.push({
      kind,
      label:
        clean(e?.label) ||
        (EVENT_KINDS.find((k) => k.code === kind)?.label ?? kind),
      at,
      timeKnown: !!time,
    });
  });
  const mainDates: [string, string, string | undefined][] = [
    ["NOTIFICATION", "Notification published", dates.notificationDate],
    ["APPLICATION_OPEN", "Applications open", dates.applicationStartDate],
    ["APPLICATION_CLOSE", "Applications close", dates.applicationEndDate],
    ["EXAM", "Exam", dates.examDate],
  ];
  for (const [kind, label, day] of mainDates) {
    if (!day || sched.some((x) => x.kind === kind)) continue;
    const at = istToDate(day, null);
    if (at) sched.push({ kind, label, at, timeKnown: false });
  }
  for (const d of importantDates) {
    const day = d.date.toISOString().slice(0, 10);
    if (sched.some((x) => istDay(x.at) === day)) continue;
    const at = istToDate(day, null);
    if (at) sched.push({ kind: "OTHER", label: d.label, at, timeKnown: false });
  }
  // The older date columns follow the schedule when only the schedule gave a date.
  const firstOf = (kind: string) => sched.find((x) => x.kind === kind);
  if (!dates.notificationDate && firstOf("NOTIFICATION"))
    dates.notificationDate = istDay(firstOf("NOTIFICATION")!.at);
  if (!dates.applicationStartDate && firstOf("APPLICATION_OPEN"))
    dates.applicationStartDate = istDay(firstOf("APPLICATION_OPEN")!.at);
  if (!dates.applicationEndDate && firstOf("APPLICATION_CLOSE"))
    dates.applicationEndDate = istDay(firstOf("APPLICATION_CLOSE")!.at);
  if (!dates.examDate && firstOf("EXAM"))
    dates.examDate = istDay(firstOf("EXAM")!.at);

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
      scheduleEvents: sched,
      faqs,
      posts,
      totalVacancies: posts.reduce((sum, p) => sum + p.vacancies, 0),
    },
  };
}

// Creates the branches a row asked for with "NEW:", and adds them to the post and its qualification rule.
async function materializeBranches(job: PreparedJob) {
  for (const p of job.posts) {
    for (const nb of p.newBranches) {
      const qual = await prisma.qualification.findUnique({
        where: { id: nb.qualificationId },
        select: { name: true },
      });
      if (!qual) continue;
      let branch = await prisma.branch.findUnique({
        where: { name: nb.name },
        select: { id: true },
      });
      if (!branch) {
        let slug = slugify(nb.name);
        if (
          await prisma.branch.findUnique({
            where: { slug },
            select: { id: true },
          })
        )
          slug = slugify(nb.name + " " + qual.name);
        branch = await prisma.branch.create({
          data: {
            name: nb.name,
            slug,
            qualificationGroup: qual.name,
            qualificationId: nb.qualificationId,
          },
          select: { id: true },
        });
      }
      if (!p.branchIds.includes(branch.id)) p.branchIds.push(branch.id);
      const rule = p.qualificationRules.find(
        (r) => r.qualificationId === nb.qualificationId,
      );
      if (rule && !rule.branchIds.includes(branch.id))
        rule.branchIds.push(branch.id);
    }
  }
}

async function createJob(job: PreparedJob) {
  await materializeBranches(job);
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
      scheduleEvents: job.scheduleEvents.length
        ? {
            create: [...job.scheduleEvents]
              .sort((a, b) => a.at.getTime() - b.at.getTime())
              .map((e, i) => ({
                kind: e.kind,
                label: e.label,
                at: e.at,
                timeKnown: e.timeKnown,
                order: i,
                history: {
                  create: {
                    kind: "ANNOUNCED",
                    newAt: e.at,
                    newTimeKnown: e.timeKnown,
                  },
                },
              })),
          }
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
              qualifications: {
                connect: p.qualificationIds.map((id) => ({ id })),
              },
              branches: p.branchIds.length
                ? { connect: p.branchIds.map((id) => ({ id })) }
                : undefined,
              roles: p.roleId ? { connect: [{ id: p.roleId }] } : undefined,
              qualificationRules: p.qualificationRules.length
                ? { create: p.qualificationRules }
                : undefined,
            })),
          }
        : undefined,
    },
    select: { id: true },
  });
}

export async function importJobs(
  rawJobs: unknown[],
  dryRun: boolean,
): Promise<ImportRowResult[]> {
  const lookups = await loadLookups();

  const rows = rawJobs.map((raw, index) => ({
    index,
    title: clean((raw as any)?.title) || "(untitled)",
    ...prepareRow(raw, lookups),
  }));

  const valid = rows.filter((r) => r.job).map((r) => r.job as PreparedJob);
  const existingSlugs = new Map<string, string>();
  const existingAdv = new Map<string, string>();

  if (valid.length > 0) {
    const advNos = valid
      .map((j) => j.advertisementNo)
      .filter((a): a is string => !!a);
    const existing = await prisma.notification.findMany({
      where: {
        OR: [
          { slug: { in: valid.map((j) => j.slug) } },
          ...(advNos.length ? [{ advertisementNo: { in: advNos } }] : []),
        ],
      },
      select: {
        slug: true,
        advertisementNo: true,
        organizationId: true,
        title: true,
        published: true,
      },
    });
    for (const e of existing) {
      const label =
        '"' +
        e.title +
        '" (' +
        (e.published ? "published" : "saved as a draft") +
        ")";
      existingSlugs.set(e.slug, label);
      if (e.advertisementNo)
        console.log(
          "@@@@@@@@@@@@@@@@@@@@@@@",
          e.organizationId,
          e.advertisementNo,
        );
      existingAdv.set(`${e.organizationId}:${e.advertisementNo}`, label);
    }
  }

  const seenSlugs = new Set<string>();
  const seenAdv = new Set<string>();
  const results: ImportRowResult[] = [];

  for (const row of rows) {
    if (!row.job) {
      results.push({
        index: row.index,
        title: row.title,
        status: "error",
        messages: row.errors,
      });
      continue;
    }
    const job = row.job;
    const advKey = job.advertisementNo
      ? `${job.organizationId}:${job.advertisementNo}`
      : null;

    let duplicateMessage: string | null = null;
    if (existingSlugs.has(job.slug)) {
      duplicateMessage =
        "Already in your jobs: " +
        existingSlugs.get(job.slug) +
        ". Delete that one or change the title to import this again.";
    } else if (advKey && existingAdv.has(advKey)) {
      duplicateMessage =
        "Already in your jobs with the same organization and advertisement number: " +
        (existingAdv.get(advKey as string) ?? "") +
        ".";
    } else if (seenSlugs.has(job.slug) || (advKey && seenAdv.has(advKey))) {
      duplicateMessage = "Duplicate of an earlier row in this file";
    }
    if (duplicateMessage) {
      results.push({
        index: row.index,
        title: row.title,
        status: "duplicate",
        messages: [duplicateMessage],
      });
      continue;
    }

    seenSlugs.add(job.slug);
    if (advKey) seenAdv.add(advKey);

    if (dryRun) {
      results.push({
        index: row.index,
        title: row.title,
        status: "valid",
        messages: row.warnings,
      });
      continue;
    }

    try {
      const created = await createJob(job);
      results.push({
        index: row.index,
        title: row.title,
        status: "created",
        messages: row.warnings,
        id: created.id,
      });
    } catch (error) {
      if ((error as any)?.code === "P2002") {
        results.push({
          index: row.index,
          title: row.title,
          status: "duplicate",
          messages: ["A job with this title already exists"],
        });
      } else {
        console.error(`Import failed for row ${row.index}:`, error);
        results.push({
          index: row.index,
          title: row.title,
          status: "error",
          messages: ["Database error while saving this job (see server log)"],
        });
      }
    }
  }

  return results;
}
