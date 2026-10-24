// Shared by the profile form, the admin job form and the matching rules.

export const BENCHMARK_DISABILITY_PERCENT = 40;

// The five groups most recruitment notifications use. Edit here if a notice uses different ones.
export const DISABILITY_TYPES = [
  { code: 'VISUAL', label: 'Blindness and low vision', short: 'Visual' },
  { code: 'HEARING', label: 'Deaf and hard of hearing', short: 'Hearing' },
  {
    code: 'LOCOMOTOR',
    label: 'Locomotor disability (including cerebral palsy, leprosy cured, dwarfism, acid attack victims, muscular dystrophy)',
    short: 'Locomotor',
  },
  { code: 'NEURO', label: 'Autism, intellectual disability, specific learning disability and mental illness', short: 'Autism / intellectual / learning / mental illness' },
  { code: 'MULTIPLE', label: 'Multiple disabilities (including deaf-blindness)', short: 'Multiple' },
] as const;

export const SPECIAL_STATUSES = [
  { code: 'EX_SERVICEMAN', label: 'Ex-serviceman' },
  { code: 'WIDOW', label: 'Widow' },
  { code: 'DIVORCED_WOMAN', label: 'Divorced woman (not remarried)' },
  { code: 'GOVT_EMPLOYEE', label: 'Government employee' },
] as const;

export const RULE_CATEGORIES = [
  { code: 'ANY', label: 'All categories' },
  { code: 'GENERAL', label: 'General' },
  { code: 'OBC', label: 'OBC' },
  { code: 'SC', label: 'SC' },
  { code: 'ST', label: 'ST' },
  { code: 'EWS', label: 'EWS' },
] as const;

export const RULE_STATUSES = [
  { code: 'NONE', label: 'No extra condition' },
  { code: 'PWD', label: 'Person with disability' },
  { code: 'EX_SERVICEMAN', label: 'Ex-serviceman' },
  { code: 'WIDOW', label: 'Widow' },
  { code: 'DIVORCED_WOMAN', label: 'Divorced woman' },
  { code: 'GOVT_EMPLOYEE', label: 'Government employee' },
] as const;

const STATUS_SHORT: Record<string, string> = {
  PWD: 'PwD',
  EX_SERVICEMAN: 'Ex-serviceman',
  WIDOW: 'Widow',
  DIVORCED_WOMAN: 'Divorced woman',
  GOVT_EMPLOYEE: 'Govt employee',
};

const CATEGORY_CODES = new Set<string>(RULE_CATEGORIES.map((c) => c.code));
const STATUS_CODES = new Set<string>(RULE_STATUSES.map((s) => s.code));
export const DISABILITY_CODES = new Set<string>(DISABILITY_TYPES.map((d) => d.code));
export const SPECIAL_STATUS_CODES = new Set<string>(SPECIAL_STATUSES.map((s) => s.code));

/** One relaxation row from a notification, such as "OBC + PwD: 13 extra years". */
export interface RelaxationRule {
  category: string;
  status: string;
  /** Extra years on top of the post's normal maximum age. */
  years: number | null;
  /** Or an absolute maximum age ("up to 35"). Wins over years when both are given. */
  maxAge: number | null;
  note: string | null;
}

const present = (value: unknown) => value !== undefined && value !== null && value !== '';

function toInt(value: unknown, min: number, max: number): number | null {
  if (!present(value)) return null;
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
}

export function parseRules(raw: unknown): { rules: RelaxationRule[]; errors: string[] } {
  const rules: RelaxationRule[] = [];
  const errors: string[] = [];
  if (raw === undefined || raw === null) return { rules, errors };
  if (!Array.isArray(raw)) return { rules, errors: ['Age relaxation must be a list of rules.'] };

  raw.forEach((item, index) => {
    const n = index + 1;
    if (!item || typeof item !== 'object') {
      errors.push(`Relaxation rule ${n} is not valid.`);
      return;
    }
    const r = item as Record<string, unknown>;
    if (typeof r.category !== 'string' || !CATEGORY_CODES.has(r.category)) {
      errors.push(`Relaxation rule ${n}: choose a category.`);
      return;
    }
    if (typeof r.status !== 'string' || !STATUS_CODES.has(r.status)) {
      errors.push(`Relaxation rule ${n}: choose who it applies to.`);
      return;
    }
    const years = toInt(r.years, 0, 40);
    const maxAge = toInt(r.maxAge, 14, 80);
    if (present(r.years) && years === null) {
      errors.push(`Relaxation rule ${n}: extra years must be a whole number from 0 to 40.`);
      return;
    }
    if (present(r.maxAge) && maxAge === null) {
      errors.push(`Relaxation rule ${n}: the maximum age must be a whole number from 14 to 80.`);
      return;
    }
    if (years === null && maxAge === null) {
      errors.push(`Relaxation rule ${n}: enter the extra years or the maximum age.`);
      return;
    }
    const note = typeof r.note === 'string' && r.note.trim() ? r.note.trim().slice(0, 200) : null;
    rules.push({ category: r.category, status: r.status, years, maxAge, note });
  });

  return { rules, errors };
}

export const sanitizeRules = (raw: unknown): RelaxationRule[] => parseRules(raw).rules;

export function ruleLabel(rule: RelaxationRule): string {
  const parts: string[] = [];
  if (rule.category !== 'ANY') parts.push(RULE_CATEGORIES.find((c) => c.code === rule.category)?.label ?? rule.category);
  if (rule.status !== 'NONE') parts.push(STATUS_SHORT[rule.status] ?? rule.status);
  return parts.join(' + ') || 'All candidates';
}

// The job page shows age relaxation from a simple label-to-text map, so the admin form's
// rules are also written in that shape.
export function legacyRelaxationMap(rules: RelaxationRule[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const rule of rules) {
    const text = rule.years != null ? `${rule.years} years` : rule.maxAge != null ? `up to ${rule.maxAge} years` : '';
    if (text) out[ruleLabel(rule)] = text;
  }
  return out;
}

export function userIsPwd(types: string[], percent: number | null | undefined): boolean {
  return types.length > 0 && (percent == null || percent >= BENCHMARK_DISABILITY_PERCENT);
}
