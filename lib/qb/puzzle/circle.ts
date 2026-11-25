import { rng, shuffle } from '../random';
import { allPerms, LETTERS, type GenQ } from './linear';
import { NUMW } from './line';

// Positions go clockwise. Everyone faces the centre, so clockwise is to a person's left.
export type CClue =
  | { t: 'offset'; a: number; b: number; d: number }   // a sits d seats clockwise (to the left) of b
  | { t: 'between'; a: number; b: number; n: number }  // exactly n persons between them on one side
  | { t: 'adjacent'; a: number; b: number }
  | { t: 'opposite'; a: number; b: number };

const ORD = ['', 'first', 'second', 'third', 'fourth', 'fifth'];
const ORDC = ['', 'First', 'Second', 'Third', 'Fourth', 'Fifth'];
const md = (x: number, n: number) => ((x % n) + n) % n;

function holds(c: CClue, f: Uint8Array, o: number, n: number): boolean {
  const dd = md(f[o + c.a] - f[o + c.b], n);
  switch (c.t) {
    case 'offset': return dd === c.d;
    case 'between': return dd - 1 === c.n || n - dd - 1 === c.n;
    case 'adjacent': return dd === 1 || dd === n - 1;
    case 'opposite': return dd * 2 === n;
    default: return false;
  }
}

const CACHE = new Map<number, Uint8Array>();
// Every seating with person 0 fixed in seat 0, so a rotation is not counted twice.
function circAll(n: number): Uint8Array {
  const hit = CACHE.get(n);
  if (hit) return hit;
  const base = allPerms(n - 1);
  const total = base.length / (n - 1);
  const out = new Uint8Array(total * n);
  for (let p = 0; p < total; p++) {
    out[p * n] = 0;
    for (let i = 0; i < n - 1; i++) out[p * n + 1 + i] = base[p * (n - 1) + i] + 1;
  }
  CACHE.set(n, out);
  return out;
}

function filt(f: Uint8Array, n: number, c: CClue): Uint8Array {
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

export function solveCirc(clues: CClue[], n: number): Uint8Array {
  let f = circAll(n);
  for (const c of clues) f = filt(f, n, c);
  return f;
}

export interface CircPuzzle { n: number; names: string[]; clues: CClue[]; pos: number[]; arrangement: number[] }

export function buildCirc(n: number, pos: number[], clues: CClue[]): CircPuzzle {
  const names = Array.from({ length: n }, (_, i) => LETTERS[i]);
  const arrangement = new Array<number>(n).fill(0);
  pos.forEach((p, person) => { arrangement[p] = person; });
  return { n, names, clues, pos, arrangement };
}

function trueCirc(pos: number[], n: number): CClue[] {
  const out: CClue[] = [];
  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) {
      if (a === b) continue;
      const d = md(pos[a] - pos[b], n);
      if (d * 2 === n) { if (a < b) out.push({ t: 'opposite', a, b }); }
      else if (Math.min(d, n - d) <= 3) out.push({ t: 'offset', a, b, d });
      if (a < b) {
        if (d === 1 || d === n - 1) out.push({ t: 'adjacent', a, b });
        else for (const g of [d - 1, n - d - 1]) if (g >= 1 && g <= 4) out.push({ t: 'between', a, b, n: g });
      }
    }
  }
  return out;
}

export function makeCirc(n: number, seed: string, opts: { minClues?: number; maxClues?: number } = {}): CircPuzzle | null {
  const minC = opts.minClues ?? Math.max(4, n - 4);
  const maxC = opts.maxClues ?? n + 1;
  for (let attempt = 0; attempt < 80; attempt++) {
    const r = rng(seed + '#' + attempt);
    const raw = shuffle(Array.from({ length: n }, (_, i) => i), r);
    const pos = raw.map((x) => md(x - raw[0], n));
    const cands = shuffle(trueCirc(pos, n), r);
    let live = circAll(n);
    const chosen: CClue[] = [];
    for (const c of cands) {
      if (chosen.length >= n + 3) break;
      const next = filt(live, n, c);
      if (next.length === live.length) continue;
      chosen.push(c); live = next;
      if (live.length === n) break;
    }
    if (live.length !== n) continue;
    let i = 0;
    while (i < chosen.length) {
      if (solveCirc(chosen.filter((_, k) => k !== i), n).length === n) chosen.splice(i, 1); else i++;
    }
    if (chosen.length < minC || chosen.length > maxC) continue;
    if (!chosen.some((c) => c.t === 'offset')) continue;
    return buildCirc(n, pos, chosen);
  }
  return null;
}

export function circClueText(c: CClue, nm: string[], n: number): string {
  switch (c.t) {
    case 'offset': {
      const left = c.d * 2 < n; const k = left ? c.d : n - c.d; const side = left ? 'left' : 'right';
      return k === 1 ? `${nm[c.a]} sits immediately to the ${side} of ${nm[c.b]}.` : `${nm[c.a]} sits ${ORD[k]} to the ${side} of ${nm[c.b]}.`;
    }
    case 'between': return `${NUMW[c.n]} ${c.n === 1 ? 'person sits' : 'persons sit'} between ${nm[c.a]} and ${nm[c.b]}.`;
    case 'adjacent': return `${nm[c.a]} and ${nm[c.b]} sit adjacent to each other.`;
    case 'opposite': return `${nm[c.a]} sits opposite to ${nm[c.b]}.`;
    default: return '';
  }
}

export function circStem(p: CircPuzzle): string {
  const list = p.names.slice(0, -1).join(', ') + ' and ' + p.names[p.n - 1];
  return `${NUMW[p.n]} persons ${list} sit around a circular table facing the centre, but not in the same order as given. `
    + p.clues.map((c) => circClueText(c, p.names, p.n)).join(' ');
}

type Maker = (r: () => number) => GenQ | null;

export function circQuestions(p: CircPuzzle, seed: string): GenQ[] {
  const { n, names: nm, pos, arrangement: arr } = p;
  const order = `Going clockwise from ${nm[0]} (everyone faces the centre, so clockwise is to the left) the order is ` + arr.map((x) => nm[x]).join(', ') + '.';
  const build = (r: () => number, text: string, answer: string, wrong: string[], why: string): GenQ | null => {
    const pool = shuffle(Array.from(new Set(wrong.filter((w) => w !== answer))), r).slice(0, 3);
    if (pool.length < 3) return null;
    const options = shuffle([answer, ...pool], r);
    return { text, options, correctIndex: options.indexOf(answer), explanation: order + ' ' + why };
  };
  const rel = (d: number) => {
    if (d * 2 === n) return 'Opposite';
    const left = d * 2 < n; const k = left ? d : n - d;
    return k === 1 ? (left ? 'Immediate left' : 'Immediate right') : `${ORDC[k]} to the ${left ? 'left' : 'right'}`;
  };
  const others = (...skip: number[]) => nm.map((_, i) => i).filter((i) => !skip.includes(i));
  const makers: Maker[] = [
    (r) => {
      const x = Math.floor(r() * n); const y = Math.floor(r() * n); if (x === y) return null;
      const d = md(pos[x] - pos[y], n);
      const wrong = Array.from({ length: n - 1 }, (_, i) => i + 1).filter((v) => v !== d).map(rel);
      return build(r, `What is the position of ${nm[x]} with respect to ${nm[y]}?`, rel(d), wrong, `${nm[x]} is at ${rel(d).toLowerCase()} of ${nm[y]}.`);
    },
    (r) => {
      const x = Math.floor(r() * n); const k = 2 + Math.floor(r() * 2); const left = r() < 0.5;
      const t = arr[md(pos[x] + (left ? k : -k), n)];
      return build(r, `Who sits ${ORD[k]} to the ${left ? 'left' : 'right'} of ${nm[x]}?`, nm[t], others(t, x).map((i) => nm[i]),
        `Counting ${k} seats to the ${left ? 'left' : 'right'} of ${nm[x]} gives ${nm[t]}.`);
    },
    (r) => {
      if (n % 2 !== 0) return null;
      const x = Math.floor(r() * n); const t = arr[md(pos[x] + n / 2, n)];
      return build(r, `Who sits opposite to ${nm[x]}?`, nm[t], others(t, x).map((i) => nm[i]), `${nm[t]} is exactly ${n / 2} seats away from ${nm[x]}, which is opposite.`);
    },
    (r) => {
      const x = Math.floor(r() * n); const y = Math.floor(r() * n); if (x === y) return null;
      const g = md(pos[y] - pos[x], n) - 1;
      const wrong = [-3, -2, -1, 1, 2, 3].map((d) => g + d).filter((v) => v >= 0 && v <= n - 2).map((v) => NUMW[v]);
      return build(r, `How many persons sit between ${nm[x]} and ${nm[y]} when counted from the left of ${nm[x]}?`, NUMW[g], wrong,
        `Counting from the left of ${nm[x]} (clockwise), ${g} persons come before ${nm[y]}.`);
    },
    (r) => {
      const x = Math.floor(r() * n); const t = arr[md(pos[x] - 1, n)];
      return build(r, `Who sits immediately to the right of ${nm[x]}?`, nm[t], others(t, x).map((i) => nm[i]), `The person on ${nm[x]}'s right is ${nm[t]}.`);
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
