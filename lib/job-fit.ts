import { prisma } from './prisma';
import { fieldKey } from './field-keys';
import { evaluateAge } from './age-rules';
import { evaluateRequirements } from './requirements';
import { computeCompleteness } from './profile-completeness';

export interface QualRef {
  id: string;
  name: string;
  level: number;
  categories: { slug: string; name: string }[];
}

export interface EducationFact {
  qualification: QualRef;
  field: string | null;
  fieldLabel: string | null;
}

export interface UserFacts {
  educations: EducationFact[];
  dateOfBirth: Date | null;
  category: string | null;
  disabilityTypes: string[];
  disabilityPercent: number | null;
  specialStatuses: string[];
  gender: string | null;
  domicileStateCode: string | null;
  experienceYears: number | null;
  certifications: string[];
  heightCm: number | null;
  chestCm: number | null;
  preferredRoleIds: string[];
  preferredEmploymentTypes: string[];
}

export interface FitContext {
  hasProfile: boolean;
  /** Needs at least one qualification and a date of birth. */
  profileComplete: boolean;
  strength: number;
  missing: string[];
  stateNames?: Map<string, string>;
  user: UserFacts;
  qualifications: Map<string, QualRef>;
}

export type FitVerdict = 'eligible' | 'unknown' | 'not-eligible';

export interface FitCheck {
  label: string;
  text: string;
  /** lower = does not block the job but lowers the match percentage */
  state: 'ok' | 'fail' | 'unknown' | 'lower';
}

export interface Evaluation {
  verdict: FitVerdict;
  score: number;
  label: string;
  checks: FitCheck[];
}

export interface JobFit {
  evaluation: Evaluation;
  postTitle: string | null;
  postCount: number;
}

export interface PostLike {
  title?: string | null;
  minAge?: number | null;
  maxAge?: number | null;
  ageRelaxation?: unknown;
  relaxationRules?: unknown;
  pwdTypes?: string[];
  genderRestriction?: string | null;
  minExperienceYears?: number | null;
  requiredCertifications?: string[];
  domicileStateCode?: string | null;
  minHeightCm?: number | null;
  minChestCm?: number | null;
  employmentType?: string | null;
  qualification?: { id: string } | null;
  qualifications?: { id: string }[];
  branches?: { name: string }[];
  roles?: { id: string }[];
}

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------

export async function loadFitContext(userId: string): Promise<FitContext> {
  const [profile, rows, qualRows] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { userId },
      include: { preferredRoles: { select: { id: true } } },
    }),
    prisma.userEducation.findMany({
      where: { userId },
      include: { branch: { select: { name: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.qualification.findMany({
      select: { id: true, name: true, level: true, categories: { select: { slug: true, name: true } } },
    }),
  ]);

  const qualifications = new Map<string, QualRef>(qualRows.map((q) => [q.id, q]));
  const stateRows = await prisma.state.findMany({ select: { code: true, name: true } });
  const stateNames = new Map<string, string>(stateRows.map((s) => [s.code, s.name]));

  const educations: EducationFact[] = [];
  for (const row of rows) {
    const qualification = qualifications.get(row.qualificationId);
    if (!qualification) continue;
    const label = row.branch?.name ?? row.subject ?? null;
    educations.push({ qualification, field: fieldKey(label), fieldLabel: label });
  }

  // Profiles saved before the education list existed still carry one qualification.
  if (educations.length === 0 && profile?.qualificationId) {
    const qualification = qualifications.get(profile.qualificationId);
    if (qualification) {
      const branch = profile.branchId
        ? await prisma.branch.findUnique({ where: { id: profile.branchId }, select: { name: true } })
        : null;
      educations.push({ qualification, field: fieldKey(branch?.name), fieldLabel: branch?.name ?? null });
    }
  }

  const completeness = computeCompleteness({
    dateOfBirth: profile?.dateOfBirth ?? null,
    educationCount: educations.length,
    category: profile?.category ?? null,
    gender: profile?.gender ?? null,
    phoneNumber: profile?.phoneNumber ?? null,
    preferenceCount: (profile?.preferredRoles.length ?? 0) + (profile?.preferredEmploymentTypes.length ?? 0),
  });

  return {
    hasProfile: !!profile,
    profileComplete: educations.length > 0 && !!profile?.dateOfBirth,
    strength: completeness.percent,
    missing: completeness.missing,
    stateNames,
    qualifications,
    user: {
      educations,
      dateOfBirth: profile?.dateOfBirth ?? null,
      category: profile?.category ?? null,
      disabilityTypes: profile?.disabilityTypes ?? [],
      disabilityPercent: profile?.disabilityPercent ?? null,
      specialStatuses: profile?.specialStatuses ?? [],
      gender: profile?.gender ?? null,
      domicileStateCode: profile?.domicileStateCode ?? null,
      experienceYears: profile?.experienceYears ?? null,
      certifications: profile?.certifications ?? [],
      heightCm: profile?.heightCm ?? null,
      chestCm: profile?.chestCm ?? null,
      preferredRoleIds: profile?.preferredRoles.map((role) => role.id) ?? [],
      preferredEmploymentTypes: (profile?.preferredEmploymentTypes ?? []) as string[],
    },
  };
}

// ---------------------------------------------------------------------------
// Qualification rules
// ---------------------------------------------------------------------------

const LEVEL_SLUGS = new Set([
  '8th-pass', '10th-pass', '12th-pass', 'iti', 'apprentice', 'diploma',
  'graduate', 'post-graduate', 'postgraduate', 'doctorate', 'phd',
]);

// A category that only names a level (Graduate, Diploma...) says nothing about the field.
const isLevelCategory = (c: { slug: string; name: string }) =>
  LEVEL_SLUGS.has(c.slug) || /(pass|^iti$|apprentice|diploma|graduate|doctorate)/i.test(c.name);

const familyOf = (q: QualRef) => new Set(q.categories.filter((c) => !isLevelCategory(c)).map((c) => c.slug));

function sharesFamily(a: QualRef, b: QualRef): boolean {
  const first = familyOf(a);
  for (const slug of familyOf(b)) if (first.has(slug)) return true;
  return false;
}

const isVocational = (q: QualRef) =>
  /\b(iti|apprentice|diploma)\b/i.test(q.name) || q.categories.some((c) => /\b(iti|apprentice|diploma)\b/i.test(c.name));

// 8th, 10th and 12th Pass and "Any Graduate / Post Graduate" accept that level or higher.
const isGeneric = (q: QualRef) => q.level <= 3 || /^any\b/i.test(q.name.trim());

interface QualResult {
  status: 'yes' | 'no' | 'unknown';
  via?: EducationFact;
}

function checkQualification(educations: EducationFact[], accepted: QualRef, fields: Set<string>): QualResult {
  if (isGeneric(accepted)) {
    const via = educations.find(
      (e) => e.qualification.level >= accepted.level && !(isVocational(e.qualification) && accepted.level >= 3),
    );
    return via ? { status: 'yes', via } : { status: 'no' };
  }

  let missingField = false;
  for (const e of educations) {
    const exact = e.qualification.id === accepted.id;
    const higher = !exact && e.qualification.level > accepted.level && sharesFamily(e.qualification, accepted);
    if (!exact && !higher) continue;
    if (fields.size === 0) return { status: 'yes', via: e };
    if (e.field && fields.has(e.field)) return { status: 'yes', via: e };
    if (!e.field) missingField = true;
  }
  return { status: missingField ? 'unknown' : 'no' };
}

// ---------------------------------------------------------------------------
// Wording helpers
// ---------------------------------------------------------------------------

const describe = (e: EducationFact) => (e.fieldLabel ? `${e.qualification.name} (${e.fieldLabel})` : e.qualification.name);

const joinNames = (names: string[], max = 3) =>
  names.length <= max ? names.join(' or ') : `${names.slice(0, max).join(', ')} or ${names.length - max} more`;

function summarize(educations: EducationFact[]): string {
  const sorted = [...educations].sort((a, b) => b.qualification.level - a.qualification.level);
  const shown = sorted.slice(0, 2).map(describe).join(', ');
  return sorted.length > 2 ? `${shown} and ${sorted.length - 2} more` : shown;
}

const TYPE_LABEL: Record<string, string> = {
  PERMANENT: 'permanent', CONTRACT: 'contract', APPRENTICE: 'apprentice',
  INTERNSHIP: 'internship', TEMPORARY: 'temporary', DEPUTATION: 'deputation',
};

// Age relaxation counts only when the notification states a number of years for the user's category.
function relaxationFor(category: string | null, relaxation: unknown): { years: number; key: string } | null {
  const wanted = (category ?? '').trim().toLowerCase();
  if (!wanted || wanted === 'general') return null;
  if (!relaxation || typeof relaxation !== 'object' || Array.isArray(relaxation)) return null;

  let best: { years: number; key: string } | null = null;
  for (const [key, value] of Object.entries(relaxation as Record<string, unknown>)) {
    const tokens = key.toLowerCase().split(/[^a-z]+/).filter(Boolean);
    if (!tokens.includes(wanted)) continue;
    const match = String(value).match(/\d{1,2}/);
    if (!match) continue;
    const years = Number(match[0]);
    if (!best || years > best.years) best = { years, key };
  }
  return best;
}

// ---------------------------------------------------------------------------
// Evaluation
// ---------------------------------------------------------------------------

export function evaluatePost(ctx: FitContext, post: PostLike, now: Date = new Date()): Evaluation {
  const { user } = ctx;

  const accepted: QualRef[] = [];
  for (const ref of [...(post.qualifications ?? []), ...(post.qualification ? [post.qualification] : [])]) {
    const q = ctx.qualifications.get(ref.id);
    if (q && !accepted.some((a) => a.id === q.id)) accepted.push(q);
  }
  const branchNames = [...new Set((post.branches ?? []).map((b) => b.name))];
  const fields = new Set(branchNames.map((name) => fieldKey(name)).filter((key): key is string => !!key));

  // --- Qualification
  type QualStatus = 'yes' | 'no' | 'unknown' | 'na';
  let qualStatus: QualStatus = 'na';
  let qualCheck: FitCheck | null = null;

  if (accepted.length > 0) {
    if (user.educations.length === 0) {
      qualStatus = 'unknown';
      qualCheck = { label: 'Qualification', text: 'Add your education to your profile so we can check this job.', state: 'unknown' };
    } else {
      const results = accepted.map((a) => checkQualification(user.educations, a, fields));
      const hit = results.find((r) => r.status === 'yes');
      if (hit) {
        qualStatus = 'yes';
        qualCheck = {
          label: 'Qualification',
          text: `Your ${hit.via ? describe(hit.via) : 'qualification'} meets the requirement.`,
          state: 'ok',
        };
      } else if (results.some((r) => r.status === 'unknown')) {
        qualStatus = 'unknown';
        qualCheck = {
          label: 'Qualification',
          text: `This job needs a specific branch (${joinNames(branchNames)}). Add your branch or subject to your education to check.`,
          state: 'unknown',
        };
      } else {
        qualStatus = 'no';
        const need = joinNames(accepted.map((a) => a.name));
        const inField = fields.size > 0 ? ` in ${joinNames(branchNames)}` : '';
        qualCheck = {
          label: 'Qualification',
          text: `Needs ${need}${inField}; you have ${summarize(user.educations)}.`,
          state: 'fail',
        };
      }
    }
  }

  // --- Age (with relaxation for category, disability and special statuses)
  const ageResult = evaluateAge(
    {
      dateOfBirth: user.dateOfBirth,
      category: user.category,
      disabilityTypes: user.disabilityTypes,
      disabilityPercent: user.disabilityPercent,
      specialStatuses: user.specialStatuses,
    },
    post,
    now,
  );
  const ageStatus = ageResult.status;
  const ageCheck: FitCheck | null = ageResult.checks[0] ?? null;

  // --- Gender, home state, experience, certificates and physical standards
  const reqResult = evaluateRequirements(
    {
      gender: user.gender ?? null,
      domicileStateCode: user.domicileStateCode ?? null,
      experienceYears: user.experienceYears ?? null,
      certifications: user.certifications ?? [],
      heightCm: user.heightCm ?? null,
      chestCm: user.chestCm ?? null,
    },
    post,
    (code) => ctx.stateNames?.get(code) ?? code,
  );

  // --- Job type preference (hard filter)
  const prefs = user.preferredEmploymentTypes;
  let prefFail = false;
  let prefCheck: FitCheck | null = null;
  if (prefs.length > 0 && post.employmentType) {
    if (prefs.includes(post.employmentType)) {
      prefCheck = { label: 'Job type', text: 'Matches your job-type preference.', state: 'ok' };
    } else {
      prefFail = true;
      const type = TYPE_LABEL[post.employmentType] ?? post.employmentType.toLowerCase();
      prefCheck = { label: 'Job type', text: `This is a ${type} job, which is not in your job-type preferences.`, state: 'fail' };
    }
  }

  // --- Field (only worth showing once the qualification itself is met)
  const userFields = user.educations.map((e) => e.field).filter((key): key is string => !!key);
  const branchApplicable = fields.size > 0 && userFields.length > 0;
  const branchMatch = branchApplicable && userFields.some((key) => fields.has(key));
  let fieldCheck: FitCheck | null = null;
  if (qualStatus === 'yes' && fields.size > 0 && branchApplicable) {
    const mine = [...new Set(user.educations.map((e) => e.fieldLabel).filter((l): l is string => !!l))];
    fieldCheck = branchMatch
      ? { label: 'Field', text: `Your field matches (${joinNames(branchNames)}).`, state: 'ok' }
      : { label: 'Field', text: `This job prefers ${joinNames(branchNames)}; your field is ${mine.join(', ')}.`, state: 'lower' };
  }

  // --- Roles (bonus only)
  const roleApplicable = user.preferredRoleIds.length > 0 && (post.roles?.length ?? 0) > 0;
  const roleMatch = roleApplicable && (post.roles ?? []).some((r) => user.preferredRoleIds.includes(r.id));
  const roleCheck: FitCheck | null = roleApplicable
    ? roleMatch
      ? { label: 'Role', text: 'Matches a role you prefer.', state: 'ok' }
      : { label: 'Role', text: 'This is not one of your preferred roles.', state: 'lower' }
    : null;

  // --- Score (same weights as before: 40 qualification, 30 age, 20 field, 10 role)
  const qualEarned = qualStatus === 'yes' || qualStatus === 'na' ? 40 : 0;
  const ageEarned = ageStatus === 'yes' ? 30 : 0;
  const hard = qualEarned + ageEarned;
  const share = hard / 70;
  const branchEarned = branchApplicable ? (branchMatch ? 20 : 0) : 20 * share;
  const roleEarned = roleApplicable ? (roleMatch ? 10 : 0) : 10 * share;
  const score = Math.round(Math.min(100, hard + branchEarned + roleEarned));

  // --- Verdict
  let verdict: FitVerdict;
  let label: string;
  if (qualStatus === 'no' || ageStatus === 'no' || reqResult.status === 'no') {
    verdict = 'not-eligible';
    label = 'Not eligible';
  } else if (prefFail) {
    verdict = 'not-eligible';
    label = 'Not in your preferences';
  } else if (qualStatus === 'unknown' || ageStatus === 'unknown' || reqResult.status === 'unknown') {
    verdict = 'unknown';
    label = 'Add details to check';
  } else {
    verdict = 'eligible';
    label = `${score}% match`;
  }

  const checks = [qualCheck, fieldCheck, ageCheck, ...reqResult.checks, roleCheck, prefCheck].filter((c): c is FitCheck => c !== null);
  return { verdict, score, label, checks };
}

const verdictRank = (v: FitVerdict) => (v === 'eligible' ? 2 : v === 'unknown' ? 1 : 0);

// The post that fits the user best decides how the whole job is shown.
export function bestFitForJob(ctx: FitContext, posts: PostLike[]): JobFit | null {
  if (posts.length === 0) return null;
  let best: { post: PostLike; evaluation: Evaluation } | null = null;
  for (const post of posts) {
    const evaluation = evaluatePost(ctx, post);
    if (
      !best ||
      verdictRank(evaluation.verdict) > verdictRank(best.evaluation.verdict) ||
      (verdictRank(evaluation.verdict) === verdictRank(best.evaluation.verdict) && evaluation.score > best.evaluation.score)
    ) {
      best = { post, evaluation };
    }
  }
  return best ? { evaluation: best.evaluation, postTitle: best.post.title ?? null, postCount: posts.length } : null;
}
