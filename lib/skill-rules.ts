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
export function marksCutoff(post: MarksPost, category: string | null | undefined): number | 'unknown-category' | null {
  const byCategory = parseCategoryMarks(post.minMarksByCategory);
  const base = post.minMarksPercent != null && post.minMarksPercent >= 0 ? post.minMarksPercent : null;
  const key = (category ?? '').trim().toUpperCase();
  if (!key) return Object.keys(byCategory).length > 0 ? 'unknown-category' : base;
  return byCategory[key] ?? base;
}

export function evaluateMarks(post: MarksPost, category: string | null | undefined, percentage: number | null | undefined): RuleResult {
  const cutoff = marksCutoff(post, category);
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
