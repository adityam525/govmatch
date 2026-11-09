import { generate, type TemplateDef } from './template';
import { rng, shuffle } from './random';

export type Level = 'EASY' | 'MEDIUM' | 'HARD';
const LEVELS: Level[] = ['EASY', 'MEDIUM', 'HARD'];

export interface PoolTemplate { id: string; title: string; difficulty: string; expectedSeconds: number; def: TemplateDef }
export interface ComposeConfig {
  count: number;
  mix?: Partial<Record<Level, number>>;
  marks: number;
  negativeMarks: number;
  durationMinutes?: number | null;
  seed: string;
}
export interface ComposedQuestion {
  id: string; text: string; options: string[]; correctIndex: number; marks: number; negativeMarks: number;
  explanation: string | null; templateId: string; difficulty: string; seconds: number;
}
export type ComposeResult =
  | { ok: true; questions: ComposedQuestion[]; durationMinutes: number; shortfall: number }
  | { ok: false; reason: string };

export const MAX_QUESTIONS = 100;

/** Splits `count` by weight so the parts always add up (largest remainder). */
export function allocate(count: number, weights: Record<string, number>): Record<string, number> {
  const keys = Object.keys(weights).filter((k) => weights[k] > 0);
  const out: Record<string, number> = Object.fromEntries(Object.keys(weights).map((k) => [k, 0]));
  const total = keys.reduce((n, k) => n + weights[k], 0);
  if (keys.length === 0 || total <= 0 || count <= 0) return out;
  const raw = keys.map((k) => ({ k, exact: (count * weights[k]) / total }));
  for (const r of raw) out[r.k] = Math.floor(r.exact);
  let left = count - raw.reduce((n, r) => n + Math.floor(r.exact), 0);
  const byFraction = [...raw].sort((a, b) => b.exact - Math.floor(b.exact) - (a.exact - Math.floor(a.exact)));
  for (let i = 0; left > 0; i = (i + 1) % byFraction.length, left--) out[byFraction[i].k] += 1;
  return out;
}

export function composeTest(pool: PoolTemplate[], cfg: ComposeConfig): ComposeResult {
  const count = Math.floor(cfg.count);
  if (!Number.isFinite(count) || count < 1 || count > MAX_QUESTIONS) return { ok: false, reason: 'Choose between 1 and ' + MAX_QUESTIONS + ' questions.' };
  if (pool.length === 0) return { ok: false, reason: 'No published questions match these choices.' };

  const r = rng(cfg.seed);
  const byLevel = new Map<Level, PoolTemplate[]>();
  for (const t of pool) {
    const level = (LEVELS as string[]).includes(t.difficulty) ? (t.difficulty as Level) : 'MEDIUM';
    byLevel.set(level, [...(byLevel.get(level) ?? []), t]);
  }
  const available = LEVELS.filter((l) => (byLevel.get(l)?.length ?? 0) > 0);
  const mixSum = available.reduce((n, l) => n + (cfg.mix?.[l] ?? 0), 0);
  const weights: Record<string, number> = {};
  for (const l of available) weights[l] = mixSum > 0 ? cfg.mix?.[l] ?? 0 : 1;
  const counts = allocate(count, weights);

  const seen = new Set<string>();
  const made: ComposedQuestion[] = [];
  const add = (t: PoolTemplate, tag: string): boolean => {
    for (let attempt = 0; attempt < 6; attempt++) {
      const g = generate(t.def, cfg.seed + ':' + tag + ':' + attempt);
      if (!g.ok || seen.has(g.q.text)) continue;
      seen.add(g.q.text);
      made.push({
        id: '', text: g.q.text, options: g.q.options, correctIndex: g.q.correctIndex, marks: cfg.marks, negativeMarks: cfg.negativeMarks,
        explanation: g.q.explanation || null, templateId: t.id, difficulty: t.difficulty, seconds: t.expectedSeconds,
      });
      return true;
    }
    return false;
  };

  for (const l of available) {
    const order = shuffle(byLevel.get(l) as PoolTemplate[], r);
    for (let i = 0; i < counts[l]; i++) add(order[i % order.length], l + ':' + i);
  }
  // Top up from any level if some draws were duplicates.
  const everything = shuffle(pool, r);
  for (let i = 0; made.length < count && i < count * 4; i++) add(everything[i % everything.length], 'fill:' + i);

  if (made.length === 0) return { ok: false, reason: 'Could not generate questions from the selected templates.' };
  const finalList = shuffle(made, r).slice(0, count).map((q, i) => ({ ...q, id: 'g' + (i + 1) }));
  const minutes = cfg.durationMinutes && cfg.durationMinutes > 0 ? Math.round(cfg.durationMinutes) : Math.max(1, Math.ceil(finalList.reduce((n, q) => n + q.seconds, 0) / 60));
  return { ok: true, questions: finalList, durationMinutes: minutes, shortfall: count - finalList.length };
}
