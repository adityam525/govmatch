import { FUNCTION_NAMES, evalExpr, identifiers, roundTo, tryParse } from './expr';
import { rng, shuffle } from './random';

export interface VarDef {
  name: string;
  kind: 'int' | 'decimal' | 'choice';
  min?: number;
  max?: number;
  step?: number;
  decimals?: number;
  choices?: number[];
}
export interface TemplateDef {
  text: string;
  variables: VarDef[];
  derived: { name: string; expr: string }[];
  constraints: string[];
  answer: { expr: string; decimals: number; unit?: string; allowNegative?: boolean };
  distractors: string[];
  explanation: string;
}
export interface Generated {
  values: Record<string, number>;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  answer: number;
  tries: number;
}
export type GenResult = { ok: true; q: Generated } | { ok: false; reason: string };

export const RESERVED = new Set(['answer', 'pi', ...FUNCTION_NAMES]);
const NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;
const PLACEHOLDER = /\{([A-Za-z_][A-Za-z0-9_]*)(?::(\d+))?\}/g;
export const MAX_TRIES = 50;

/** Shows a number with up to `d` decimals and no trailing zeros. */
export function fmt(n: number, d = 6): string {
  let s = n.toFixed(d);
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s === '-0' ? '0' : s;
}

function steps(v: VarDef): number {
  const d = v.decimals ?? 1;
  const step = v.step ?? (v.kind === 'int' ? 1 : 10 ** -d);
  return Math.floor(((v.max as number) - (v.min as number)) / step + 1e-9) + 1;
}

function draw(v: VarDef, rand: () => number): number {
  if (v.kind === 'choice') return (v.choices as number[])[Math.floor(rand() * (v.choices as number[]).length)];
  const d = v.decimals ?? 1;
  const step = v.step ?? (v.kind === 'int' ? 1 : 10 ** -d);
  const k = Math.floor(rand() * steps(v));
  const value = (v.min as number) + k * step;
  return v.kind === 'int' ? Math.round(value) : Number(value.toFixed(6));
}

function fill(text: string, env: Record<string, number>): string {
  return text.replace(PLACEHOLDER, (whole, name: string, dec?: string) => {
    if (!Object.prototype.hasOwnProperty.call(env, name)) return whole;
    return dec !== undefined ? env[name].toFixed(Number(dec)) : fmt(env[name]);
  });
}

export function generateOnce(t: TemplateDef, rand: () => number): GenResult {
  const values: Record<string, number> = {};
  for (const v of t.variables) values[v.name] = draw(v, rand);
  const env: Record<string, number> = { ...values };
  const d = t.answer.decimals;

  try {
    for (const dv of t.derived) env[dv.name] = evalExpr(dv.expr, env);
    for (const c of t.constraints) if (evalExpr(c, env) === 0) return { ok: false, reason: 'constraint' };

    const raw = evalExpr(t.answer.expr, env);
    const answer = roundTo(raw, d);
    if (Math.abs(raw - answer) > 1e-9 * Math.max(1, Math.abs(raw))) return { ok: false, reason: 'answer-not-clean' };
    if (answer < 0 && !t.answer.allowNegative) return { ok: false, reason: 'answer-negative' };

    const seen = new Set<string>([fmt(answer, d)]);
    const wrong: number[] = [];
    const accept = (x: number) => {
      if (!Number.isFinite(x) || (x < 0 && !t.answer.allowNegative)) return false;
      const key = fmt(x, d);
      if (seen.has(key)) return false;
      seen.add(key);
      wrong.push(x);
      return true;
    };

    const fromFormulas: number[] = [];
    for (const expr of t.distractors) {
      try { fromFormulas.push(roundTo(evalExpr(expr, env), d)); } catch { /* an unusable wrong-answer formula is skipped */ }
    }
    for (const x of shuffle(fromFormulas, rand)) { if (wrong.length < 3) accept(x); }

    const unit = Math.max(10 ** -d, roundTo(Math.abs(answer) * 0.1, d));
    for (const maxK of [4, 20]) {
      if (wrong.length >= 3) break;
      const near: number[] = [];
      for (let k = 1; k <= maxK; k++) near.push(roundTo(answer + k * unit, d), roundTo(answer - k * unit, d));
      for (const x of shuffle(near, rand)) { if (wrong.length < 3) accept(x); }
    }
    if (wrong.length < 3) return { ok: false, reason: 'options' };

    const options = shuffle([answer, ...wrong], rand);
    env.answer = answer;
    return {
      ok: true,
      q: {
        values,
        text: fill(t.text, env),
        options: options.map((x) => fmt(x, d)),
        correctIndex: options.indexOf(answer),
        explanation: fill(t.explanation, env),
        answer,
        tries: 1,
      },
    };
  } catch (e) {
    return { ok: false, reason: 'math: ' + (e instanceof Error ? e.message : 'error') };
  }
}

export function generate(t: TemplateDef, seed: string, maxTries = MAX_TRIES): GenResult {
  let last = 'no draw';
  for (let i = 0; i < maxTries; i++) {
    const r = generateOnce(t, rng(seed + '#' + i));
    if (r.ok) return { ok: true, q: { ...r.q, tries: i + 1 } };
    last = r.reason;
  }
  return { ok: false, reason: last };
}

export interface Report {
  ok: boolean;
  errors: string[];
  warnings: string[];
  draws: number;
  accepted: number;
  failed: number;
  averageTries: number;
  reasons: Record<string, number>;
  answerMin: number | null;
  answerMax: number | null;
  samples: Generated[];
}

function staticErrors(t: TemplateDef): string[] {
  const errors: string[] = [];
  if (!t.text || !t.text.trim()) errors.push('The question text is empty.');
  if (!t.variables || t.variables.length === 0) errors.push('Add at least one variable, or every learner sees the same question.');
  if (!Number.isInteger(t.answer?.decimals) || t.answer.decimals < 0 || t.answer.decimals > 4) errors.push('Answer decimals must be a whole number from 0 to 4.');

  const known = new Set<string>();
  const declare = (name: string, what: string) => {
    if (!NAME.test(name || '')) { errors.push(what + ' "' + name + '" is not a valid name (letters, digits, underscore).'); return; }
    if (RESERVED.has(name)) { errors.push(what + ' "' + name + '" is reserved.'); return; }
    if (known.has(name)) { errors.push('The name "' + name + '" is used twice.'); return; }
    known.add(name);
  };

  for (const v of t.variables ?? []) {
    declare(v.name, 'Variable');
    if (v.kind === 'choice') {
      const c = v.choices ?? [];
      if (c.length === 0 || c.length > 200 || c.some((x) => !Number.isFinite(x))) errors.push('Variable "' + v.name + '" needs 1 to 200 numeric choices.');
    } else if (v.kind === 'int' || v.kind === 'decimal') {
      const d = v.decimals ?? 1;
      const step = v.step ?? (v.kind === 'int' ? 1 : 10 ** -d);
      if (!Number.isFinite(v.min) || !Number.isFinite(v.max) || !(step > 0) || (v.min as number) > (v.max as number)) {
        errors.push('Variable "' + v.name + '" needs min, max and a step above 0, with min not above max.');
      } else if (v.kind === 'int' && !(Number.isInteger(v.min) && Number.isInteger(v.max) && Number.isInteger(step))) {
        errors.push('Whole-number variable "' + v.name + '" needs whole min, max and step.');
      } else if (v.kind === 'decimal' && (d < 0 || d > 4 || !Number.isInteger(d))) {
        errors.push('Variable "' + v.name + '" decimals must be 0 to 4.');
      } else if (steps(v) > 1_000_000) errors.push('Variable "' + v.name + '" has too many possible values.');
    } else errors.push('Variable "' + v.name + '" has an unknown type.');
  }

  const checkExpr = (src: string, label: string) => {
    const r = tryParse(src ?? '');
    if (!r.ok) { errors.push(label + ': ' + r.error); return; }
    for (const id of identifiers(r.node)) {
      if (!known.has(id) && id !== 'pi') errors.push(label + ' uses "' + id + '", which is not defined before it.');
    }
  };
  for (const dv of t.derived ?? []) {
    checkExpr(dv.expr, 'Value "' + dv.name + '"');
    declare(dv.name, 'Value');
  }
  for (const c of t.constraints ?? []) checkExpr(c, 'Rule "' + c + '"');
  checkExpr(t.answer?.expr, 'Answer formula');
  (t.distractors ?? []).forEach((d, i) => checkExpr(d, 'Wrong-answer formula ' + (i + 1)));

  const allowed = new Set([...known, 'answer']);
  for (const [label, text] of [['The question', t.text], ['The explanation', t.explanation]] as [string, string][]) {
    for (const m of (text ?? '').matchAll(PLACEHOLDER)) {
      if (!allowed.has(m[1])) errors.push(label + ' uses {' + m[1] + '}, which is not defined.');
    }
  }
  return errors;
}

export function validateTemplate(t: TemplateDef, draws = 200): Report {
  const base: Report = { ok: false, errors: staticErrors(t), warnings: [], draws: 0, accepted: 0, failed: 0, averageTries: 0, reasons: {}, answerMin: null, answerMax: null, samples: [] };
  if (base.errors.length > 0) return base;

  let tries = 0;
  const answers = new Set<number>();
  for (let i = 0; i < draws; i++) {
    const r = generate(t, 'validate#' + i);
    base.draws++;
    if (r.ok) {
      base.accepted++;
      tries += r.q.tries;
      answers.add(r.q.answer);
      if (base.samples.length < 5) base.samples.push(r.q);
      base.answerMin = base.answerMin === null ? r.q.answer : Math.min(base.answerMin, r.q.answer);
      base.answerMax = base.answerMax === null ? r.q.answer : Math.max(base.answerMax, r.q.answer);
    } else {
      base.failed++;
      const key = r.reason.split(':')[0];
      base.reasons[key] = (base.reasons[key] ?? 0) + 1;
    }
  }
  base.averageTries = base.accepted ? Math.round((tries / base.accepted) * 10) / 10 : 0;

  if (base.accepted === 0) base.errors.push('No valid question could be drawn. Reasons: ' + JSON.stringify(base.reasons));
  else if (base.failed > draws * 0.01) base.errors.push(base.failed + ' of ' + draws + ' draws failed. Reasons: ' + JSON.stringify(base.reasons));
  if (base.averageTries > 10) base.warnings.push('Many draws are rejected (about ' + base.averageTries + ' tries each). Narrow the ranges or loosen the rules.');
  if (base.accepted > 0 && answers.size < 10) base.warnings.push('Only ' + answers.size + ' different answers appear in ' + base.accepted + ' draws. The question may feel repetitive.');
  if (!(t.explanation ?? '').trim()) base.warnings.push('There is no explanation.');
  base.ok = base.errors.length === 0;
  return base;
}
