import { slugify } from '@/lib/lookup-api';
import type { TemplateDef, VarDef } from './template';

export const DIFFICULTY_CODES = ['EASY', 'MEDIUM', 'HARD'] as const;

const blank = (v: unknown) => v === '' || v === null || v === undefined;
// undefined when empty, NaN when not a number
const num = (v: unknown): number | undefined => (blank(v) || typeof v === 'boolean' ? undefined : Number(v));
const list = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

export function coerceDefinition(raw: unknown): { error: string } | { def: TemplateDef } {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { error: 'The template definition is missing.' };
  const r = raw as Record<string, unknown>;

  const text = str(r.text);
  if (text.length > 2000) return { error: 'The question text can be up to 2000 characters.' };
  const explanation = str(r.explanation);
  if (explanation.length > 3000) return { error: 'The explanation can be up to 3000 characters.' };

  if (list(r.variables).length > 12) return { error: 'Use at most 12 variables.' };
  if (list(r.derived).length > 12) return { error: 'Use at most 12 calculated values.' };
  if (list(r.constraints).length > 10) return { error: 'Use at most 10 rules.' };
  if (list(r.distractors).length > 8) return { error: 'Use at most 8 wrong-answer formulas.' };

  const variables: VarDef[] = [];
  for (const [i, item] of list(r.variables).entries()) {
    const o = (item ?? {}) as Record<string, unknown>;
    const kind = str(o.kind);
    if (kind !== 'int' && kind !== 'decimal' && kind !== 'choice') return { error: 'Variable ' + (i + 1) + ': choose whole number, decimal or list of choices.' };
    const v: VarDef = { name: str(o.name), kind };
    if (kind === 'choice') {
      const raw = Array.isArray(o.choices) ? o.choices : typeof o.choices === 'string' ? o.choices.split(',') : [];
      v.choices = raw.map((c) => String(c).trim()).filter(Boolean).map(Number);
    } else {
      const min = num(o.min), max = num(o.max), step = num(o.step), dec = num(o.decimals);
      if (min !== undefined) v.min = min;
      if (max !== undefined) v.max = max;
      if (step !== undefined) v.step = step;
      if (dec !== undefined) v.decimals = dec;
    }
    variables.push(v);
  }

  const derived = list(r.derived)
    .map((x) => ({ name: str((x as Record<string, unknown>)?.name), expr: str((x as Record<string, unknown>)?.expr) }))
    .filter((d) => d.name || d.expr);
  const constraints = list(r.constraints).map(str).filter(Boolean);
  const distractors = list(r.distractors).map(str).filter(Boolean);

  const a = (r.answer ?? {}) as Record<string, unknown>;
  const decimals = num(a.decimals);
  const def: TemplateDef = {
    text, variables, derived, constraints,
    answer: { expr: str(a.expr), decimals: decimals === undefined ? 0 : decimals, allowNegative: a.allowNegative === true, ...(str(a.unit) ? { unit: str(a.unit) } : {}) },
    distractors, explanation,
  };
  return { def };
}

export interface TemplateMeta { title: string; slug: string; topicId: string; difficulty: string; expectedSeconds: number }

export function cleanMeta(body: Record<string, unknown>): { error: string } | { meta: TemplateMeta } {
  const title = str(body.title);
  if (!title || title.length > 150) return { error: 'Enter a title (up to 150 characters).' };
  const slug = slugify(str(body.slug) || title).slice(0, 100).replace(/-+$/g, '');
  if (!slug) return { error: 'The address needs letters or numbers.' };
  const topicId = str(body.topicId);
  if (!topicId) return { error: 'Choose the topic.' };
  const difficulty = str(body.difficulty) || 'MEDIUM';
  if (!(DIFFICULTY_CODES as readonly string[]).includes(difficulty)) return { error: 'Choose Easy, Medium or Hard.' };
  const secondsRaw = num(body.expectedSeconds);
  const expectedSeconds = secondsRaw === undefined ? 60 : secondsRaw;
  if (!Number.isInteger(expectedSeconds) || expectedSeconds < 10 || expectedSeconds > 600) return { error: 'Expected time must be a whole number of seconds from 10 to 600.' };
  return { meta: { title, slug, topicId, difficulty, expectedSeconds } };
}
