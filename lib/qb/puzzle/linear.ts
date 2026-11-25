import { rng, shuffle } from '../random';

// People are numbers 0..n-1. pos[person] is the seat (0 = leftmost) in a row facing north.
export type Clue =
  | { t: 'offset'; a: number; b: number; d: number }   // a sits d places to the right of b (d < 0 means left)
  | { t: 'between'; a: number; b: number; n: number }  // exactly n persons sit between a and b
  | { t: 'adjacent'; a: number; b: number }
  | { t: 'end'; a: number };

export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ORD = ['', 'first', 'second', 'third', 'fourth', 'fifth'];
const ORD_CAP = ['', 'First', 'Second', 'Third', 'Fourth', 'Fifth'];
const NUM_WORD = ['None', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const PEOPLE = ['', '', '', '', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];

function holdsAt(c: Clue, f: Uint8Array, o: number, n: number): boolean {
  switch (c.t) {
    case 'offset': return f[o + c.a] === f[o + c.b] + c.d;
    case 'between': return Math.abs(f[o + c.a] - f[o + c.b]) === c.n + 1;
    case 'adjacent': return Math.abs(f[o + c.a] - f[o + c.b]) === 1;
    case 'end': return f[o + c.a] === 0 || f[o + c.a] === n - 1;
    default: return false;
  }
}

const CACHE = new Map<number, Uint8Array>();
// Every way to seat n people, stored flat: n numbers per arrangement.
export function allPerms(n: number): Uint8Array {
  const hit = CACHE.get(n);
  if (hit) return hit;
  let total = 1;
  for (let i = 2; i <= n; i++) total *= i;
  const out = new Uint8Array(total * n);
  const a = Array.from({ length: n }, (_, i) => i);
  const c = new Array(n).fill(0);
  let k = 0;
  const emit = () => { for (let i = 0; i < n; i++) out[k++] = a[i]; };
  emit();
  let i = 0;
  while (i < n) {
    if (c[i] < i) {
      const j = i % 2 === 0 ? 0 : c[i];
      const t = a[j]; a[j] = a[i]; a[i] = t;
      emit();
      c[i]++; i = 0;
    } else { c[i] = 0; i++; }
  }
  CACHE.set(n, out);
  return out;
}

export function filterPerms(f: Uint8Array, n: number, c: Clue): Uint8Array {
  const total = f.length / n;
  let keep = 0;
  for (let p = 0; p < total; p++) if (holdsAt(c, f, p * n, n)) keep++;
  const out = new Uint8Array(keep * n);
  let k = 0;
  for (let p = 0; p < total; p++) {
    const o = p * n;
    if (holdsAt(c, f, o, n)) for (let i = 0; i < n; i++) out[k++] = f[o + i];
  }
  return out;
}

// All arrangements that satisfy every clue. Length n means exactly one.
export function solve(clues: Clue[], n: number): Uint8Array {
  let f = allPerms(n);
  for (const c of clues) f = filterPerms(f, n, c);
  return f;
}

export interface Puzzle { n: number; names: string[]; clues: Clue[]; pos: number[]; arrangement: number[] }

export function buildPuzzle(n: number, pos: number[], clues: Clue[]): Puzzle {
  const names = Array.from({ length: n }, (_, i) => LETTERS[i]);
  const arrangement = new Array<number>(n).fill(0);
  pos.forEach((p, person) => { arrangement[p] = person; });
  return { n, names, clues, pos, arrangement };
}

function trueClues(pos: number[], n: number): Clue[] {
  const out: Clue[] = [];
  for (let a = 0; a < n; a++) {
    if (pos[a] === 0 || pos[a] === n - 1) out.push({ t: 'end', a });
    for (let b = 0; b < n; b++) {
      if (a === b) continue;
      const d = pos[a] - pos[b];
      if (Math.abs(d) <= 4) out.push({ t: 'offset', a, b, d });
      if (a < b) {
        const gap = Math.abs(d) - 1;
        if (gap === 0) out.push({ t: 'adjacent', a, b });
        else if (gap <= 4) out.push({ t: 'between', a, b, n: gap });
      }
    }
  }
  return out;
}

// A random arrangement plus just enough true clues to make it the only one.
export function makePuzzle(n: number, seed: string, opts: { minClues?: number; maxClues?: number } = {}): Puzzle | null {
  const minC = opts.minClues ?? Math.max(4, n - 4);
  const maxC = opts.maxClues ?? n - 1;
  for (let attempt = 0; attempt < 40; attempt++) {
    const r = rng(seed + '#' + attempt);
    const pos = shuffle(Array.from({ length: n }, (_, i) => i), r);
    const cands = shuffle(trueClues(pos, n), r);
    let live = allPerms(n);
    const chosen: Clue[] = [];
    for (const c of cands) {
      if (chosen.length >= n + 2) break;
      const next = filterPerms(live, n, c);
      if (next.length === live.length) continue;
      chosen.push(c); live = next;
      if (live.length === n) break;
    }
    if (live.length !== n) continue;
    let i = 0;
    while (i < chosen.length) {
      const rest = chosen.filter((_, k) => k !== i);
      if (solve(rest, n).length === n) chosen.splice(i, 1); else i++;
    }
    if (chosen.length < minC || chosen.length > maxC) continue;
    if (!chosen.some((c) => c.t === 'offset' || c.t === 'between')) continue;
    return buildPuzzle(n, pos, chosen);
  }
  return null;
}

export function clueText(c: Clue, nm: string[]): string {
  switch (c.t) {
    case 'offset': {
      const side = c.d > 0 ? 'right' : 'left';
      const k = Math.abs(c.d);
      return k === 1 ? `${nm[c.a]} sits immediately to the ${side} of ${nm[c.b]}.` : `${nm[c.a]} sits ${ORD[k]} to the ${side} of ${nm[c.b]}.`;
    }
    case 'between': return `${NUM_WORD[c.n]} ${c.n === 1 ? 'person sits' : 'persons sit'} between ${nm[c.a]} and ${nm[c.b]}.`;
    case 'adjacent': return `${nm[c.a]} and ${nm[c.b]} sit adjacent to each other.`;
    case 'end': return `${nm[c.a]} sits at one of the extreme ends.`;
    default: return '';
  }
}

export function stem(p: Puzzle): string {
  const list = p.names.slice(0, -1).join(', ') + ' and ' + p.names[p.n - 1];
  return `${PEOPLE[p.n]} persons ${list} sit in a row facing north but not in the same order as given. ` + p.clues.map((c) => clueText(c, p.names)).join(' ');
}

export function relation(d: number): string {
  const side = d > 0 ? 'right' : 'left';
  const k = Math.abs(d);
  return k === 1 ? `Immediate ${side}` : `${ORD_CAP[k]} to the ${side}`;
}

export interface GenQ { text: string; options: string[]; correctIndex: number; explanation: string }

// Five question kinds, all answered from the one solved arrangement.
// Each kind retries with new random picks until it makes a valid question.
export function questionsFor(p: Puzzle, seed: string): GenQ[] {
  const { n, names: nm, pos, arrangement: arr } = p;
  const order = 'Left to right the order is ' + arr.map((x) => nm[x]).join(', ') + '.';
  const build = (r: () => number, text: string, answer: string, wrong: string[], why: string): GenQ | null => {
    const pool = shuffle(Array.from(new Set(wrong.filter((w) => w !== answer))), r).slice(0, 3);
    if (pool.length < 3) return null;
    const options = shuffle([answer, ...pool], r);
    return { text, options, correctIndex: options.indexOf(answer), explanation: order + ' ' + why };
  };
  const two = (r: () => number): [number, number] | null => {
    const a = Math.floor(r() * n); const b = Math.floor(r() * n);
    return a === b ? null : [a, b];
  };
  const makers: ((r: () => number) => GenQ | null)[] = [
    (r) => {
      const t = two(r); if (!t) return null;
      const [x, y] = t; const d = pos[x] - pos[y];
      if (Math.abs(d) > 5) return null;
      const wrong = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].filter((v) => v !== d).map(relation);
      return build(r, `What is the position of ${nm[x]} with respect to ${nm[y]}?`, relation(d), wrong,
        `${nm[x]} is at ${relation(d).toLowerCase()} of ${nm[y]}.`);
    },
    (r) => {
      const x = Math.floor(r() * n); const k = pos[x];
      const wrong = [-3, -2, -1, 1, 2, 3].map((v) => k + v).filter((v) => v >= 0 && v <= n - 1).map((v) => NUM_WORD[v]);
      return build(r, `How many persons sit to the left of ${nm[x]}?`, NUM_WORD[k], wrong,
        `${nm[x]} is in seat ${k + 1} from the left, so ${k} persons are to the left.`);
    },
    (r) => {
      const x = Math.floor(r() * n); const k = 2 + Math.floor(r() * 3); const side = r() < 0.5 ? 1 : -1;
      const tp = pos[x] + side * k;
      if (tp < 0 || tp > n - 1) return null;
      const target = arr[tp]; const where = side > 0 ? 'right' : 'left';
      return build(r, `Who among the following sits ${ORD[k]} to the ${where} of ${nm[x]}?`, nm[target],
        nm.filter((_, i) => i !== target && i !== x), `Counting ${k} seats to the ${where} of ${nm[x]} gives ${nm[target]}.`);
    },
    (r) => {
      const t = two(r); if (!t) return null;
      const [x, y] = t; const gap = Math.abs(pos[x] - pos[y]) - 1;
      const wrong = [-3, -2, -1, 1, 2, 3].map((v) => gap + v).filter((v) => v >= 0 && v <= n - 2).map((v) => NUM_WORD[v]);
      return build(r, `How many persons sit between ${nm[x]} and ${nm[y]}?`, NUM_WORD[gap], wrong,
        `${nm[x]} and ${nm[y]} are ${gap + 1} seats apart, so ${gap} persons sit between them.`);
    },
    (r) => {
      const kinds = ['end', 'middle', 'neighbour', 'left', 'between'];
      const used = new Set<string>(); const stmts: { text: string; ok: boolean }[] = [];
      for (let g = 0; g < 200 && stmts.length < 3; g++) {
        const kind = kinds[Math.floor(r() * kinds.length)];
        if (used.has(kind) || (kind === 'middle' && n % 2 === 0)) continue;
        const a = Math.floor(r() * n); const b = Math.floor(r() * n);
        if (a === b) continue;
        used.add(kind);
        const d = Math.abs(pos[a] - pos[b]);
        if (kind === 'end') stmts.push({ text: `${nm[a]} sits at one of the extreme ends`, ok: pos[a] === 0 || pos[a] === n - 1 });
        else if (kind === 'middle') stmts.push({ text: `${nm[a]} sits exactly in the middle of the row`, ok: pos[a] === (n - 1) / 2 });
        else if (kind === 'neighbour') stmts.push({ text: `${nm[a]} and ${nm[b]} are not immediate neighbours`, ok: d !== 1 });
        else if (kind === 'left') stmts.push({ text: `${nm[a]} sits to the left of ${nm[b]}`, ok: pos[a] < pos[b] });
        else { const k = 1 + Math.floor(r() * 3); stmts.push({ text: `${NUM_WORD[k]} ${k === 1 ? 'person sits' : 'persons sit'} between ${nm[a]} and ${nm[b]}`, ok: d - 1 === k }); }
      }
      if (stmts.length < 3) return null;
      const roman = ['I', 'II', 'III'];
      const label = (set: number[]) => (set.length === 3 ? 'All of I, II and III' : 'Only ' + set.map((i) => roman[i]).join(' and '));
      const trueSet = stmts.map((s, i) => (s.ok ? i : -1)).filter((i) => i >= 0);
      if (trueSet.length < 1) return null;
      const subsets = [[0], [1], [2], [0, 1], [0, 2], [1, 2], [0, 1, 2]].map(label);
      return build(r, 'Which of the following statements is correct? ' + stmts.map((s, i) => roman[i] + '. ' + s.text + '.').join(' '),
        label(trueSet), subsets, 'Check each statement against the order: ' + stmts.map((s, i) => roman[i] + (s.ok ? ' is true' : ' is false')).join(', ') + '.');
    },
  ];
  const out: GenQ[] = [];
  makers.forEach((mk, idx) => {
    for (let t = 0; t < 12; t++) {
      const q = mk(rng(seed + '#q' + idx + '.' + t));
      if (q) { out.push(q); break; }
    }
  });
  return out;
}
