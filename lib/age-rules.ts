import { ageInYears } from './eligibility-reasons';
import {
  DISABILITY_TYPES,
  ruleLabel,
  sanitizeRules,
  userIsPwd,
  type RelaxationRule,
} from './special-categories';

export interface AgeUser {
  dateOfBirth: Date | null;
  category: string | null;
  disabilityTypes?: string[];
  disabilityPercent?: number | null;
  specialStatuses?: string[];
}

export interface AgePost {
  minAge?: number | null;
  maxAge?: number | null;
  /** Older free-form map such as { OBC: "3 years" }; used only when no structured rules exist. */
  ageRelaxation?: unknown;
  relaxationRules?: unknown;
  /** Disability groups the post's PwD relaxation is open to. Empty means the notice does not say. */
  pwdTypes?: string[];
}

export interface AgeCheck {
  label: string;
  text: string;
  state: 'ok' | 'fail' | 'unknown' | 'lower';
}

export interface AgeResult {
  status: 'yes' | 'no' | 'unknown';
  checks: AgeCheck[];
}

const CATEGORY_WORDS = ['general', 'obc', 'sc', 'st', 'ews'];

function legacyRules(raw: unknown): RelaxationRule[] {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return [];
  const out: RelaxationRule[] = [];
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const match = String(value).match(/\d{1,2}/);
    if (!match) continue;
    const tokens = key.toLowerCase().split(/[^a-z]+/).filter(Boolean);
    for (const token of tokens.filter((t) => CATEGORY_WORDS.includes(t))) {
      out.push({ category: token.toUpperCase(), status: 'NONE', years: Number(match[0]), maxAge: null, note: null });
    }
  }
  return out;
}

const unique = (items: string[]) => [...new Set(items)];
const typeLabel = (code: string) => DISABILITY_TYPES.find((d) => d.code === code)?.short ?? code;

export function evaluateAge(user: AgeUser, post: AgePost, now: Date = new Date()): AgeResult {
  const { minAge, maxAge } = post;
  if (minAge == null && maxAge == null) return { status: 'yes', checks: [] };

  if (!user.dateOfBirth) {
    return {
      status: 'unknown',
      checks: [{ label: 'Age', text: 'Add your date of birth so we can check the age limit.', state: 'unknown' }],
    };
  }

  const age = ageInYears(user.dateOfBirth, now);
  const range =
    minAge != null && maxAge != null ? `${minAge} to ${maxAge}` : maxAge != null ? `up to ${maxAge}` : `${minAge} and above`;

  if (minAge != null && age < minAge) {
    return { status: 'no', checks: [{ label: 'Age', text: `Minimum age is ${minAge} years; you are ${age}.`, state: 'fail' }] };
  }
  if (maxAge == null || age <= maxAge) {
    return { status: 'yes', checks: [{ label: 'Age', text: `Your age (${age}) fits the limit of ${range} years.`, state: 'ok' }] };
  }

  // Over the normal limit: find the best relaxation rule this user can claim. Rules are
  // alternatives, not additions, so the most generous one wins.
  const structured = sanitizeRules(post.relaxationRules);
  const rules = structured.length > 0 ? structured : legacyRules(post.ageRelaxation);

  const disabilityTypes = user.disabilityTypes ?? [];
  const specialStatuses = user.specialStatuses ?? [];
  const pwd = userIsPwd(disabilityTypes, user.disabilityPercent);
  const pwdTypes = post.pwdTypes ?? [];
  const typeFits = pwdTypes.length === 0 || disabilityTypes.some((t) => pwdTypes.includes(t));
  const wantedCategory = (user.category ?? '').toUpperCase();

  let best: { rule: RelaxationRule; limit: number } | null = null;
  const unclaimed: string[] = [];
  const typeMismatch: string[] = [];

  for (const rule of rules) {
    if (rule.category !== 'ANY' && rule.category !== wantedCategory) continue;

    if (rule.status === 'PWD') {
      if (!pwd) {
        unclaimed.push(ruleLabel(rule));
        continue;
      }
      if (!typeFits) {
        typeMismatch.push(ruleLabel(rule));
        continue;
      }
    } else if (rule.status !== 'NONE' && !specialStatuses.includes(rule.status)) {
      unclaimed.push(ruleLabel(rule));
      continue;
    }

    const limit = rule.maxAge ?? (rule.years != null ? maxAge + rule.years : null);
    if (limit == null) continue;
    if (!best || limit > best.limit) best = { rule, limit };
  }

  if (best && age <= best.limit) {
    return {
      status: 'yes',
      checks: [
        {
          label: 'Age',
          text: `Your age (${age}) fits the limit of ${range} years, using the relaxation for ${ruleLabel(best.rule)} (up to ${best.limit}).`,
          state: 'ok',
        },
      ],
    };
  }

  let text = `Age limit is ${range} years${best ? ` (up to ${best.limit} with ${ruleLabel(best.rule)} relaxation)` : ''}; you are ${age}.`;
  if (unclaimed.length > 0) {
    text += ` This job lists relaxation for ${unique(unclaimed).join(', ')}. If it applies to you, add it to your profile.`;
  }
  if (typeMismatch.length > 0) {
    text += ` The PwD relaxation here is open only to ${pwdTypes.map(typeLabel).join(', ')}.`;
  }
  if (!best && rules.length === 0 && user.category && user.category.toUpperCase() !== 'GENERAL') {
    text += ` Candidates in the ${user.category} category often get age relaxation, so check the official notice.`;
  }
  return { status: 'no', checks: [{ label: 'Age', text, state: 'fail' }] };
}
