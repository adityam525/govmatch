import { rng } from '../random';
import { numberOptions } from '../data/opts';

// Symbols are written as escapes so a terminal paste cannot damage them.
const TIMES = '\u00d7';
const SQRT = '\u221a';
const CBRT = '\u221b';
const SQ = '\u00b2';

interface P { v: number; s: string }
const fmt = (n: number) => n.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
// A number moved a little off its clean value, as the exam does (59.99, 12.01, 900.1).
function pert(n: number, r: () => number, units = 9): P {
  const d = (1 + Math.floor(r() * units)) / 100;
  const v = Math.round((n + (r() < 0.5 ? -d : d)) * 1000) / 1000;
  return { v, s: fmt(v) };
}
const pick = <T,>(a: T[], r: () => number): T => a[Math.floor(r() * a.length)];
const int = (...n: number[]) => n.every((x) => Number.isInteger(x));

interface Cand { expr: string; ans: number; truth: number; explain: string; wrong: number[]; hard: boolean }
type Form = (r: () => number) => Cand | null;

const P1 = [20, 25, 30, 35, 40, 45, 50, 60, 75, 80];
const P2 = [10, 12, 15, 18, 20, 25, 30];
const FR: [number, number][] = [[2, 3], [3, 5], [4, 7], [3, 4], [5, 6], [2, 5], [5, 8]];

const f1: Form = (r) => {
  const p1 = pick(P1, r), A = 20 * (20 + Math.floor(r() * 41));
  const p2 = pick(P2, r), B = 100 * (3 + Math.floor(r() * 13));
  const [a, b] = pick(FR, r), C = b * (8 + Math.floor(r() * 13));
  const x = (p1 * A) / 100, y = (p2 * B) / 100, z = (a * C) / b, ans = x - y - z;
  if (!int(x, y, z) || ans < 20) return null;
  const P1p = pert(p1, r, 5), Ap = pert(A, r), P2p = pert(p2, r, 5), Bp = pert(B, r), Cp = pert(C, r);
  return {
    expr: P1p.s + '% of ' + Ap.s + ' - ' + P2p.s + '% of ' + Bp.s + ' = ? + ' + a + '/' + b + ' of ' + Cp.s,
    ans, hard: true,
    truth: (P1p.v / 100) * Ap.v - (P2p.v / 100) * Bp.v - (a / b) * Cp.v,
    explain: 'Round each number: ' + p1 + '% of ' + A + ' = ' + x + ', ' + p2 + '% of ' + B + ' = ' + y + ', ' + a + '/' + b + ' of ' + C + ' = ' + z + '. So ? = ' + x + ' - ' + y + ' - ' + z + ' = ' + ans + '.',
    wrong: [x - y, x + y - z, x - y + z, ans + 10],
  };
};

const f2: Form = (r) => {
  const X = 12 + Math.floor(r() * 9), p = pick([15, 20, 25, 30, 35, 40, 75], r);
  const C = 20 * (2 + Math.floor(r() * 9)), A = 200 + 10 * Math.floor(r() * 20), B = 100 + 10 * Math.floor(r() * 20);
  const pc = (p * C) / 100, ans = X * X + pc - A + B;
  if (!int(pc) || ans < 40) return null;
  const Xp = pert(X, r, 2), pp = pert(p, r, 5), Cp = pert(C, r), Ap = pert(A, r), Bp = pert(B, r);
  return {
    expr: '? + ' + Ap.s + ' - ' + Bp.s + ' = (' + Xp.s + ')' + SQ + ' + ' + pp.s + '% of ' + Cp.s,
    ans, hard: false,
    truth: Xp.v * Xp.v + (pp.v / 100) * Cp.v - Ap.v + Bp.v,
    explain: 'Round: (' + X + ')' + SQ + ' = ' + X * X + ' and ' + p + '% of ' + C + ' = ' + pc + '. So ? = ' + X * X + ' + ' + pc + ' - ' + A + ' + ' + B + ' = ' + ans + '.',
    wrong: [X * X + pc + A - B, X * X - pc - A + B, X + pc - A + B, ans + 10],
  };
};

const f3: Form = (r) => {
  const q = 5 + Math.floor(r() * 10), k = 2 + Math.floor(r() * 7), Y = 10 + Math.floor(r() * 11);
  const s = k * q * q - Y * Y;
  if (s < 12 || s > 70) return null;
  const Sp = pert(s * s, r), Yp = pert(Y, r, 2);
  return {
    expr: SQRT + Sp.s + ' + (' + Yp.s + ')' + SQ + ' = ' + k + ' ' + TIMES + ' (?)' + SQ,
    ans: q, hard: false,
    truth: Math.sqrt((Math.sqrt(Sp.v) + Yp.v * Yp.v) / k),
    explain: 'Round: ' + SQRT + (s * s) + ' = ' + s + ' and (' + Y + ')' + SQ + ' = ' + Y * Y + ', so the left side is ' + (s + Y * Y) + '. Then (?)' + SQ + ' = ' + (s + Y * Y) + ' / ' + k + ' = ' + q * q + ' and ? = ' + q + '.',
    wrong: [Math.round(Math.sqrt(s + Y * Y)), Math.round((s + Y * Y) / k), q + 1, q - 1],
  };
};

const f4: Form = (r) => {
  for (let t = 0; t < 120; t++) {
    const p1 = pick(P1, r), A = 20 * (20 + Math.floor(r() * 41));
    const p2 = pick(P2, r), B = 100 * (3 + Math.floor(r() * 13));
    const x = (p1 * A) / 100, y = (p2 * B) / 100, d = x - y;
    const q = Math.ceil(Math.sqrt(Math.max(0, d) + 8)) + Math.floor(r() * 3);
    const T = q * q - d;
    if (q < 6 || q > 26 || T < 8 || T > 80 || !int(T)) continue;
    const as = [2, 3, 4, 5, 6, 7, 8, 9].filter((a) => T % a === 0 && T / a >= 2 && T / a <= 40);
    if (!as.length) continue;
    const a = pick(as, r), b = T / a;
    const P1p = pert(p1, r, 5), Ap = pert(A, r), P2p = pert(p2, r, 5), Bp = pert(B, r), ap = pert(a, r, 1), bp = pert(b, r, 1);
    return {
      expr: P1p.s + '% of ' + Ap.s + ' - ' + P2p.s + '% of ' + Bp.s + ' + ' + ap.s + ' ' + TIMES + ' ' + bp.s + ' = (?)' + SQ,
      ans: q, hard: false,
      truth: Math.sqrt((P1p.v / 100) * Ap.v - (P2p.v / 100) * Bp.v + ap.v * bp.v),
      explain: 'Round: ' + p1 + '% of ' + A + ' = ' + x + ', ' + p2 + '% of ' + B + ' = ' + y + ' and ' + a + ' ' + TIMES + ' ' + b + ' = ' + T + '. The left side is ' + x + ' - ' + y + ' + ' + T + ' = ' + q * q + ', so (?)' + SQ + ' = ' + q * q + ' and ? = ' + q + '.',
      wrong: [q + 1, q - 1, q * q, Math.round(Math.sqrt(x + y + T))],
    };
  }
  return null;
};

const f5: Form = (r) => {
  for (let t = 0; t < 120; t++) {
    const m = 5 + Math.floor(r() * 11), a = 20 + Math.floor(r() * 41), b = 5 + Math.floor(r() * 16), C = 100 + 10 * Math.floor(r() * 60);
    const rhs = m - a * b + C;
    if (rhs < 60 || rhs > 420) continue;
    const ans = 5 + Math.floor(r() * 16), N = ans * rhs;
    const Np = pert(N, r), Mp = pert(m * m * m, r), ap = pert(a, r, 1), bp = pert(b, r, 1), Cp = pert(C, r, 3);
    return {
      expr: Np.s + ' / ? = ' + CBRT + Mp.s + ' - ' + ap.s + ' ' + TIMES + ' ' + bp.s + ' + ' + Cp.s,
      ans, hard: true,
      truth: Np.v / (Math.cbrt(Mp.v) - ap.v * bp.v + Cp.v),
      explain: 'Round: ' + CBRT + (m * m * m) + ' = ' + m + ' and ' + a + ' ' + TIMES + ' ' + b + ' = ' + a * b + '. The right side is ' + m + ' - ' + a * b + ' + ' + C + ' = ' + rhs + '. So ? = ' + N + ' / ' + rhs + ' = ' + ans + '.',
      wrong: [ans + 1, ans - 1, ans + 2, Math.round(N / (m + a * b + C))],
    };
  }
  return null;
};

const f6: Form = (r) => {
  for (let t = 0; t < 120; t++) {
    const k = pick([2, 3, 4, 5, 6], r), z = 20 + Math.floor(r() * 121);
    const A = 100 + 10 * Math.floor(r() * 21), B = 100 + 10 * Math.floor(r() * 21), E = 50 + 10 * Math.floor(r() * 16);
    const C = 150 + 10 * Math.floor(r() * 36), D = z + A + B + E - C;
    if (D < 150 || D > 500) continue;
    const Ap = pert(A, r, 5), Bp = pert(B, r, 5), Cp = pert(C, r, 5), Dp = pert(D, r, 5), Ep = pert(E, r, 5);
    return {
      expr: '?/' + k + ' + ' + Ap.s + ' + ' + Bp.s + ' = ' + Cp.s + ' + ' + Dp.s + ' - ' + Ep.s,
      ans: k * z, hard: true,
      truth: k * (Cp.v + Dp.v - Ep.v - Ap.v - Bp.v),
      explain: 'Round: the left side has ' + A + ' + ' + B + ' = ' + (A + B) + ' and the right side is ' + C + ' + ' + D + ' - ' + E + ' = ' + (C + D - E) + '. So ?/' + k + ' = ' + (C + D - E) + ' - ' + (A + B) + ' = ' + z + ' and ? = ' + k + ' ' + TIMES + ' ' + z + ' = ' + k * z + '.',
      wrong: [z, k * z + k, k * z - k, k * z + 2 * k],
    };
  }
  return null;
};

export const FORMS: Form[] = [f1, f2, f3, f4, f5, f6];

export interface ApproxQ { form: number; expr: string; ans: number; truth: number; options: string[]; correctIndex: number; explanation: string; hard: boolean }

export function makeApprox(seed: string, form?: number): ApproxQ | null {
  for (let attempt = 0; attempt < 400; attempt++) {
    const r = rng(seed + '#' + attempt);
    const k = form === undefined ? Math.floor(r() * FORMS.length) : form;
    const c = FORMS[k](r);
    if (!c || Math.abs(c.truth - c.ans) > 0.9) continue;
    const o = numberOptions(c.ans, c.wrong, r);
    if (!o) continue;
    const err = Math.abs(c.ans - c.truth);
    // The marked option must be clearly the nearest one to the value the printed numbers give.
    if (o.options.map(Number).some((v, i) => i !== o.correctIndex && Math.abs(v - c.truth) < err + 0.5)) continue;
    return { form: k, expr: c.expr, ans: c.ans, truth: c.truth, options: o.options, correctIndex: o.correctIndex, explanation: c.explain, hard: c.hard };
  }
  return null;
}

export const approxText = (q: ApproxQ) => 'What approximate value should come in place of the question mark (?) in the following question? ' + q.expr;
