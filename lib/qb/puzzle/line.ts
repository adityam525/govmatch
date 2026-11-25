import { rng, shuffle } from '../random';
import { allPerms, LETTERS, type GenQ } from './linear';

export type LineKind = 'stack' | 'height';
// Position 0 is the top of the stack, or the tallest person.
export type LClue =
  | { t: 'offset'; a: number; b: number; d: number }   // pos[a] = pos[b] + d
  | { t: 'between'; a: number; b: number; n: number }  // exactly n between a and b
  | { t: 'adjacent'; a: number; b: number }
  | { t: 'before'; a: number; b: number }              // a is above / taller than b
  | { t: 'atLeast'; a: number; k: number }             // at least k come before a
  | { t: 'mirror'; a: number; b: number };             // shorter than a equals taller than b

export const NUMW = ['None', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const ORD = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth'];

function holds(c: LClue, f: Uint8Array, o: number, n: number): boolean {
  switch (c.t) {
    case 'offset': return f[o + c.a] === f[o + c.b] + c.d;
    case 'between': return Math.abs(f[o + c.a] - f[o + c.b]) === c.n + 1;
    case 'adjacent': return Math.abs(f[o + c.a] - f[o + c.b]) === 1;
    case 'before': return f[o + c.a] < f[o + c.b];
    case 'atLeast': return f[o + c.a] >= c.k;
    case 'mirror': return f[o + c.a] + f[o + c.b] === n - 1;
    default: return false;
  }
}

function filt(f: Uint8Array, n: number, c: LClue): Uint8Array {
  const total = f.length / n;
  let keep = 0;
  for (let p = 0; p < total; p++) if (holds(c, f, p * n, n)) keep++;
  const out = new Uint8Array(keep * n);
  let k = 0;
  for (let p = 0; p < total; p++) {
    const o = p * n;
    if (holds(c, f, o, n)) for (let i = 0; i < n; i++) out[k++] = f[o + i];
  }
  return out;
}

export function solveLine(clues: LClue[], n: number): Uint8Array {
  let f = allPerms(n);
  for (const c of clues) f = filt(f, n, c);
  return f;
}

export interface LinePuzzle { kind: LineKind; n: number; names: string[]; clues: LClue[]; pos: number[]; arrangement: number[] }

export function buildLine(kind: LineKind, n: number, pos: number[], clues: LClue[]): LinePuzzle {
  const names = Array.from({ length: n }, (_, i) => LETTERS[i]);
  const arrangement = new Array<number>(n).fill(0);
  pos.forEach((p, person) => { arrangement[p] = person; });
  return { kind, n, names, clues, pos, arrangement };
}

function trueLine(pos: number[], n: number, kind: LineKind): LClue[] {
  const out: LClue[] = [];
  for (let a = 0; a < n; a++) {
    if (pos[a] >= Math.floor(n / 2)) out.push({ t: 'atLeast', a, k: pos[a] });
    for (let b = 0; b < n; b++) {
      if (a === b) continue;
      const d = pos[a] - pos[b];
      if (d < 0) out.push({ t: 'before', a, b });
      if (kind === 'stack' && Math.abs(d) <= 4) out.push({ t: 'offset', a, b, d });
      if (a < b) {
        const gap = Math.abs(d) - 1;
        if (gap === 0) { if (kind === 'stack') out.push({ t: 'adjacent', a, b }); }
        else if (gap <= 4) out.push({ t: 'between', a, b, n: gap });
        if (kind === 'height' && pos[a] + pos[b] === n - 1) out.push({ t: 'mirror', a, b });
      }
    }
  }
  return out;
}

// A random arrangement plus just enough true clues to make it the only one.
export function makeLine(kind: LineKind, n: number, seed: string, opts: { minClues?: number; maxClues?: number } = {}): LinePuzzle | null {
  const minC = opts.minClues ?? Math.max(4, n - 4);
  const maxC = opts.maxClues ?? n;
  for (let attempt = 0; attempt < 80; attempt++) {
    const r = rng(seed + '#' + attempt);
    const pos = shuffle(Array.from({ length: n }, (_, i) => i), r);
    const cands = shuffle(trueLine(pos, n, kind), r);
    let live = allPerms(n);
    const chosen: LClue[] = [];
    for (const c of cands) {
      if (chosen.length >= n + 2) break;
      const next = filt(live, n, c);
      if (next.length === live.length) continue;
      chosen.push(c); live = next;
      if (live.length === n) break;
    }
    if (live.length !== n) continue;
    let i = 0;
    while (i < chosen.length) {
      if (solveLine(chosen.filter((_, k) => k !== i), n).length === n) chosen.splice(i, 1); else i++;
    }
    if (chosen.length < minC || chosen.length > maxC) continue;
    if (!chosen.some((c) => c.t !== 'before')) continue;
    return buildLine(kind, n, pos, chosen);
  }
  return null;
}

export function lineClueText(c: LClue, nm: string[], kind: LineKind, n: number): string {
  const box = (i: number, first = false) => (kind === 'stack' ? (first ? 'Box ' : 'box ') + nm[i] : nm[i]);
  const things = kind === 'stack' ? 'boxes' : 'persons';
  const thing = kind === 'stack' ? 'box' : 'person';
  const where = kind === 'stack' ? 'placed' : 'in';
  switch (c.t) {
    case 'offset': {
      const k = Math.abs(c.d);
      const rel = k === 1 ? 'immediately' : NUMW[k].toLowerCase() + ' ' + things;
      return `${box(c.b, true)} is placed ${rel} ${c.d > 0 ? 'above' : 'below'} ${box(c.a)}.`;
    }
    case 'between': return `${NUMW[c.n]} ${c.n === 1 ? thing + ' is' : things + ' are'} ${where} between ${box(c.a)} and ${box(c.b)}.`;
    case 'adjacent': return `${box(c.a, true)} and ${box(c.b)} are placed adjacent to each other.`;
    case 'before': return kind === 'stack' ? `${box(c.a, true)} is placed above ${box(c.b)}.` : `${nm[c.a]} is taller than ${nm[c.b]}.`;
    case 'atLeast': {
      if (kind === 'stack') return `More than ${NUMW[c.k - 1].toLowerCase()} boxes are placed above ${box(c.a)}.`;
      const m = n - c.k;
      return m === 1 ? `No person is shorter than ${nm[c.a]}.` : `Less than ${NUMW[m].toLowerCase()} persons are shorter than ${nm[c.a]}.`;
    }
    case 'mirror': return `The number of persons shorter than ${nm[c.a]} is the same as the number of persons taller than ${nm[c.b]}.`;
    default: return '';
  }
}

export function lineStem(p: LinePuzzle): string {
  const list = p.names.slice(0, -1).join(', ') + ' and ' + p.names[p.n - 1];
  const head = p.kind === 'stack'
    ? `${NUMW[p.n]} boxes ${list} are placed one above another in a stack but not in the same order as given.`
    : `${NUMW[p.n]} persons ${list} of a group have different heights.`;
  return head + ' ' + p.clues.map((c) => lineClueText(c, p.names, p.kind, p.n)).join(' ');
}

type Maker = (r: () => number) => GenQ | null;

export function lineQuestions(p: LinePuzzle, seed: string): GenQ[] {
  const { kind, n, names: nm, pos, arrangement: arr } = p;
  const stack = kind === 'stack';
  const label = (i: number) => (stack ? 'Box ' + nm[i] : nm[i]);
  const order = (stack ? 'From the top the order is ' : 'From the tallest to the shortest the order is ') + arr.map((x) => nm[x]).join(', ') + '.';
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
  const others = (...skip: number[]) => nm.map((_, i) => i).filter((i) => !skip.includes(i));
  const countWrong = (v: number, lo: number, hi: number) => [-3, -2, -1, 1, 2, 3].map((d) => v + d).filter((x) => x >= lo && x <= hi).map((x) => NUMW[x]);
  const rel = (d: number) => {
    const k = Math.abs(d);
    if (k === 1) return d < 0 ? 'Immediately above' : 'Immediately below';
    return NUMW[k] + ' boxes ' + (d < 0 ? 'above' : 'below');
  };

  const stackMakers: Maker[] = [
    (r) => {
      const x = Math.floor(r() * n); if (pos[x] === n - 1) return null;
      const t = arr[pos[x] + 1];
      return build(r, `Which of the following boxes is placed just below box ${nm[x]}?`, label(t), others(t, x).map(label), `The box just below ${nm[x]} is ${nm[t]}.`);
    },
    (r) => {
      const t = two(r); if (!t) return null;
      const [x, y] = t; const g = Math.abs(pos[x] - pos[y]) - 1;
      return build(r, `How many boxes are placed between box ${nm[x]} and box ${nm[y]}?`, NUMW[g], countWrong(g, 0, n - 2),
        `Box ${nm[x]} and box ${nm[y]} are ${g + 1} places apart, so ${g} boxes are between them.`);
    },
    (r) => {
      const t = two(r); if (!t) return null;
      const [x, y] = t; const d = pos[x] - pos[y];
      if (Math.abs(d) > 5) return null;
      const wrong = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].filter((v) => v !== d).map(rel);
      return build(r, `What is the position of box ${nm[x]} with respect to box ${nm[y]}?`, rel(d), wrong, `Box ${nm[x]} is ${rel(d).toLowerCase()} box ${nm[y]}.`);
    },
    (r) => {
      const same = nm.filter((_, i) => pos[i] === i);
      const wrong = [0, 1, 2, 3, 4, 5].filter((v) => v !== same.length).map((v) => NUMW[v]);
      return build(r, 'If all the boxes are arranged in alphabetical order from top to bottom, how many boxes will remain unchanged at their position?',
        NUMW[same.length], wrong, `In alphabetical order box ${nm[0]} is first, ${nm[1]} second, and so on. Boxes already in their alphabetical place: ${same.join(', ') || 'none'}.`);
    },
    (r) => {
      const k = 3 + Math.floor(r() * 3); const fromTop = r() < 0.5;
      if (k > n - 1) return null;
      const t = fromTop ? arr[k - 1] : arr[n - k];
      return build(r, `Which of the following boxes is placed ${ORD[k]} from the ${fromTop ? 'top' : 'bottom'}?`, label(t), others(t).map(label),
        `Counting ${k} places from the ${fromTop ? 'top' : 'bottom'} gives box ${nm[t]}.`);
    },
  ];

  const heightMakers: Maker[] = [
    (r) => {
      const k = 2 + Math.floor(r() * (n - 2)); const t = arr[k - 1];
      return build(r, `Who among the following is the ${ORD[k]} tallest?`, nm[t], others(t).map((i) => nm[i]), `${nm[t]} is number ${k} counting from the tallest.`);
    },
    (r) => {
      const x = Math.floor(r() * n); if (pos[x] === n - 1) return null;
      const t = arr[pos[x] + 1];
      return build(r, `Who among the following is immediately shorter than ${nm[x]}?`, nm[t], others(t, x).map((i) => nm[i]), `The person just after ${nm[x]} in height order is ${nm[t]}.`);
    },
    (r) => {
      const x = Math.floor(r() * n); if (pos[x] === 0) return null;
      const t = arr[pos[x] - 1];
      return build(r, `Who among the following is immediately taller than ${nm[x]}?`, nm[t], others(t, x).map((i) => nm[i]), `The person just before ${nm[x]} in height order is ${nm[t]}.`);
    },
    (r) => {
      const t = two(r); if (!t) return null;
      const [x, y] = t; const g = Math.abs(pos[x] - pos[y]) - 1;
      return build(r, `How many persons are in between ${nm[x]} and ${nm[y]} in height?`, NUMW[g], countWrong(g, 0, n - 2),
        `${nm[x]} and ${nm[y]} are ${g + 1} places apart, so ${g} persons are in between.`);
    },
    (r) => {
      const x = Math.floor(r() * n); const k = n - 1 - pos[x];
      return build(r, `How many persons are shorter than ${nm[x]}?`, NUMW[k], countWrong(k, 0, n - 1), `${k} persons come after ${nm[x]} in height order, so ${k} are shorter.`);
    },
  ];

  const makers = stack ? stackMakers : heightMakers;
  const out: GenQ[] = [];
  makers.forEach((mk, idx) => {
    for (let t = 0; t < 12; t++) {
      const q = mk(rng(seed + '#q' + idx + '.' + t));
      if (q) { out.push(q); break; }
    }
  });
  return out;
}
