import { rng, shuffle } from '../random';
import { numberOptions, type Opts } from '../data/opts';

export type Spec =
  | { type: 'diffpow'; s: number; p: number; k0: number; sign: number }
  | { type: 'diffprime'; s: number; first: number; sign: number }
  | { type: 'muladd'; s: number; pat: number }
  | { type: 'decmul'; s: number; M: number }
  | { type: 'interleave'; a: number; d: number; b: number; e: number }
  | { type: 'altop'; s: number; p: number; q: number }
  | { type: 'linrec'; s: number; m: number; a: number };

export const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53];

// Six terms and the rule that makes them.
export function buildSeries(sp: Spec): { terms: number[]; rule: string } {
  const t: number[] = [];
  if (sp.type === 'diffpow') {
    t.push(sp.s);
    const ds: number[] = [];
    for (let i = 0; i < 5; i++) { const d = Math.pow(sp.k0 + i, sp.p); ds.push(d); t.push(t[i] + sp.sign * d); }
    const bases: number[] = [];
    for (let i = 0; i < 5; i++) bases.push(sp.k0 + i);
    return { terms: t, rule: 'The ' + (sp.sign > 0 ? 'differences are' : 'terms fall by') + ' the ' + (sp.p === 2 ? 'squares' : 'cubes') + ' of ' + bases.join(', ') + ' (' + ds.join(', ') + ').' };
  }
  if (sp.type === 'diffprime') {
    t.push(sp.s);
    const ds = PRIMES.slice(sp.first, sp.first + 5);
    ds.forEach((d, i) => t.push(t[i] + sp.sign * d));
    return { terms: t, rule: 'The ' + (sp.sign > 0 ? 'differences are' : 'terms fall by') + ' consecutive prime numbers: ' + ds.join(', ') + '.' };
  }
  if (sp.type === 'muladd') {
    t.push(sp.s);
    for (let i = 0; i < 5; i++) {
      const k = i + 1, x = t[i];
      t.push(sp.pat === 0 ? x * k + k : sp.pat === 1 ? x * k - k : sp.pat === 2 ? x * 2 + k : x * k + k * k);
    }
    const rules = [
      'Each term is the previous term multiplied by k and then k is added, for k = 1, 2, 3, 4, 5.',
      'Each term is the previous term multiplied by k and then k is subtracted, for k = 1, 2, 3, 4, 5.',
      'Each term is double the previous term plus k, for k = 1, 2, 3, 4, 5.',
      'Each term is the previous term multiplied by k and then k squared is added, for k = 1, 2, 3, 4, 5.',
    ];
    return { terms: t, rule: rules[sp.pat] };
  }
  if (sp.type === 'decmul') {
    t.push(sp.s);
    const ms: number[] = [];
    for (let i = 0; i < 5; i++) { ms.push(sp.M - i); t.push(t[i] * (sp.M - i)); }
    return { terms: t, rule: 'The terms are multiplied in turn by ' + ms.join(', ') + '.' };
  }
  if (sp.type === 'interleave') {
    for (let j = 0; j < 3; j++) { t.push(sp.a + j * sp.d); t.push(sp.b + j * sp.e); }
    return { terms: t, rule: 'Two series alternate. The 1st, 3rd and 5th terms ' + (sp.d > 0 ? 'rise' : 'fall') + ' by ' + Math.abs(sp.d) + ' each time, and the 2nd, 4th and 6th terms ' + (sp.e > 0 ? 'rise' : 'fall') + ' by ' + Math.abs(sp.e) + ' each time.' };
  }
  if (sp.type === 'altop') {
    t.push(sp.s);
    for (let i = 0; i < 5; i++) t.push(i % 2 === 0 ? t[i] + sp.p : t[i] * sp.q);
    return { terms: t, rule: 'The terms alternately add ' + sp.p + ' and multiply by ' + sp.q + ', starting with adding.' };
  }
  if (sp.type === 'linrec') {
    t.push(sp.s);
    for (let i = 0; i < 5; i++) t.push(t[i] * sp.m + sp.a);
    return { terms: t, rule: 'Each term is ' + sp.m + ' times the previous term ' + (sp.a >= 0 ? 'plus ' + sp.a : 'minus ' + -sp.a) + '.' };
  }
  throw new Error('unknown series type');
}

export const validTerms = (t: number[]) => t.every((x) => Number.isInteger(x) && x >= 1 && x <= 200000);

function lagrange(xs: number[], ys: number[], x: number): number {
  let sum = 0;
  for (let j = 0; j < xs.length; j++) {
    let term = ys[j];
    for (let m = 0; m < xs.length; m++) if (m !== j) term *= (x - xs[m]) / (xs[j] - xs[m]);
    sum += term;
  }
  return sum;
}

// True when a simple curve through the visible terms gives a different hidden number.
export function ambiguous(terms: number[], h: number): boolean {
  const vis: number[] = [];
  for (let i = 0; i < terms.length; i++) if (i !== h) vis.push(i);
  const want = terms[h];
  const near = (a: number, b: number) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b));
  for (let deg = 1; deg <= 3; deg++) {
    const nodes = vis.slice(0, deg + 1);
    const checks = vis.slice(deg + 1);
    // A curve counts only when at least two further visible terms confirm it, so a coincidence does not.
    if (checks.length < 2) continue;
    const ys = nodes.map((i) => terms[i]);
    if (checks.every((i) => near(lagrange(nodes, ys, i), terms[i])) && !near(lagrange(nodes, ys, h), want)) return true;
  }
  if (vis.every((i) => terms[i] > 0)) {
    const i1 = vis[0], i2 = vis[1];
    const r = Math.pow(terms[i2] / terms[i1], 1 / (i2 - i1));
    const a = terms[i1] / Math.pow(r, i1);
    if (vis.every((i) => near(a * Math.pow(r, i), terms[i])) && !near(a * Math.pow(r, h), want)) return true;
  }
  return false;
}

export function randomSpec(r: () => number): { spec: Spec; hard: boolean } {
  const n = (lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
  const sg = () => (r() < 0.5 ? 1 : -1);
  switch (Math.floor(r() * 8)) {
    case 0: return { spec: { type: 'diffpow', s: n(2, 40), p: 3, k0: n(1, 3), sign: 1 }, hard: true };
    case 1: return { spec: { type: 'diffpow', s: n(40, 400), p: 2, k0: n(2, 6), sign: sg() }, hard: false };
    case 2: { const sign = sg(); return { spec: { type: 'diffprime', s: sign < 0 ? n(150, 400) : n(2, 40), first: n(0, 9), sign }, hard: true }; }
    case 3: return { spec: { type: 'muladd', s: n(1, 8), pat: n(0, 3) }, hard: true };
    case 4: return { spec: { type: 'decmul', s: n(2, 9), M: n(5, 6) }, hard: true };
    case 5: { const d = sg() * n(2, 20); return { spec: { type: 'interleave', a: n(40, 200), d, b: n(40, 200), e: r() < 0.5 ? d : sg() * n(2, 20) }, hard: false }; }
    case 6: return { spec: { type: 'altop', s: n(1, 9), p: n(2, 9), q: n(2, 3) }, hard: false };
    default: return { spec: { type: 'linrec', s: n(1, 9), m: n(2, 4), a: n(-5, 7) }, hard: false };
  }
}

export interface SeriesQ { spec: Spec; terms: number[]; h: number; rule: string; hard: boolean }

export function makeSeries(seed: string): SeriesQ | null {
  for (let attempt = 0; attempt < 300; attempt++) {
    const r = rng(seed + '#' + attempt);
    const { spec, hard } = randomSpec(r);
    const { terms, rule } = buildSeries(spec);
    if (!validTerms(terms)) continue;
    const h = 1 + Math.floor(r() * 5);
    if (ambiguous(terms, h)) continue;
    return { spec, terms, h, rule, hard };
  }
  return null;
}

export const seriesStem = (q: SeriesQ) =>
  'Find the missing number in the following number series. ' + q.terms.map((x, i) => (i === q.h ? '?' : String(x))).join(', ');
export const seriesExplain = (q: SeriesQ) =>
  q.rule + ' So the missing number is ' + q.terms[q.h] + '. The complete series is ' + q.terms.join(', ') + '.';

export function seriesOptions(q: SeriesQ, r: () => number): Opts | null {
  const t = q.terms, h = q.h;
  const wrong: number[] = [];
  if (h >= 2) wrong.push(t[h - 1] + (t[h - 1] - t[h - 2]));
  if (h <= 4) wrong.push(Math.round((t[h - 1] + t[h + 1]) / 2));
  if (h >= 2 && t[h - 2] > 0) wrong.push(Math.round((t[h - 1] * t[h - 1]) / t[h - 2]));
  wrong.push(t[h] + 1, t[h] - 1, t[h] + 10);
  return numberOptions(t[h], shuffle(wrong, r), r);
}
