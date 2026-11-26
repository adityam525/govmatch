import { rng } from '../random';

export interface Frac { n: number; d: number }
export interface Coeffs { a: number; b: number; c: number }
interface Factor { p: number; q: number }
interface Quad extends Coeffs { f1: Factor; f2: Factor }

// Symbols are written as escapes so a terminal paste cannot damage them.
const GE = '\u2265';
const LE = '\u2264';
const SQ = '\u00b2';

// Same order as the exam. Fixed, never shuffled.
export const LABELS: string[] = [
  'x > y',
  'x ' + GE + ' y',
  'x < y',
  'x ' + LE + ' y',
  'x = y or no relation can be established',
];

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
export function frac(n: number, d = 1): Frac {
  const g = gcd(n, d) || 1;
  const s = d < 0 ? -1 : 1;
  return { n: (s * n) / g, d: (s * d) / g };
}
const cmp = (a: Frac, b: Frac): number => a.n * b.d - b.n * a.d;
const show = (f: Frac) => (f.d === 1 ? String(f.n) : f.n + '/' + f.d);
const asc = (r: Frac[]) => r.slice().sort(cmp);

// Roots straight from the coefficients, with no factoring, so the checks have an independent path.
export function rootsFromCoeffs(a: number, b: number, c: number): Frac[] | null {
  const disc = b * b - 4 * a * c;
  if (disc < 0) return null;
  const s = Math.round(Math.sqrt(disc));
  if (s * s !== disc) return null;
  return [frac(-b + s, 2 * a), frac(-b - s, 2 * a)];
}

// 0 x>y, 1 x>=y, 2 x<y, 3 x<=y, 4 x=y or no relation. -1 when every root is equal.
export function classify(X: Frac[], Y: Frac[]): number {
  const xs = asc(X), ys = asc(Y);
  const minX = xs[0], maxX = xs[xs.length - 1], minY = ys[0], maxY = ys[ys.length - 1];
  const a = cmp(minX, maxY), b = cmp(maxX, minY);
  if (a > 0) return 0;
  if (b < 0) return 2;
  if (a === 0 && b === 0) return -1;
  if (a === 0) return 1;
  if (b === 0) return 3;
  return 4;
}

const rootOf = (f: Factor): Frac => frac(-f.q, f.p);
const expand = (f1: Factor, f2: Factor): Quad => ({ a: f1.p * f2.p, b: f1.p * f2.q + f1.q * f2.p, c: f1.q * f2.q, f1, f2 });
const co = (n: number) => (n === 1 ? '' : String(n));
const sgn = (n: number) => (n < 0 ? '- ' : '+ ');

function eqText(q: Quad, v: string): string {
  let s = co(q.a) + v + SQ;
  if (q.b !== 0) s += ' ' + sgn(q.b) + co(Math.abs(q.b)) + v;
  return s + ' ' + sgn(q.c) + Math.abs(q.c) + ' = 0';
}
const factorText = (f: Factor, v: string) => (f.p === 1 ? v : f.p + v) + ' ' + sgn(f.q) + Math.abs(f.q);

function randFactor(r: () => number): Factor {
  for (;;) {
    const p = [1, 1, 1, 2, 3][Math.floor(r() * 5)];
    const q = (1 + Math.floor(r() * 12)) * (r() < 0.5 ? -1 : 1);
    if (gcd(p, q) === 1) return { p, q };
  }
}

export interface QuadPuzzle {
  text: string; options: string[]; correctIndex: number; explanation: string;
  difficulty: 'MEDIUM' | 'HARD'; x: Coeffs; y: Coeffs;
}

function rootsText(v: string, r: Frac[]): string {
  const s = asc(r);
  return cmp(s[0], s[1]) === 0 ? v + ' = ' + show(s[0]) + ' (both roots)' : v + ' = ' + show(r[0]) + ' or ' + show(r[1]);
}

export function makeQuadratic(seed: string, target: number): QuadPuzzle | null {
  for (let attempt = 0; attempt < 800; attempt++) {
    const r = rng(seed + '#' + attempt);
    const x1 = randFactor(r);
    const x2 = r() < 0.08 ? x1 : randFactor(r);
    let y1 = randFactor(r);
    const y2 = r() < 0.08 ? y1 : randFactor(r);
    // The "equal" cases need one root in common, so share a factor most of the time.
    if ((target === 1 || target === 3) && r() < 0.8) y1 = r() < 0.5 ? x1 : x2;
    const X = expand(x1, x2), Y = expand(y1, y2);
    const rx = [rootOf(x1), rootOf(x2)], ry = [rootOf(y1), rootOf(y2)];
    if (classify(rx, ry) !== target) continue;
    const xs = asc(rx), ys = asc(ry);
    if (cmp(xs[0], ys[0]) === 0 && cmp(xs[1], ys[1]) === 0) continue;
    const minX = show(xs[0]), maxX = show(xs[1]), minY = show(ys[0]), maxY = show(ys[1]);
    const side = (name: string, q: Quad, v: string, roots: Frac[]) =>
      name + '. ' + eqText(q, v) + ' gives (' + factorText(q.f1, v) + ')(' + factorText(q.f2, v) + ') = 0, so ' + rootsText(v, roots) + '.';
    const why = [
      'Every x is bigger than every y (smallest x is ' + minX + ', largest y is ' + maxY + '), so x > y. This is stronger than x ' + GE + ' y, so x > y is the answer.',
      'The smallest x (' + minX + ') equals the largest y (' + maxY + ') and no x is smaller, so x ' + GE + ' y but not x > y.',
      'Every x is smaller than every y (largest x is ' + maxX + ', smallest y is ' + minY + '), so x < y.',
      'The largest x (' + maxX + ') equals the smallest y (' + minY + ') and no x is bigger, so x ' + LE + ' y but not x < y.',
      'The values overlap (x runs from ' + minX + ' to ' + maxX + ', y from ' + minY + ' to ' + maxY + '), so no single relation always holds: x = y or no relation can be established.',
    ][target];
    const integers = [...rx, ...ry].every((f) => f.d === 1);
    return {
      text: 'I. ' + eqText(X, 'x') + '  II. ' + eqText(Y, 'y') + '. Solve both equations and select the correct relation between x and y.',
      options: LABELS.slice(), correctIndex: target,
      explanation: side('I', X, 'x', rx) + ' ' + side('II', Y, 'y', ry) + ' ' + why,
      difficulty: integers ? 'MEDIUM' : 'HARD',
      x: { a: X.a, b: X.b, c: X.c }, y: { a: Y.a, b: Y.b, c: Y.c },
    };
  }
  return null;
}
