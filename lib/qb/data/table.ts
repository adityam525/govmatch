import { rng, shuffle } from '../random';

export interface Shop { name: string; total: number; pct: number }
export const females = (s: Shop) => (s.total * s.pct) / 100;
export const males = (s: Shop) => s.total - females(s);

export const diffAnswer = (S: Shop[], i: number[]) =>
  Math.abs(males(S[i[0]]) + males(S[i[1]]) - females(S[i[2]]) - females(S[i[3]]));
export const pctMoreAnswer = (S: Shop[], x: number, y: number) =>
  ((females(S[x]) - males(S[y])) * 100) / males(S[y]);
export const avgMalesAnswer = (S: Shop[], i: number[]) => i.reduce((n, k) => n + males(S[k]), 0) / i.length;
export const profitAnswer = (S: Shop[], x: number, c: number, p1: number, p2: number) =>
  (males(S[x]) * c * p1) / 100 + (females(S[x]) * c * p2) / 100;
export const newShopFemales = (S: Shop[], x: number, q: number, rr: number) =>
  (((S[x].total * (100 + q)) / 100) * rr) / 100;

export interface DQ { kind: string; args: number[]; text: string; answer: number; percent: boolean; wrong: number[]; explanation: string; hard: boolean }
export interface DataSet { item: string; single: string; shops: Shop[]; questions: DQ[] }

const ITEMS: [string, string][] = [['mangoes', 'mango'], ['books', 'book'], ['tickets', 'ticket'], ['pens', 'pen'], ['apples', 'apple']];
const NAMES = ['A', 'B', 'C', 'D'];
const PCTS = [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90];
const int = (n: number) => Number.isInteger(n);
const names = (S: Shop[], idx: number[], f: (s: Shop) => number) => idx.map((k) => S[k].name + ' ' + f(S[k])).join(', ');

type Builder = (S: Shop[], item: string, single: string, r: () => number) => DQ | null;

const bDiff: Builder = (S, item, _single, r) => {
  const idx = shuffle([0, 1, 2, 3], r);
  const ans = diffAnswer(S, idx);
  if (ans === 0) return null;
  const mm = males(S[idx[0]]) + males(S[idx[1]]);
  const ff = females(S[idx[2]]) + females(S[idx[3]]);
  return {
    kind: 'diff', args: idx, percent: false, answer: ans, hard: false,
    text: 'Find the difference between the total number of ' + item + ' sold to males by shops ' + S[idx[0]].name + ' and ' + S[idx[1]].name
      + ' together and the total number sold to females by shops ' + S[idx[2]].name + ' and ' + S[idx[3]].name + ' together.',
    wrong: [mm + ff, Math.abs(females(S[idx[0]]) + females(S[idx[1]]) - males(S[idx[2]]) - males(S[idx[3]])), mm, ff],
    explanation: 'Males: ' + names(S, idx.slice(0, 2), males) + ', total ' + mm + '. Females: ' + names(S, idx.slice(2), females) + ', total ' + ff + '. The difference is ' + ans + '.',
  };
};

const bPct: Builder = (S, item, _single, r) => {
  const pairs: [number, number][] = [];
  for (let x = 0; x < 4; x++) for (let y = 0; y < 4; y++) {
    if (females(S[x]) > males(S[y]) && int(pctMoreAnswer(S, x, y))) pairs.push([x, y]);
  }
  if (!pairs.length) return null;
  const [x, y] = pairs[Math.floor(r() * pairs.length)];
  const f = females(S[x]), m = males(S[y]), ans = pctMoreAnswer(S, x, y);
  return {
    kind: 'pct', args: [x, y], percent: true, answer: ans, hard: true,
    text: 'The total number of ' + item + ' sold to females by shop ' + S[x].name + ' is what percentage more than the total number sold to males by shop ' + S[y].name + '?',
    wrong: [Math.round(((f - m) * 100) / f), Math.round((f * 100) / m), Math.round((m * 100) / f)],
    explanation: 'Females in shop ' + S[x].name + ' = ' + f + '. Males in shop ' + S[y].name + ' = ' + m + '. Percentage more = (' + f + ' - ' + m + ') / ' + m + ' x 100 = ' + ans + '%.',
  };
};

const bAvg: Builder = (S, item, _single, r) => {
  const combos = [[0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]].filter((c) => int(avgMalesAnswer(S, c)));
  if (!combos.length) return null;
  const c = combos[Math.floor(r() * combos.length)];
  const ans = avgMalesAnswer(S, c);
  return {
    kind: 'avg', args: c, percent: false, answer: ans, hard: false,
    text: 'Find the average number of ' + item + ' sold to males by shops ' + S[c[0]].name + ', ' + S[c[1]].name + ' and ' + S[c[2]].name + '.',
    wrong: [Math.round(c.reduce((n, k) => n + females(S[k]), 0) / 3), Math.round(c.reduce((n, k) => n + S[k].total, 0) / 3), ans * 3],
    explanation: 'Males: ' + names(S, c, males) + '. Their sum is ' + ans * 3 + ', so the average is ' + ans * 3 + ' / 3 = ' + ans + '.',
  };
};

const bProfit: Builder = (S, item, single, r) => {
  const x = Math.floor(r() * 4);
  const c = [20, 40, 60, 80][Math.floor(r() * 4)];
  const ps = shuffle([10, 20, 25, 50], r);
  const p1 = ps[0], p2 = ps[1];
  const ans = profitAnswer(S, x, c, p1, p2);
  if (!int(ans)) return null;
  const a1 = (males(S[x]) * c * p1) / 100, a2 = (females(S[x]) * c * p2) / 100;
  return {
    kind: 'profit', args: [x, c, p1, p2], percent: false, answer: ans, hard: true,
    text: 'Shop ' + S[x].name + ' sold its ' + item + ' to males at ' + p1 + '% profit and to females at ' + p2 + '% profit. If the cost price of each ' + single + ' is Rs ' + c + ', find the overall profit earned by the shop (in Rs).',
    wrong: [profitAnswer(S, x, c, p2, p1), a1, a2, Math.round((S[x].total * c * (p1 + p2)) / 200)],
    explanation: 'Males = ' + males(S[x]) + ', females = ' + females(S[x]) + '. Profit on males = ' + males(S[x]) + ' x ' + c + ' x ' + p1 + '% = ' + a1
      + '. Profit on females = ' + females(S[x]) + ' x ' + c + ' x ' + p2 + '% = ' + a2 + '. Overall profit = ' + ans + '.',
  };
};

const bNew: Builder = (S, item, _single, r) => {
  for (let t = 0; t < 40; t++) {
    const x = Math.floor(r() * 4);
    const q = [10, 20, 25, 40, 50][Math.floor(r() * 5)];
    const rr = [20, 25, 40, 50, 60, 75, 80][Math.floor(r() * 7)];
    const E = (S[x].total * (100 + q)) / 100;
    const ans = newShopFemales(S, x, q, rr);
    if (!int(E) || !int(ans) || ans <= 0) continue;
    return {
      kind: 'newshop', args: [x, q, rr], percent: false, answer: ans, hard: true,
      text: 'The total number of ' + item + ' sold by shop E is ' + q + '% more than that of shop ' + S[x].name + '. If shop E sold ' + rr + '% of its ' + item + ' to females, find the number sold to females by shop E.',
      wrong: [E - ans, Math.round((S[x].total * rr) / 100), E, Math.round((S[x].total * (100 - q) * rr) / 10000)],
      explanation: 'Shop ' + S[x].name + ' sold ' + S[x].total + '. Shop E sold ' + q + '% more, which is ' + E + '. Females = ' + rr + '% of ' + E + ' = ' + ans + '.',
    };
  }
  return null;
};

const BUILDERS: Builder[] = [bDiff, bPct, bAvg, bProfit, bNew];

export function makeTable(seed: string): DataSet | null {
  for (let attempt = 0; attempt < 60; attempt++) {
    const r = rng(seed + '#' + attempt);
    const [item, single] = ITEMS[Math.floor(r() * ITEMS.length)];
    const totals = shuffle(Array.from({ length: 36 }, (_, i) => 200 + 20 * i), r).slice(0, 4);
    const pcts = shuffle(PCTS.slice(), r).slice(0, 4);
    const shops: Shop[] = NAMES.map((name, i) => ({ name, total: totals[i], pct: pcts[i] }));
    const questions: DQ[] = [];
    BUILDERS.forEach((b, k) => {
      for (let t = 0; t < 20; t++) {
        const q = b(shops, item, single, rng(seed + '#' + attempt + '.' + k + '.' + t));
        if (q) { questions.push(q); break; }
      }
    });
    if (questions.length >= 4) return { item, single, shops, questions };
  }
  return null;
}

export function tableStem(ds: DataSet): string {
  return 'The table shows the total number of ' + ds.item + ' sold and the percentage sold to females by four shops. '
    + ds.shops.map((s) => 'Shop ' + s.name + ': total ' + s.total + ', ' + s.pct + '% to females').join('; ') + '.';
}

// Five options, the right one among four wrong ones that are plausible and always possible.
export function dqOptions(q: DQ, r: () => number): { options: string[]; correctIndex: number } | null {
  const fmt = (n: number) => String(n) + (q.percent ? '%' : '');
  const seen = new Set<number>([q.answer]);
  const chosen: number[] = [];
  const add = (n: number) => {
    if (chosen.length >= 4 || !Number.isInteger(n) || n <= 0 || seen.has(n)) return;
    seen.add(n); chosen.push(n);
  };
  q.wrong.forEach(add);
  const unit = Math.max(q.percent ? 5 : 2, Math.round(q.answer * 0.04));
  for (let k = 1; chosen.length < 4 && k < 80; k++) { add(q.answer + k * unit); add(q.answer - k * unit); }
  if (chosen.length < 4) return null;
  const options = shuffle([q.answer, ...chosen], r);
  return { options: options.map(fmt), correctIndex: options.indexOf(q.answer) };
}
