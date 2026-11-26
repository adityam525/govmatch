import { rng, shuffle } from '../random';

// Operators are stored as ASCII. The real symbols appear only in the question text.
export type Op = '>' | '>=' | '<' | '<=' | '=';
export interface Chain { letters: string[]; ops: Op[] }
export interface Concl { a: string; op: Op; b: string }
export interface IneqPuzzle { chains: Chain[]; c1: Concl; c2: Concl; verdict: number; letters: number }

const GE = '\u2265';
const LE = '\u2264';
const SHOW: Record<string, string> = { '>': '>', '>=': GE, '<': '<', '<=': LE, '=': '=' };
export const disp = (op: string) => SHOW[op] ?? op;
const norm = (s: string) => s.replace(/\u2265/g, '>=').replace(/\u2264/g, '<=');

// Same order as the exam. Fixed, never shuffled.
export const VERDICT_LABELS: string[] = [
  'If only conclusion I is true',
  'If only conclusion II is true',
  'If either conclusion I or II is true',
  'If neither conclusion I nor II is true',
  'If both conclusions I and II are true',
];

const NEG: Record<string, Op> = { '>': '<=', '>=': '<', '<': '>=', '<=': '>' };
const FLIP: Record<string, Op> = { '>': '<', '>=': '<=', '<': '>', '<=': '>=', '=': '=' };

interface Edge { from: string; to: string; strict: boolean; eq: boolean }
export type Graph = Map<string, Edge[]>;
interface Hit { prev: string | null; edge: Edge | null }

export function parseChain(s: string): Chain {
  const letters: string[] = [], ops: Op[] = [];
  norm(s).trim().split(/\s+/).forEach((tok, i) => { if (i % 2 === 0) letters.push(tok); else ops.push(tok as Op); });
  return { letters, ops };
}
export function parseConcl(s: string): Concl {
  const [a, op, b] = norm(s).trim().split(/\s+/);
  return { a, op: op as Op, b };
}

// An edge from x to y means x is greater than (or equal to) y.
export function buildGraph(chains: Chain[]): Graph {
  const g: Graph = new Map();
  const add = (e: Edge) => { if (!g.has(e.from)) g.set(e.from, []); (g.get(e.from) as Edge[]).push(e); };
  for (const ch of chains) {
    for (let i = 0; i < ch.ops.length; i++) {
      const x = ch.letters[i], y = ch.letters[i + 1], op = ch.ops[i];
      if (op === '>') add({ from: x, to: y, strict: true, eq: false });
      else if (op === '>=') add({ from: x, to: y, strict: false, eq: false });
      else if (op === '<') add({ from: y, to: x, strict: true, eq: false });
      else if (op === '<=') add({ from: y, to: x, strict: false, eq: false });
      else { add({ from: x, to: y, strict: false, eq: true }); add({ from: y, to: x, strict: false, eq: true }); }
    }
  }
  return g;
}

// Search over (letter, "has a strict step so far") states.
function bfs(g: Graph, a: string): Map<string, Hit> {
  const seen = new Map<string, Hit>();
  const start = a + '|0';
  seen.set(start, { prev: null, edge: null });
  const queue = [start];
  for (let h = 0; h < queue.length; h++) {
    const key = queue[h];
    const [node, s] = key.split('|');
    for (const e of g.get(node) ?? []) {
      const nk = e.to + '|' + (s === '1' || e.strict ? '1' : '0');
      if (!seen.has(nk)) { seen.set(nk, { prev: key, edge: e }); queue.push(nk); }
    }
  }
  return seen;
}

function pathTo(seen: Map<string, Hit>, b: string, strict: boolean): Edge[] | null {
  const key = strict ? b + '|1' : seen.has(b + '|0') ? b + '|0' : b + '|1';
  if (!seen.has(key)) return null;
  const out: Edge[] = [];
  let cur: string | null = key;
  while (cur) {
    const hit: Hit = seen.get(cur) as Hit;
    if (hit.edge) out.unshift(hit.edge);
    cur = hit.prev;
  }
  return out;
}

function reach(g: Graph, a: string, b: string): { geq: Edge[] | null; strict: Edge[] | null } {
  const seen = bfs(g, a);
  return { geq: pathTo(seen, b, false), strict: pathTo(seen, b, true) };
}

// True only when the conclusion must hold whatever the letters stand for.
export function holds(g: Graph, c: Concl): boolean {
  const ab = reach(g, c.a, c.b), ba = reach(g, c.b, c.a);
  switch (c.op) {
    case '>': return ab.strict !== null;
    case '>=': return ab.geq !== null;
    case '<': return ba.strict !== null;
    case '<=': return ba.geq !== null;
    default: return ab.geq !== null && ba.geq !== null;
  }
}

export function complementary(c1: Concl, c2: Concl): boolean {
  let op2 = c2.op;
  if (c2.a === c1.a && c2.b === c1.b) { /* same direction */ }
  else if (c2.a === c1.b && c2.b === c1.a) op2 = FLIP[c2.op];
  else return false;
  return NEG[c1.op] === op2;
}

// 0 only I, 1 only II, 2 either, 3 neither, 4 both.
export function verdictOf(g: Graph, c1: Concl, c2: Concl): number {
  const t1 = holds(g, c1), t2 = holds(g, c2);
  if (t1 && t2) return 4;
  if (t1) return 0;
  if (t2) return 1;
  return complementary(c1, c2) ? 2 : 3;
}

const sym = (e: Edge) => (e.eq ? '=' : e.strict ? '>' : '>=');
const chainText = (p: Edge[]) => p[0].from + p.map((e) => ' ' + disp(sym(e)) + ' ' + e.to).join('');
const relOf = (p: Edge[]) => p[0].from + ' ' + disp(p.every((e) => e.eq) ? '=' : p.some((e) => e.strict) ? '>' : '>=') + ' ' + p[p.length - 1].to;

function describe(g: Graph, a: string, b: string): { chain: string; rel: string } | null {
  const ab = reach(g, a, b), ba = reach(g, b, a);
  const pick = ab.strict ?? ba.strict ?? ab.geq ?? ba.geq;
  return pick && pick.length ? { chain: chainText(pick), rel: relOf(pick) } : null;
}

export function ineqExplain(p: IneqPuzzle): string {
  const g = buildGraph(p.chains);
  const part = (name: string, c: Concl) => {
    const d = describe(g, c.a, c.b);
    const ok = holds(g, c);
    const bad = holds(g, { a: c.a, op: NEG[c.op], b: c.b });
    return 'Conclusion ' + name + ' (' + c.a + ' ' + disp(c.op) + ' ' + c.b + '): '
      + (d ? d.chain + ', so ' + d.rel + '. ' : 'the statements do not link these two letters, so nothing can be said. ')
      + (ok ? 'It is true.' : bad ? 'It is false.' : 'It is not certain.');
  };
  const tail = p.verdict === 2
    ? ' Neither is certain, but they are exact opposites, so one of them must be true: either I or II is true.' : '';
  return part('I', p.c1) + ' ' + part('II', p.c2) + tail;
}

export function ineqStem(p: IneqPuzzle): string {
  const st = p.chains.map((ch) => ch.letters.map((l, i) => (i < ch.ops.length ? l + ' ' + disp(ch.ops[i]) : l)).join(' ')).join('; ');
  return 'Statements: ' + st + '. Conclusions: I. ' + p.c1.a + ' ' + disp(p.c1.op) + ' ' + p.c1.b
    + '  II. ' + p.c2.a + ' ' + disp(p.c2.op) + ' ' + p.c2.b + '. '
    + 'Study the conclusions based on the statements and select the appropriate answer.';
}

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const OPS4: Op[] = ['>', '>=', '<', '<='];

// Two statements that share letters, true for a hidden set of numbers, and two conclusions with the wanted verdict.
export function makeIneq(seed: string, target: number, opts: { nA?: number; nB?: number; shared?: number } = {}): IneqPuzzle | null {
  for (let attempt = 0; attempt < 200; attempt++) {
    const r = rng(seed + '#' + attempt);
    const nA = opts.nA ?? 4 + Math.floor(r() * 2);
    const nB = opts.nB ?? 4 + Math.floor(r() * 2);
    const shared = opts.shared ?? (r() < 0.3 ? 2 : 1);
    const pool = shuffle(ALPHA.slice(), r);
    const A = pool.slice(0, nA);
    const common = shuffle(A.slice(), r).slice(0, shared);
    const fresh = pool.slice(nA, nA + nB - shared);
    const B = [...common, ...fresh];
    const all = [...A, ...fresh];
    const value: Record<string, number> = {};
    for (const l of all) value[l] = 1 + Math.floor(r() * (all.length + 1));

    const opFor = (x: string, y: string): Op => {
      const d = value[x] - value[y];
      if (d > 0) return r() < 0.6 ? '>' : '>=';
      if (d < 0) return r() < 0.6 ? '<' : '<=';
      return r() < 0.7 ? '=' : r() < 0.5 ? '>=' : '<=';
    };
    // Either falling steadily, or falling to a low point and rising again.
    const order = (ls: string[]): string[] => {
      const desc = ls.slice().sort((p, q) => value[q] - value[p]);
      if (r() < 0.5) return desc;
      const min = desc[desc.length - 1];
      const left: string[] = [], right: string[] = [];
      desc.slice(0, -1).forEach((l) => (r() < 0.5 ? left : right).push(l));
      if (left.length === 0 || right.length === 0) return desc;
      return [...left, min, ...right.reverse()];
    };
    const mk = (ls: string[]): Chain => {
      const o = order(ls);
      return { letters: o, ops: o.slice(0, -1).map((x, i) => opFor(x, o[i + 1])) };
    };
    const chains = [mk(A), mk(B)];
    const g = buildGraph(chains);

    const next = new Set<string>();
    for (const ch of chains) {
      for (let i = 0; i + 1 < ch.letters.length; i++) {
        next.add(ch.letters[i] + ch.letters[i + 1]);
        next.add(ch.letters[i + 1] + ch.letters[i]);
      }
    }
    const D: Concl[] = [], N: Concl[] = [];
    for (const a of all) {
      for (const b of all) {
        if (a === b || next.has(a + b)) continue;
        for (const op of OPS4) { const c: Concl = { a, op, b }; (holds(g, c) ? D : N).push(c); }
      }
    }
    const pick = <T,>(arr: T[]): T | null => (arr.length ? arr[Math.floor(r() * arr.length)] : null);

    for (let k = 0; k < 30; k++) {
      let c1: Concl | null, c2: Concl | null;
      if (target === 4) { c1 = pick(D); c2 = pick(D); }
      else if (target === 0) { c1 = pick(D); c2 = pick(N); }
      else if (target === 1) { c1 = pick(N); c2 = pick(D); }
      else if (target === 3) { c1 = pick(N); c2 = pick(N); }
      else {
        c1 = pick(N);
        c2 = c1 ? { a: c1.a, op: NEG[c1.op], b: c1.b } : null;
        if (c2 && r() < 0.5) c2 = { a: c2.b, op: FLIP[c2.op], b: c2.a };
      }
      if (!c1 || !c2) break;
      if (c1.a === c2.a && c1.b === c2.b && c1.op === c2.op) continue;
      const samePair = (c1.a === c2.a && c1.b === c2.b) || (c1.a === c2.b && c1.b === c2.a);
      if (target !== 2 && samePair) continue;
      if (verdictOf(g, c1, c2) === target) return { chains, c1, c2, verdict: target, letters: all.length };
    }
  }
  return null;
}
