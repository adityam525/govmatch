import { rng, shuffle } from '../random';
import { gcd, isTwoDecimals, numberOptions, ratioOptions, round2, type DQ2 } from './opts';

export interface Pie { T: number; names: string[]; pct: number[]; tot: number[]; fem: number[]; mal: number[]; F: number; hidden: number }

export function pieFrom(T: number, pct: number[], fem: number[], hidden: number): Pie | null {
  const tot = pct.map((p) => (T * p) / 100);
  if (tot.some((t) => !Number.isInteger(t))) return null;
  const mal = tot.map((t, i) => t - fem[i]);
  if (mal.some((m) => m < 1) || fem.some((f) => f < 1)) return null;
  return { T, names: ['A', 'B', 'C', 'D'], pct, tot, fem, mal, F: fem.reduce((n, f) => n + f, 0), hidden };
}

const sumOf = (a: number[], ix: number[]) => ix.reduce((n, k) => n + a[k], 0);
export const pAvgMales = (p: Pie, ix: number[]) => sumOf(p.mal, ix) / ix.length;
export const pRatioNums = (p: Pie, m: number[], f: number[]): [number, number] => [sumOf(p.mal, m), sumOf(p.fem, f)];
export const pFemPctOfTotal = (p: Pie, ix: number[], c: number) => (sumOf(p.fem, ix) * 100) / p.tot[c];
export const pNewMalesPct = (p: Pie, k: number, q: number, c: number) =>
  (Math.abs((k * p.fem[p.hidden] * (100 - q)) / 100 - p.tot[c]) * 100) / p.tot[c];
export const pDiff = (p: Pie, a: number, b: number, c: number) => Math.abs(p.tot[a] + p.tot[b] - 2 * p.mal[c]);

const names = (p: Pie, ix: number[]) => {
  const n = ix.map((k) => p.names[k]);
  return n.length === 1 ? n[0] : n.slice(0, -1).join(', ') + ' and ' + n[n.length - 1];
};

export function pieStem(p: Pie): string {
  return 'The first pie chart shows the share of the ' + p.T + ' students of four colleges: '
    + p.names.map((n, i) => 'college ' + n + ' ' + round2(p.pct[i]) + '%').join(', ')
    + '. The second pie chart shows the number of females in these colleges (' + p.F + ' in all): '
    + p.names.map((n, i) => 'college ' + n + ' ' + (i === p.hidden ? 'X' : p.fem[i])).join(', ')
    + ', where X is the number of females in college ' + p.names[p.hidden] + '.';
}

function working(p: Pie): string {
  const others = p.fem.filter((_, i) => i !== p.hidden);
  return 'Total students: ' + p.names.map((n, i) => n + ' ' + p.tot[i]).join(', ')
    + '. X = ' + p.F + ' - ' + others.join(' - ') + ' = ' + p.fem[p.hidden]
    + '. Males: ' + p.names.map((n, i) => n + ' ' + p.mal[i]).join(', ') + '.';
}

type PB = (p: Pie, r: () => number) => DQ2 | null;
const PAIRS: number[][] = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];

const bAvg: PB = (p, r) => {
  for (const s of shuffle([[0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]], r)) {
    const ans = pAvgMales(p, s);
    if (!Number.isInteger(ans)) continue;
    const o = numberOptions(ans, [Math.round(sumOf(p.fem, s) / 3), Math.round(sumOf(p.tot, s) / 3), ans * 3, Math.round(sumOf(p.mal, s) / 2)], r);
    if (!o) continue;
    return {
      kind: 'avg', args: s, answer: ans, ...o, hard: false,
      text: 'Find the average number of males in colleges ' + names(p, s) + '.',
      explanation: working(p) + ' Males in ' + names(p, s) + ': ' + s.map((k) => p.mal[k]).join(' + ') + ' = ' + ans * 3 + ', so the average is ' + ans * 3 + ' / 3 = ' + ans + '.',
    };
  }
  return null;
};

const bRatio: PB = (p, r) => {
  const m = PAIRS[Math.floor(r() * 6)], f = PAIRS[Math.floor(r() * 6)];
  const [a, b] = pRatioNums(p, m, f);
  const o = ratioOptions(a, b, r, [[sumOf(p.fem, m), sumOf(p.mal, f)], [sumOf(p.tot, m), b], [a, sumOf(p.tot, f)]]);
  if (!o) return null;
  const g = gcd(a, b);
  return {
    kind: 'ratio', args: [...m, ...f], answer: a / b, ratio: a / g + ':' + b / g, ...o, hard: true,
    text: 'Find the ratio of the males in colleges ' + names(p, m) + ' together to the females in colleges ' + names(p, f) + ' together.',
    explanation: working(p) + ' Males in ' + names(p, m) + ' = ' + a + '. Females in ' + names(p, f) + ' = ' + b + '. The ratio is ' + a + ':' + b + ' = ' + a / g + ':' + b / g + '.',
  };
};

const bPct: PB = (p, r) => {
  for (let t = 0; t < 40; t++) {
    const idx = shuffle([0, 1, 2, 3], r);
    const ix = [idx[0], idx[1]], c = idx[2];
    const ans = pFemPctOfTotal(p, ix, c);
    if (!isTwoDecimals(ans) || ans <= 0) continue;
    const fsum = sumOf(p.fem, ix);
    const o = numberOptions(ans, [pFemPctOfTotal(p, ix, idx[3]), (sumOf(p.mal, ix) * 100) / p.tot[c], (fsum * 100) / (p.tot[c] + p.tot[idx[3]]), (p.tot[c] * 100) / fsum], r, { percent: true, decimals: 2 });
    if (!o) continue;
    return {
      kind: 'pct', args: [...ix, c], answer: ans, ...o, hard: true,
      text: 'The total number of females in colleges ' + names(p, ix) + ' together is what percentage of the total number of students in college ' + p.names[c] + '?',
      explanation: working(p) + ' Females in ' + names(p, ix) + ' = ' + fsum + '. Students in ' + p.names[c] + ' = ' + p.tot[c] + '. ' + fsum + ' / ' + p.tot[c] + ' x 100 = ' + round2(ans) + '%.',
    };
  }
  return null;
};

const bNew: PB = (p, r) => {
  for (let t = 0; t < 60; t++) {
    const k = 2 + Math.floor(r() * 3);
    const q = [20, 25, 30, 35, 40, 45, 50, 60][Math.floor(r() * 8)];
    const c = Math.floor(r() * 4);
    const mE = (k * p.fem[p.hidden] * (100 - q)) / 100;
    if (!Number.isInteger(mE)) continue;
    const ans = pNewMalesPct(p, k, q, c);
    if (!Number.isInteger(ans) || ans < 1) continue;
    const o = numberOptions(ans, [Math.round((mE * 100) / p.tot[c]), Math.round((Math.abs(mE - p.tot[c]) * 100) / mE), 100 - ans], r, { percent: true });
    if (!o) continue;
    return {
      kind: 'new', args: [k, q, c], answer: ans, ...o, hard: true,
      text: 'In college E the total number of students is ' + k + 'X, and ' + q + '% of them are females. The number of males in college E is what percentage more or less than the total number of students in college ' + p.names[c] + '?',
      explanation: working(p) + ' College E has ' + k + ' x ' + p.fem[p.hidden] + ' = ' + k * p.fem[p.hidden] + ' students, of whom ' + (100 - q) + '% are males: ' + mE + '. College ' + p.names[c] + ' has ' + p.tot[c] + '. The males in E are ' + (mE > p.tot[c] ? 'more' : 'less') + ' by (' + Math.abs(mE - p.tot[c]) + ' / ' + p.tot[c] + ') x 100 = ' + ans + '%.',
    };
  }
  return null;
};

const bDiff: PB = (p, r) => {
  for (let t = 0; t < 40; t++) {
    const idx = shuffle([0, 1, 2, 3], r);
    const a = idx[0], b = idx[1], c = Math.floor(r() * 4);
    const ans = pDiff(p, a, b, c);
    if (ans <= 0) continue;
    const o = numberOptions(ans, [p.tot[a] + p.tot[b] + 2 * p.mal[c], Math.abs(p.tot[a] + p.tot[b] - p.mal[c]), 2 * p.mal[c], p.tot[a] + p.tot[b]], r);
    if (!o) continue;
    return {
      kind: 'diff', args: [a, b, c], answer: ans, ...o, hard: false,
      text: 'Find the difference between the total number of students in colleges ' + names(p, [a, b]) + ' together and twice the number of males in college ' + p.names[c] + '.',
      explanation: working(p) + ' Students in ' + names(p, [a, b]) + ' = ' + (p.tot[a] + p.tot[b]) + '. Twice the males in ' + p.names[c] + ' = ' + 2 * p.mal[c] + '. The difference is ' + ans + '.',
    };
  }
  return null;
};

export function makePie(seed: string): Pie | null {
  for (let attempt = 0; attempt < 120; attempt++) {
    const r = rng(seed + '#' + attempt);
    const T = (6 + Math.floor(r() * 13)) * 200;
    const u = [0, 1, 2].map(() => 20 + Math.floor(r() * 61));
    const u4 = 200 - u[0] - u[1] - u[2];
    if (u4 < 20 || u4 > 80) continue;
    const pct = [...u, u4].map((x) => x / 2);
    const tot = pct.map((x) => (T * x) / 100);
    const fem = tot.map((t) => 10 * Math.floor((t * (25 + Math.floor(r() * 46))) / 1000));
    const p = pieFrom(T, pct, fem, Math.floor(r() * 4));
    if (p) return p;
  }
  return null;
}

export function pieQuestions(p: Pie, seed: string): DQ2[] {
  const out: DQ2[] = [];
  [bAvg, bRatio, bPct, bNew, bDiff].forEach((b, k) => {
    for (let t = 0; t < 20; t++) {
      const q = b(p, rng(seed + '.' + k + '.' + t));
      if (q) { out.push(q); break; }
    }
  });
  return out;
}
