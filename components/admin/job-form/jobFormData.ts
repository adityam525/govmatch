import { adminApi } from "@/features/admin/api";
import { validateNotificationDates } from "@/features/jobs/validation";
import type { LinkDraft } from "@/components/admin/LinksFieldArray";
import type { FAQDraft } from "@/components/admin/FAQsFieldArray";
import type { PostDraft } from "@/components/admin/PostsFieldArray";
import type { AdmitCardDraft } from "@/components/admin/AdmitCardsFieldArray";
import type { ResultDraft } from "@/components/admin/ResultsFieldArray";
import type { AnswerKeyDraft } from "@/components/admin/AnswerKeysFieldArray";
import type { ExamLevelDraft } from "@/components/admin/ExamLevelsFieldArray";
import type { ApplicationFeeDraft } from "@/components/admin/ApplicationFeeFieldArray";
import { keptSchedule, loadSchedule, saveSchedule, type ScheduleRow } from "./ScheduleEditor";

export interface JobBasics {
  title: string;
  organizationId: string;
  officialLink: string;
  stateId: string;
  status: string;
  applicationMode: string;
  howToApply: string;
  directEligibility: string;
  published: boolean;
}

export interface JobData {
  basics: JobBasics;
  steps: string[];
  schedule: ScheduleRow[];
  posts: PostDraft[];
  fees: ApplicationFeeDraft[];
  examLevels: ExamLevelDraft[];
  admitCards: AdmitCardDraft[];
  results: ResultDraft[];
  answerKeys: AnswerKeyDraft[];
  links: LinkDraft[];
  faqs: FAQDraft[];
}

export const emptyJob = (): JobData => ({
  basics: {
    title: "", organizationId: "", officialLink: "", stateId: "", status: "LIVE",
    applicationMode: "ONLINE", howToApply: "", directEligibility: "", published: false,
  },
  steps: [], schedule: [], posts: [], fees: [], examLevels: [], admitCards: [], results: [], answerKeys: [], links: [], faqs: [],
});

async function getList(url: string): Promise<any[]> {
  const res = await fetch(url);
  const data = await res.json().catch(() => null);
  if (!res.ok || !Array.isArray(data)) throw new Error(`Could not load ${url}`);
  return data;
}

const day = (v?: string | null) => (v ? v.slice(0, 10) : "");
const str = (v: unknown) => (v == null ? "" : String(v));

export async function loadJob(jobId: string): Promise<JobData> {
  const n = `notificationId=${jobId}`;
  const [job, links, faqs, levels, fees, posts, cards, results, keys, schedule, quals] = await Promise.all([
    adminApi.getById<any>("notifications", jobId),
    getList(`/api/notification-links?${n}`),
    getList(`/api/notification-faqs?${n}`),
    getList(`/api/exam-levels?${n}`),
    getList(`/api/application-fees?${n}`),
    getList(`/api/posts?${n}`),
    getList(`/api/admit-cards?${n}`),
    getList(`/api/results?${n}`),
    getList(`/api/answer-keys?${n}`),
    loadSchedule(jobId),
    getList("/api/qualifications"),
  ]);

  const categoryOf: Record<string, string> = {};
  for (const q of quals) if (q.categories?.[0]?.slug) categoryOf[q.id] = q.categories[0].slug;

  return {
    basics: {
      title: str(job.title),
      organizationId: str(job.organizationId),
      officialLink: str(job.officialLink),
      stateId: str((job.states ?? [])[0]?.id),
      status: job.status ?? "LIVE",
      applicationMode: job.applicationMode ?? "ONLINE",
      howToApply: str(job.howToApply),
      directEligibility: str(job.directEligibility),
      published: !!job.published,
    },
    steps: job.selectionProcess ?? [],
    schedule,
    links: links.map((l) => ({ label: l.label, url: l.url, linkType: l.linkType })),
    faqs: faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer })),
    examLevels: levels.map((l) => ({ id: l.id, name: l.name })),
    fees: fees.map((f) => ({ id: f.id, categoryLabel: f.categoryLabel, amount: f.amount })),
    admitCards: cards.map((a) => ({
      id: a.id, title: a.title, releaseDate: day(a.releaseDate), examDate: day(a.examDate),
      downloadLink: str(a.downloadLink), examLevelId: str(a.examLevelId),
    })),
    results: results.map((r) => ({
      id: r.id, title: r.title, resultType: r.resultType ?? "FINAL", releaseDate: day(r.releaseDate),
      resultLink: str(r.resultLink), examLevelId: str(r.examLevelId),
    })),
    answerKeys: keys.map((k) => ({
      id: k.id, title: k.title, keyType: k.keyType ?? "PROVISIONAL", releaseDate: day(k.releaseDate),
      objectionEndDate: day(k.objectionEndDate), downloadLink: str(k.downloadLink), examLevelId: str(k.examLevelId),
    })),
    posts: posts.map((p): PostDraft => {
      const accepted = p.qualifications?.length ? p.qualifications : p.qualificationId ? [{ id: p.qualificationId }] : [];
      const branchIds = (p.branches ?? []).map((b: any) => b.id);
      return {
        id: p.id,
        title: p.title,
        vacancies: str(p.vacancies),
        qualificationBlocks: accepted.length
          ? accepted.map((q: any) => ({ qualificationCategorySlug: categoryOf[q.id] ?? "", qualificationId: q.id, branchIds }))
          : [{ qualificationCategorySlug: "", qualificationId: "", branchIds: [] }],
        minAge: str(p.minAge),
        maxAge: str(p.maxAge),
        payScale: str(p.payScale),
        employmentType: p.employmentType ?? "PERMANENT",
        roleId: (p.roles ?? [])[0]?.id ?? "",
        genderRestriction: str(p.genderRestriction),
        minExperienceYears: str(p.minExperienceYears),
        requiredCertifications: p.requiredCertifications ?? [],
        domicileStateCode: str(p.domicileStateCode),
        minHeightCm: str(p.minHeightCm),
        minChestCm: str(p.minChestCm),
        pwdTypes: p.pwdTypes ?? [],
        relaxationRules: Array.isArray(p.relaxationRules)
          ? p.relaxationRules.map((r: any) => ({
              category: r.category, status: r.status, years: str(r.years), maxAge: str(r.maxAge), note: str(r.note),
            }))
          : [],
      };
    }),
  };
}

// ---------------------------------------------------------------------------
// Checking
// ---------------------------------------------------------------------------

const filled = (...values: unknown[]) => values.some((v) => String(v ?? "").trim() !== "");
const postIsUsed = (p: PostDraft) => filled(p.title, p.vacancies) || p.qualificationBlocks.some((q) => q.qualificationId);

export function jobProblem(data: JobData): string | null {
  const b = data.basics;
  if (!b.title.trim()) return "Enter the job title.";
  if (!b.organizationId) return "Choose the organization.";
  if (!b.officialLink.trim()) return "Enter the official link.";

  for (const [i, r] of keptSchedule(data.schedule).entries()) {
    if (!r.label.trim()) return `Date ${i + 1}: enter a name for this event.`;
  }

  for (const [i, p] of data.posts.entries()) {
    if (!postIsUsed(p)) continue;
    if (!p.title.trim()) return `Post ${i + 1}: enter the post title.`;
    if (!p.qualificationBlocks.some((q) => q.qualificationId)) return `Post "${p.title}": choose at least one qualification.`;
  }

  const pairs: [string, string, any[], string, string][] = [
    ["Fee", "needs both a category and an amount", data.fees, "categoryLabel", "amount"],
    ["FAQ", "needs both a question and an answer", data.faqs, "question", "answer"],
    ["Admit card", "needs both a title and a link", data.admitCards, "title", "downloadLink"],
    ["Result", "needs both a title and a link", data.results, "title", "resultLink"],
    ["Answer key", "needs both a title and a link", data.answerKeys, "title", "downloadLink"],
  ];
  for (const [name, rule, list, a, c] of pairs) {
    for (const [i, item] of list.entries()) {
      if (filled(item[a], item[c]) && !(filled(item[a]) && filled(item[c]))) return `${name} ${i + 1} ${rule}.`;
    }
  }
  for (const [i, l] of data.links.entries()) {
    if (filled(l.label) && !filled(l.url)) return `Link ${i + 1} needs a web address.`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Saving
// ---------------------------------------------------------------------------

async function syncCollection(entity: string, notificationId: string, items: any[], extra?: (item: any) => any) {
  const existing = await getList(`/api/${entity}?notificationId=${notificationId}`);
  await Promise.all(existing.map((e) => adminApi.remove(entity, e.id)));
  await Promise.all(
    items.map((item, i) => {
      const { id: _id, ...rest } = item;
      return adminApi.create(entity, { ...rest, ...(extra ? extra(item) : {}), notificationId, order: i });
    }),
  );
}

// Levels are updated in place, so admit cards, results and answer keys keep their link to a level.
async function syncLevels(jobId: string, levels: ExamLevelDraft[]): Promise<Set<string>> {
  const existing = await getList(`/api/exam-levels?notificationId=${jobId}`);
  const named = levels.filter((l) => l.name.trim());
  const keep = new Set(named.map((l) => l.id).filter((v): v is string => !!v));
  await Promise.all(existing.filter((e) => !keep.has(e.id)).map((e) => adminApi.remove("exam-levels", e.id)));
  for (const [i, l] of named.entries()) {
    if (l.id) await adminApi.update("exam-levels", l.id, { name: l.name.trim(), order: i });
    else await adminApi.create("exam-levels", { name: l.name.trim(), notificationId: jobId, order: i });
  }
  return keep;
}

async function saveCollections(jobId: string, data: JobData) {
  const levelIds = await syncLevels(jobId, data.examLevels);
  const level = (c: { examLevelId?: string }) => ({ examLevelId: c.examLevelId && levelIds.has(c.examLevelId) ? c.examLevelId : null });

  await syncCollection("notification-links", jobId, data.links.filter((l) => l.url.trim()));
  await syncCollection("notification-faqs", jobId, data.faqs.filter((f) => f.question.trim() && f.answer.trim()));
  await syncCollection("application-fees", jobId, data.fees.filter((f) => f.categoryLabel.trim() && f.amount.trim()));
  await syncCollection("admit-cards", jobId, data.admitCards.filter((a) => a.title.trim() && a.downloadLink.trim()), level);
  await syncCollection("results", jobId, data.results.filter((r) => r.title.trim() && r.resultLink.trim()), level);
  await syncCollection("answer-keys", jobId, data.answerKeys.filter((k) => k.title.trim() && k.downloadLink.trim()), level);

  const existingPosts = await getList(`/api/posts?notificationId=${jobId}`);
  await Promise.all(existingPosts.map((p) => adminApi.remove("posts", p.id)));
  for (const p of data.posts.filter(postIsUsed)) {
    const blocks = p.qualificationBlocks.filter((q) => q.qualificationId);
    const qualificationIds = blocks.map((q) => q.qualificationId);
    await adminApi.create("posts", {
      title: p.title.trim(),
      notificationId: jobId,
      vacancies: Number(p.vacancies) || 0,
      qualificationId: qualificationIds[0],
      qualificationIds,
      minAge: p.minAge ? Number(p.minAge) : null,
      maxAge: p.maxAge ? Number(p.maxAge) : null,
      payScale: p.payScale || null,
      employmentType: p.employmentType,
      branchIds: [...new Set(blocks.flatMap((q) => q.branchIds))],
      roleIds: p.roleId ? [p.roleId] : [],
      genderRestriction: p.genderRestriction || null,
      minExperienceYears: p.minExperienceYears,
      requiredCertifications: p.requiredCertifications ?? [],
      domicileStateCode: p.domicileStateCode || null,
      minHeightCm: p.minHeightCm,
      minChestCm: p.minChestCm,
      pwdTypes: p.pwdTypes ?? [],
      relaxationRules: p.relaxationRules ?? [],
    } as any);
  }
}

/**
 * Saves the job, then its lists, then its schedule. `created` remembers a job that was made by
 * an earlier attempt, so pressing Save again after a failure updates it instead of making a second one.
 */
export async function saveJob(opts: {
  jobId?: string;
  data: JobData;
  published: boolean;
  created: { current: string | null };
}): Promise<string> {
  const { data, published, created } = opts;
  const b = data.basics;
  const schedule = keptSchedule(data.schedule);
  const dayOf = (kind: string) => schedule.find((r) => r.kind === kind && r.day)?.day;

  const dates = {
    notificationDate: dayOf("NOTIFICATION"),
    applicationStartDate: dayOf("APPLICATION_OPEN"),
    applicationEndDate: dayOf("APPLICATION_CLOSE"),
    examDate: dayOf("EXAM"),
  };
  const dateError = validateNotificationDates(dates as any);
  if (dateError) throw new Error(dateError);

  const payload: Record<string, any> = {
    title: b.title.trim(),
    organizationId: b.organizationId,
    officialLink: b.officialLink.trim(),
    status: b.status,
    applicationMode: b.applicationMode,
    howToApply: b.howToApply,
    directEligibility: b.directEligibility,
    published,
    selectionProcess: data.steps,
    stateIds: b.stateId ? [b.stateId] : [],
  };
  for (const [key, value] of Object.entries(dates)) if (value) payload[key] = value;

  let id = opts.jobId ?? created.current;
  if (id) {
    await adminApi.update("notifications", id, payload);
  } else {
    // The URL slug is set once, at creation, so editing a title never changes a job's address.
    const slug = b.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const made = await adminApi.create<any>("notifications", { ...payload, slug });
    id = made.id as string;
    created.current = id;
  }

  await saveCollections(id, data);
  await saveSchedule(id, schedule);
  return id;
}
