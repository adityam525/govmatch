import { rng } from '../random';
import { gcd, isTwoDecimals, numberOptions, ratioOptions, round2, type DQ2 } from './opts';

export interface Caselet {
  noun: string; unit: string; tA: number; vA: number; oA: number; mA: number; fA: number; d: number;
  tB: number; vB: number; oB: number; mB: number; fB: number; x: number; y: number; rm: number; rf: number;
}

// Everything is derived from the statements, so the question can be solved from the text alone.
export function caseletFrom(noun: string, unit: string, tA: number, vA: number, d: number, x: number, y: number, rm: number, rf: number): Caselet | null {
  const oA = tA - vA;
  const fA = (oA - d) / 2;
  if (!Number.isInteger(fA) || fA < 1) return null;
  const vB = (vA * (100 - x)) / 100;
  const oB = (oA * (100 + y)) / 100;
  if (!Number.isInteger(vB) || vB < 1 || !Number.isInteger(oB)) return null;
  const parts = oB / (rm + rf);
  if (!Number.isInteger(parts)) return null;
  return { noun, unit, tA, vA, oA, mA: fA + d, fA, d, tB: oB + vB, vB, oB, mB: parts * rm, fB: parts * rf, x, y, rm, rf };
}

export const cTotal = (c: Caselet) => c.tA + c.tB;
export const cFemPctOfA = (c: Caselet) => ((c.fA + c.fB) * 100) / c.tA;
export const cMalePct = (c: Caselet) => ((c.mA + c.mB) * 100) / (c.oA + c.oB);
export const cDiff = (c: Caselet) => Math.abs(c.mB - c.fA);

export function caseletStem(c: Caselet): string {
  return 'There are two ' + c.noun + ', A and B. The total number of ' + c.unit + ' in A is ' + c.tA + ' and ' + c.vA + ' of them are vacant. '
    + 'The number of males who occupy ' + c.unit + ' in A is ' + c.d + ' more than the number of females who occupy them. '
    + 'The vacant ' + c.unit + ' in B are ' + c.x + '% less than those in A. '
    + 'The ratio of males to females among the occupied ' + c.unit + ' in B is ' + c.rm + ':' + c.rf + '. '
    + 'The total number of occupied ' + c.unit + ' in B is ' + c.y + '% more than in A.';
}

function working(c: Caselet): string {
  return 'Occupied in A = ' + c.tA + ' - ' + c.vA + ' = ' + c.oA + ', so females = (' + c.oA + ' - ' + c.d + ') / 2 = ' + c.fA + ' and males = ' + c.mA
    + '. In B: vacant = ' + c.vB + ', occupied = ' + c.oB + ', total = ' + c.tB + ', males = ' + c.mB + ', females = ' + c.fB + '.';
}

type CB = (c: Caselet, r: () => number) => DQ2 | null;

const bTotal: CB = (c, r) => {
  const ans = cTotal(c);
  const o = numberOptions(ans, [c.tA + c.oB, c.oA + c.oB, c.tA + c.vB, ans + c.vA], r);
  if (!o) return null;
  return { kind: 'total', args: [], answer: ans, ...o, hard: false, text: 'Find the sum of the total number of ' + c.unit + ' in A and B.', explanation: working(c) + ' The sum is ' + c.tA + ' + ' + c.tB + ' = ' + ans + '.' };
};

const bFemPct: CB = (c, r) => {
  const ans = cFemPctOfA(c);
  if (!isTwoDecimals(ans)) return null;
  const o = numberOptions(ans, [((c.mA + c.mB) * 100) / c.tA, ((c.fA + c.fB) * 100) / c.oA, ((c.fA + c.fB) * 100) / c.tB], r, { percent: true, decimals: 2 });
  if (!o) return null;
  return { kind: 'fempct', args: [], answer: ans, ...o, hard: true, text: 'The total number of ' + c.unit + ' occupied by females in both ' + c.noun + ' is what percentage of the total number of ' + c.unit + ' in A?', explanation: working(c) + ' Females in both = ' + c.fA + ' + ' + c.fB + ' = ' + (c.fA + c.fB) + '. That is ' + (c.fA + c.fB) + ' / ' + c.tA + ' x 100 = ' + round2(ans) + '%.' };
};

const bRatio: CB = (c, r) => {
  const a = c.oB, b = c.vA + c.vB;
  const o = ratioOptions(a, b, r, [[b, a], [c.oA, b], [c.oB, c.vB]]);
  if (!o) return null;
  const g = gcd(a, b);
  return { kind: 'ratio', args: [], answer: a / b, ratio: a / g + ':' + b / g, ...o, hard: true, text: 'Find the ratio of the occupied ' + c.unit + ' in B to the vacant ' + c.unit + ' in both ' + c.noun + ' together.', explanation: working(c) + ' Occupied in B = ' + a + '. Vacant in both = ' + c.vA + ' + ' + c.vB + ' = ' + b + '. The ratio is ' + a + ':' + b + ' = ' + a / g + ':' + b / g + '.' };
};

const bMalePct: CB = (c, r) => {
  const ans = cMalePct(c);
  if (!isTwoDecimals(ans)) return null;
  const o = numberOptions(ans, [((c.fA + c.fB) * 100) / (c.oA + c.oB), ((c.mA + c.mB) * 100) / (c.tA + c.tB), ((c.mA + c.mB) * 100) / c.oA], r, { percent: true, decimals: 2 });
  if (!o) return null;
  return { kind: 'malepct', args: [], answer: ans, ...o, hard: true, text: 'The total number of ' + c.unit + ' occupied by males in both ' + c.noun + ' is what percentage of the total number of occupied ' + c.unit + ' in both?', explanation: working(c) + ' Males in both = ' + (c.mA + c.mB) + '. Occupied in both = ' + (c.oA + c.oB) + '. ' + (c.mA + c.mB) + ' / ' + (c.oA + c.oB) + ' x 100 = ' + round2(ans) + '%.' };
};

const bDiff: CB = (c, r) => {
  const ans = cDiff(c);
  if (ans <= 0) return null;
  const o = numberOptions(ans, [c.mB + c.fA, Math.abs(c.fB - c.mA), c.mB - c.mA > 0 ? c.mB - c.mA : c.mA - c.mB, c.fB + c.fA], r);
  if (!o) return null;
  return { kind: 'diff', args: [], answer: ans, ...o, hard: false, text: 'Find the difference between the number of ' + c.unit + ' occupied by males in B and by females in A.', explanation: working(c) + ' Males in B = ' + c.mB + ', females in A = ' + c.fA + '. The difference is ' + ans + '.' };
};

const NOUNS: [string, string][] = [['buses', 'seats'], ['halls', 'chairs'], ['trains', 'berths'], ['classrooms', 'benches']];
const RATIOS: [number, number][] = [[3, 2], [2, 1], [3, 1], [5, 3], [4, 3], [5, 2], [7, 3], [10, 7], [7, 5], [5, 4], [9, 5], [7, 4], [8, 5]];
const pick = <T,>(a: T[], r: () => number): T => a[Math.floor(r() * a.length)];

export function makeCaselet(seed: string): Caselet | null {
  for (let attempt = 0; attempt < 400; attempt++) {
    const r = rng(seed + '#' + attempt);
    const [noun, unit] = pick(NOUNS, r);
    const fA = 6 + Math.floor(r() * 15);
    const d = pick([2, 4, 6, 8, 10], r);
    const vA = pick([4, 6, 8, 10, 12], r);
    const [rm, rf] = pick(RATIOS, r);
    const c = caseletFrom(noun, unit, 2 * fA + d + vA, vA, d, pick([20, 25, 40, 50, 60, 75], r), pick([20, 25, 40, 50, 60, 75, 100], r), rm, rf);
    if (c) return c;
  }
  return null;
}

export function caseletQuestions(c: Caselet, seed: string): DQ2[] {
  const out: DQ2[] = [];
  [bTotal, bFemPct, bRatio, bMalePct, bDiff].forEach((b, k) => {
    for (let t = 0; t < 10; t++) {
      const q = b(c, rng(seed + '.' + k + '.' + t));
      if (q) { out.push(q); break; }
    }
  });
  return out;
}
