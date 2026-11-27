import { shuffle } from '../random';

export interface DQ2 {
  kind: string; args: number[]; text: string; answer: number; ratio?: string;
  options: string[]; correctIndex: number; explanation: string; hard: boolean;
}
export interface Opts { options: string[]; correctIndex: number }
export interface NumOpt { percent?: boolean; decimals?: number; min?: number }

export const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
export const round2 = (n: number) => Math.round(n * 100) / 100;
export const isTwoDecimals = (n: number) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-7;

// Five options: the answer and four wrong ones that are plausible and possible.
export function numberOptions(answer: number, wrong: number[], r: () => number, o: NumOpt = {}): Opts | null {
  const dec = o.decimals ?? 0;
  const scale = Math.pow(10, dec);
  const q = (n: number) => Math.round(n * scale) / scale;
  const label = (n: number) => String(q(n)) + (o.percent ? '%' : '');
  const min = o.min ?? 1;
  const seen = new Set<number>([q(answer)]);
  const chosen: number[] = [];
  const add = (n: number) => {
    if (chosen.length >= 4 || !Number.isFinite(n)) return;
    const v = q(n);
    if (v < min || seen.has(v)) return;
    seen.add(v);
    chosen.push(v);
  };
  wrong.forEach(add);
  const unit = Math.max(dec > 0 ? 0.5 : 2, Math.abs(answer) * 0.04);
  for (let k = 1; chosen.length < 4 && k < 120; k++) { add(answer + k * unit); add(answer - k * unit); }
  if (chosen.length < 4) return null;
  const options = shuffle([q(answer), ...chosen], r);
  return { options: options.map(label), correctIndex: options.indexOf(q(answer)) };
}

export function ratioOptions(a: number, b: number, r: () => number, extra: [number, number][] = []): Opts | null {
  const g = gcd(a, b);
  const A = a / g, B = b / g;
  const ans = A + ':' + B;
  const seen = new Set<string>([ans]);
  const chosen: string[] = [];
  const add = (x: number, y: number) => {
    if (chosen.length >= 4 || !Number.isInteger(x) || !Number.isInteger(y) || x < 1 || y < 1) return;
    const h = gcd(x, y);
    const t = x / h + ':' + y / h;
    if (seen.has(t)) return;
    seen.add(t);
    chosen.push(t);
  };
  extra.forEach(([x, y]) => add(x, y));
  add(B, A); add(A + 1, B); add(A, B + 1); add(A + 2, B + 1); add(A + 1, B + 2); add(A - 1, B); add(A, B - 1);
  for (let i = 1; chosen.length < 4 && i < 8; i++) for (let j = 1; chosen.length < 4 && j < 8; j++) add(A + i, B + j);
  if (chosen.length < 4) return null;
  const options = shuffle([ans, ...chosen], r);
  return { options, correctIndex: options.indexOf(ans) };
}
