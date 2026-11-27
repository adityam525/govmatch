import { rng } from '../random';
import { gcd, numberOptions } from '../data/opts';

export type Family = 'boat' | 'work' | 'profit' | 'ages' | 'trains' | 'mixture' | 'sici' | 'partner';
export const FAMILIES: Family[] = ['boat', 'work', 'profit', 'ages', 'trains', 'mixture', 'sici', 'partner'];
export type Params = Record<string, number>;
export interface WordQ { family: Family; params: Params; text: string; answer: number; decimals: number; wrong: number[]; explanation: string; hard: boolean }
export interface WordFull extends WordQ { options: string[]; correctIndex: number }

const pick = <T,>(a: T[], r: () => number): T => a[Math.floor(r() * a.length)];
const int = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
const num = (n: number) => String(Math.round(n * 1000) / 1000);
const tenths = (n10: number) => num(n10 / 10);
const r0 = Math.round;

// The answer, worked out from the printed numbers only.
export function solveWord(f: Family, p: Params): number {
  switch (f) {
    case 'boat': {
      const s10 = (p.u10 * (p.m - p.n)) / (p.m + p.n);
      const sp10 = p.down === 1 ? p.u10 + s10 : p.u10 - s10;
      return (p.D * 10) / sp10;
    }
    case 'work': {
      const rateA = 1 / p.Tab - 1 / p.Tb;
      return p.f / 100 / rateA - p.c;
    }
    case 'profit': return (p.MP * (100 - p.d)) / 100 * (1 - p.a / p.b);
    case 'ages': {
      const q = 100 - p.p;
      const y = (p.k * (100 * p.h - q * p.d)) / (100 - p.k * q);
      return y / p.k - p.h - p.z;
    }
    case 'trains': {
      const vA = (p.vA * 5) / 18;
      const lenA = vA * p.tA, lenB = (lenA * 100) / (100 + p.p);
      const vB = vA + (lenA + lenB) / p.T;
      return (lenB + p.L) / vB;
    }
    case 'mixture': {
      const { m, n, R, M, m2, n2 } = p;
      const k = n2 * m - m2 * n;
      return (R * n * k - n2 * M * n * (m + n)) / ((m + n) * k);
    }
    case 'sici': {
      const P = (p.I * 100) / (2 * p.r);
      return (P + p.E) * ((1 + p.r / 100) * (1 + p.r / 100) - 1);
    }
    default: return (p.Ia * 12 * p.S) / (p.Ib * (p.Pt - p.S));
  }
}

type Build = (r: () => number) => WordQ | null;

const boat: Build = (r) => {
  const [m, n] = pick<[number, number]>([[3, 1], [2, 1], [5, 3], [4, 1], [3, 2], [5, 2]], r);
  const c10 = 4 * int(r, 2, 15), u10 = ((m + n) * c10) / 2, s10 = ((m - n) * c10) / 2;
  const down = r() < 0.6, T = int(r, 2, 12);
  const sp10 = down ? m * c10 : n * c10, D10 = sp10 * T;
  if (D10 % 10 !== 0) return null;
  const D = D10 / 10, other10 = down ? n * c10 : m * c10;
  return {
    family: 'boat', params: { u10, m, n, D, down: down ? 1 : 0 }, answer: T, decimals: 0, hard: false,
    text: 'The speed of a boat in still water is ' + tenths(u10) + ' km/hr and the ratio of downstream to upstream speed of the boat is ' + m + ':' + n + ', respectively. Find the time taken by the boat to cover ' + D + ' km ' + (down ? 'downstream' : 'upstream') + ' (in hours).',
    wrong: [r0((D * 10) / other10), r0((D * 10) / u10), T + 2, T * 2],
    explanation: 'Let the stream speed be s km/hr. Then (' + tenths(u10) + ' + s) : (' + tenths(u10) + ' - s) = ' + m + ':' + n + ', so s = ' + tenths(u10) + ' x (' + m + ' - ' + n + ') / (' + m + ' + ' + n + ') = ' + tenths(s10) + '. Downstream speed = ' + tenths(u10 + s10) + ' km/hr and upstream speed = ' + tenths(u10 - s10) + ' km/hr. Time = ' + D + ' / ' + tenths(sp10) + ' = ' + T + ' hours.',
  };
};

const work: Build = (r) => {
  const p = int(r, 1, 4), q = int(r, 1, 4), k = int(r, 1, 3);
  if (p === q) return null;
  const Ta = k * p * (p + q), Tb = k * q * (p + q), Tab = k * p * q;
  const f = pick([25, 40, 50, 60, 75], r), daysA = (Ta * f) / 100;
  if (!Number.isInteger(daysA) || daysA < 5 || Tab < 6 || Tb > 90) return null;
  const c = int(r, 2, daysA - 2), X = daysA - c;
  if (X < 2) return null;
  return {
    family: 'work', params: { Tab, Tb, f, c }, answer: X, decimals: 0, hard: true,
    text: 'A and B together can complete a work in ' + Tab + ' days, and B alone can complete the same work in ' + Tb + ' days. If ' + f + '% of the work is completed by A in (X + ' + c + ') days, then find X.',
    wrong: [daysA, c, Ta, X + 2, Math.abs(X - 3)],
    explanation: 'A\'s one-day work = 1/' + Tab + ' - 1/' + Tb + ' = 1/' + Ta + ', so A alone needs ' + Ta + ' days. ' + f + '% of the work takes A ' + Ta + ' x ' + f + '/100 = ' + daysA + ' days. So X + ' + c + ' = ' + daysA + ' and X = ' + X + '.',
  };
};

const profit: Build = (r) => {
  const [a, b] = pick<[number, number]>([[20, 27], [4, 5], [5, 6], [7, 8], [3, 4], [9, 10], [5, 7], [8, 9], [12, 13], [10, 13]], r);
  const MP = 100 * int(r, 30, 80), d = pick([10, 20, 25, 30, 40, 50], r), SP = (MP * (100 - d)) / 100;
  if (SP % b !== 0) return null;
  const CP = (SP / b) * a, prof = SP - CP;
  return {
    family: 'profit', params: { MP, d, a, b }, answer: prof, decimals: 0, hard: false,
    text: 'The ratio of the cost price to the selling price of an article is ' + a + ':' + b + '. The marked price of the article is Rs ' + MP + ', and it is sold after allowing a discount of ' + d + '%. Find the profit (in Rs).',
    wrong: [CP, SP, MP - SP, r0(prof * 1.1)],
    explanation: 'Selling price = ' + MP + ' x (100 - ' + d + ')/100 = ' + SP + '. Cost price : selling price = ' + a + ':' + b + ', so the cost price = ' + SP + ' x ' + a + '/' + b + ' = ' + CP + '. Profit = ' + SP + ' - ' + CP + ' = ' + prof + '.',
  };
};

const ages: Build = (r) => {
  const k = pick([2, 3], r), h = int(r, 1, 5), p = pick([10, 20, 25, 40, 50], r), q = 100 - p;
  const a = int(r, 8, 40);
  if ((a * 100) % q !== 0 || 100 - k * q === 0) return null;
  const adarsh = (a * 100) / q, y = k * (a + h), d = y - adarsh;
  if (d < 2 || d > 40) return null;
  const z = int(r, 2, Math.min(10, a - 2));
  return {
    family: 'ages', params: { k, h, p, d, z }, answer: a - z, decimals: 0, hard: true,
    text: 'The age of Akash ' + h + ' year' + (h > 1 ? 's' : '') + ' hence will be ' + (k === 2 ? 'half' : 'one-third') + ' of the present age of Ayush, and the present age of Akash is ' + p + '% less than the present age of Adarsh. If Adarsh is ' + d + ' years younger than Ayush, find the age of Akash ' + z + ' years ago.',
    wrong: [a, a + z, y, adarsh - z],
    explanation: 'Let Ayush be y years. Akash = y/' + k + ' - ' + h + ' and Adarsh = y - ' + d + '. Akash is ' + q + '% of Adarsh, so y/' + k + ' - ' + h + ' = ' + q + '/100 x (y - ' + d + '). Solving gives y = ' + y + ', so Akash is ' + y + '/' + k + ' - ' + h + ' = ' + a + ' years now, and ' + (a - z) + ' years ' + z + ' years ago.',
  };
};

const trains: Build = (r) => {
  for (let t = 0; t < 300; t++) {
    const vAms = pick([5, 10, 15, 20, 25, 30], r), tA = int(r, 8, 20), lenA = vAms * tA;
    const p = pick([25, 50, 100, 20, 40, 60], r);
    if ((lenA * 100) % (100 + p) !== 0) continue;
    const lenB = (lenA * 100) / (100 + p), vB = vAms + int(r, 5, 20), tot = lenA + lenB;
    if (tot % (vB - vAms) !== 0) continue;
    const T = tot / (vB - vAms);
    if (T < 15 || T > 90) continue;
    const t3 = int(r, 8, 30), L = t3 * vB - lenB;
    if (L < 100 || L % 50 !== 0) continue;
    const rel = vB - vAms;
    return {
      family: 'trains', params: { vA: (vAms * 18) / 5, p, tA, T, L }, answer: t3, decimals: 0, hard: true,
      text: 'The length of train A is ' + p + '% more than the length of train B, and the speed of train A is ' + (vAms * 18) / 5 + ' km/hr. Train A crosses a pole in ' + tA + ' seconds, and train B, running in the same direction, overtakes train A in ' + T + ' seconds. Find the time taken by train B to cross a ' + L + ' metre long platform (in seconds).',
      wrong: [r0((lenB + L) / rel), r0((lenA + L) / vB), r0(L / vB), t3 + 4],
      explanation: 'Speed of A = ' + (vAms * 18) / 5 + ' x 5/18 = ' + vAms + ' m/s, so its length is ' + vAms + ' x ' + tA + ' = ' + lenA + ' m. Length of B = ' + lenA + ' x 100/' + (100 + p) + ' = ' + lenB + ' m. B overtakes A, so the relative speed = (' + lenA + ' + ' + lenB + ')/' + T + ' = ' + rel + ' m/s and B\'s speed = ' + vAms + ' + ' + rel + ' = ' + vB + ' m/s. To cross the platform B covers ' + lenB + ' + ' + L + ' = ' + (lenB + L) + ' m, which takes ' + (lenB + L) + '/' + vB + ' = ' + t3 + ' seconds.',
    };
  }
  return null;
};

const mixture: Build = (r) => {
  const [m, n] = pick<[number, number]>([[4, 1], [3, 2], [5, 1], [7, 3], [3, 1], [2, 1], [5, 3]], r);
  const u = int(r, 3, 9), j = int(r, 1, u - 1), R = (m + n) * j, M = int(r, 2, 12);
  const milk2 = m * (u - j) + M, water2 = n * (u - j), g = gcd(milk2, water2), m2 = milk2 / g, n2 = water2 / g;
  if (m2 > 40 || n2 > 40 || n2 * m === m2 * n) return null;
  const w = n * u;
  return {
    family: 'mixture', params: { m, n, R, M, m2, n2 }, answer: w, decimals: 0, hard: true,
    text: 'A vessel contains milk and water in the ratio of ' + m + ':' + n + ', respectively. If ' + R + ' litres of the mixture are taken out and ' + M + ' litres of milk are added to the rest, then the ratio of milk to water becomes ' + m2 + ':' + n2 + ', respectively. Find the initial quantity of water (in litres).',
    wrong: [m * u, (m + n) * u, w + n, Math.max(1, w - n)],
    explanation: 'Let the initial water be w litres, so the milk is ' + m + 'w/' + n + '. Taking out ' + R + ' litres removes milk and water in the ratio ' + m + ':' + n + ': ' + R * m / (m + n) + ' litres of milk and ' + R * n / (m + n) + ' litres of water. After adding ' + M + ' litres of milk, milk : water = ' + m2 + ':' + n2 + '. Solving gives w = ' + w + '. Check: milk = ' + m * u + ', after taking out = ' + m * (u - j) + ', after adding = ' + milk2 + '; water left = ' + water2 + '; ' + milk2 + ':' + water2 + ' = ' + m2 + ':' + n2 + '.',
  };
};

const sici: Build = (r) => {
  const rate = pick([5, 8, 10, 12, 15, 20], r), P = 125 * int(r, 8, 64), E = 100 * int(r, 2, 10);
  const I = (P * 2 * rate) / 100;
  if (!Number.isInteger(I)) return null;
  const sum2 = P + E, top = sum2 * (200 * rate + rate * rate);
  if (top % 100 !== 0) return null;
  const CI = top / 10000;
  return {
    family: 'sici', params: { I, r: rate, E }, answer: CI, decimals: 2, hard: true,
    text: 'A man invested a sum of money in simple interest at ' + rate + '% per annum for two years and received interest of Rs ' + I + '. If he invests Rs ' + E + ' more than the first sum in compound interest at the same rate for the same period, find the compound interest he receives (in Rs).',
    wrong: [(sum2 * 2 * rate) / 100, (P * (200 * rate + rate * rate)) / 10000, CI + E / 10, (E * (200 * rate + rate * rate)) / 10000 + I],
    explanation: 'Simple interest for two years at ' + rate + '% is 2 x ' + rate + ' = ' + 2 * rate + '% of the sum, so the first sum = ' + I + ' x 100/' + 2 * rate + ' = ' + P + '. The new sum = ' + P + ' + ' + E + ' = ' + sum2 + '. Compound interest for two years = ' + sum2 + ' x ((1 + ' + rate + '/100)^2 - 1) = ' + sum2 + ' x ' + (200 * rate + rate * rate) / 10000 + ' = ' + num(CI) + '.',
  };
};

const partner: Build = (r) => {
  const Ia = 500 * int(r, 2, 12), Ib = 500 * int(r, 2, 12), t = int(r, 2, 9);
  const A = Ia * 12, B = Ib * t, g = gcd(A, B), a1 = A / g, b1 = B / g;
  const cs: number[] = [];
  for (let c = Math.ceil(1500 / (a1 + b1)); c <= Math.floor(12000 / (a1 + b1)); c++) if (((a1 + b1) * c) % 100 === 0) cs.push(c);
  if (!cs.length) return null;
  const c = pick(cs, r), Pt = (a1 + b1) * c, S = b1 * c;
  return {
    family: 'partner', params: { Ia, Ib, Pt, S }, answer: t, decimals: 0, hard: true,
    text: 'A started a business with an investment of Rs ' + Ia + '. After a few months, B joined the partnership with an investment of Rs ' + Ib + '. At the end of the year, the total profit was Rs ' + Pt + ', out of which B\'s share was Rs ' + S + '. Find the number of months for which B invested his money in the business.',
    wrong: [12 - t, t + 2, Math.max(1, t - 1), 12],
    explanation: 'A\'s share = ' + Pt + ' - ' + S + ' = ' + (Pt - S) + '. Profit is shared in the ratio of investment x time: ' + Ia + ' x 12 : ' + Ib + ' x t = ' + (Pt - S) + ' : ' + S + '. So t = ' + Ia + ' x 12 x ' + S + ' / (' + Ib + ' x ' + (Pt - S) + ') = ' + t + ' months.',
  };
};

const BUILDERS: Record<Family, Build> = { boat, work, profit, ages, trains, mixture, sici, partner };

export function makeWord(seed: string, family: Family): WordFull | null {
  for (let attempt = 0; attempt < 400; attempt++) {
    const r = rng(seed + '#' + attempt);
    const q = BUILDERS[family](r);
    if (!q) continue;
    const o = numberOptions(q.answer, q.wrong, r, { decimals: q.decimals });
    if (!o) continue;
    return { ...q, options: o.options, correctIndex: o.correctIndex };
  }
  return null;
}
