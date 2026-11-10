// Minimum marks (with a different cut-off per category) and typing-speed requirements.
// Pure functions, no database.

export interface RuleCheck { label: string; text: string; state: 'ok' | 'fail' | 'unknown' | 'lower' }
export interface RuleResult { status: 'yes' | 'no' | 'unknown'; checks: RuleCheck[] }
export interface TypingOption { lang: 'EN' | 'HI'; wpm: number }

const YES: RuleResult = { status: 'yes', checks: [] };
const LANG = { EN: 'English', HI: 'Hindi' } as const;

export function parseTypingOptions(raw: unknown): TypingOption[] {
  if (!Array.isArray(raw)) return [];
  const out: TypingOption[] = [];
  for (const item of raw) {
    const o = (item ?? {}) as Record<string, unknown>;
    const wpm = Number(o.wpm);
    if ((o.lang === 'EN' || o.lang === 'HI') && Number.isFinite(wpm) && wpm > 0 && wpm <= 200) out.push({ lang: o.lang, wpm: Math.round(wpm) });
  }
  return out;
}

export function parseCategoryMarks(raw: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const n = Number(value);
    if (value !== '' && value !== null && Number.isFinite(n) && n >= 0 && n <= 100) out[key.trim().toUpperCase()] = n;
  }
  return out;
}

export interface MarksPost { minMarksPercent?: number | null; minMarksByCategory?: unknown }

/** The cut-off for one category: its own figure if the notice gives one, otherwise the base minimum. */
export function marksCutoff(post: MarksPost, category: string | null | undefined, layer?: string | null): number | 'unknown-category' | null {
  const byCategory = parseCategoryMarks(post.minMarksByCategory);
  const base = post.minMarksPercent != null && post.minMarksPercent >= 0 ? post.minMarksPercent : null;
  const key = (category ?? '').trim().toUpperCase();
  if (!key) return Object.keys(byCategory).length > 0 ? 'unknown-category' : base;
  if (key === 'OBC' && layer === 'NON_CREAMY' && byCategory.OBC_NCL !== undefined) return byCategory.OBC_NCL;
  return byCategory[key] ?? base;
}

export function evaluateMarks(post: MarksPost, category: string | null | undefined, percentage: number | null | undefined, layer?: string | null): RuleResult {
  const cutoff = marksCutoff(post, category, layer);
  if (cutoff === null) return YES;
  if (cutoff === 'unknown-category') {
    return { status: 'unknown', checks: [{ label: 'Marks', text: 'The minimum marks depend on your category. Add your category to check.', state: 'unknown' }] };
  }
  if (percentage == null) {
    return { status: 'unknown', checks: [{ label: 'Marks', text: 'Needs at least ' + cutoff + '% marks. Add your percentage to your education to check.', state: 'unknown' }] };
  }
  if (percentage + 1e-9 >= cutoff) {
    return { status: 'yes', checks: [{ label: 'Marks', text: 'Your ' + percentage + '% meets the ' + cutoff + '% minimum.', state: 'ok' }] };
  }
  return { status: 'no', checks: [{ label: 'Marks', text: 'Needs at least ' + cutoff + '% marks; you have ' + percentage + '%.', state: 'fail' }] };
}

const describe = (o: TypingOption) => LANG[o.lang] + ' ' + o.wpm + ' WPM';

// Any one option is enough. A missing speed is "unknown" only if that option could still be met.
export function evaluateTyping(raw: unknown, english: number | null | undefined, hindi: number | null | undefined): RuleResult {
  const options = parseTypingOptions(raw);
  if (options.length === 0) return YES;
  const need = options.map(describe).join(' or ');
  let anyUnknown = false;
  for (const o of options) {
    const mine = o.lang === 'EN' ? english : hindi;
    if (mine == null) { anyUnknown = true; continue; }
    if (mine >= o.wpm) return { status: 'yes', checks: [{ label: 'Typing', text: 'Your ' + LANG[o.lang] + ' typing speed (' + mine + ' WPM) meets the requirement (' + need + ').', state: 'ok' }] };
  }
  if (anyUnknown) return { status: 'unknown', checks: [{ label: 'Typing', text: 'Needs typing speed: ' + need + '. Add your typing speed to your profile to check.', state: 'unknown' }] };
  return { status: 'no', checks: [{ label: 'Typing', text: 'Needs typing speed: ' + need + '. Your speed is below the requirement.', state: 'fail' }] };
}

export function mergeResults(base: RuleResult, extra: RuleResult[]): RuleResult {
  const all = [base, ...extra];
  const status = all.some((r) => r.status === 'no') ? 'no' : all.some((r) => r.status === 'unknown') ? 'unknown' : 'yes';
  return { status, checks: all.flatMap((r) => r.checks) };
}

const LEVEL_NAMES: Record<number, string> = { 1: '8th Pass', 2: '10th Pass', 3: '12th Pass', 4: 'ITI / Apprentice', 5: 'Diploma', 6: 'Graduate', 7: 'Post Graduate', 8: 'Doctorate' };
const levelName = (n: number) => LEVEL_NAMES[n] ?? 'level ' + n;

// Some notices bar candidates whose education is higher than a stated limit.
export function evaluateMaxEducation(max: number | null | undefined, levels: number[]): RuleResult {
  if (max == null) return YES;
  if (levels.length === 0) {
    return { status: 'unknown', checks: [{ label: 'Education limit', text: 'Candidates above ' + levelName(max) + ' cannot apply. Add your education to check.', state: 'unknown' }] };
  }
  const highest = Math.max(...levels);
  if (highest <= max) return { status: 'yes', checks: [{ label: 'Education limit', text: 'Your highest education (' + levelName(highest) + ') is within the limit of ' + levelName(max) + '.', state: 'ok' }] };
  return { status: 'no', checks: [{ label: 'Education limit', text: 'This post is for candidates up to ' + levelName(max) + '. Your highest education is ' + levelName(highest) + '.', state: 'fail' }] };
}

// English shorthand speed (for example 110 WPM), handled like typing: meet it, miss it, or add details.
export function evaluateShorthand(required: number | null | undefined, mine: number | null | undefined): RuleResult {
  if (required == null) return YES;
  if (mine == null) return { status: 'unknown', checks: [{ label: 'Shorthand', text: 'Needs English shorthand at ' + required + ' WPM. Add your shorthand speed to your profile to check.', state: 'unknown' }] };
  if (mine >= required) return { status: 'yes', checks: [{ label: 'Shorthand', text: 'Your shorthand speed (' + mine + ' WPM) meets the ' + required + ' WPM requirement.', state: 'ok' }] };
  return { status: 'no', checks: [{ label: 'Shorthand', text: 'Needs English shorthand at ' + required + ' WPM; your speed is ' + mine + ' WPM.', state: 'fail' }] };
}

// Years of driving experience, for driver posts. Separate from general experience and from the licence.
export function evaluateDriving(required: number | null | undefined, mine: number | null | undefined): RuleResult {
  if (required == null || required <= 0) return YES;
  if (mine == null) return { status: 'unknown', checks: [{ label: 'Driving experience', text: 'Needs ' + required + ' years of driving experience. Add your driving experience to your profile to check.', state: 'unknown' }] };
  if (mine >= required) return { status: 'yes', checks: [{ label: 'Driving experience', text: 'Your ' + mine + ' years of driving experience meets the ' + required + ' years needed.', state: 'ok' }] };
  return { status: 'no', checks: [{ label: 'Driving experience', text: 'Needs ' + required + ' years of driving experience; you have ' + mine + '.', state: 'fail' }] };
}
