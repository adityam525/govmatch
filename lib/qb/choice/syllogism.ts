import { rng, shuffle } from '../random';

export type SKind = 'all' | 'some' | 'no' | 'somenot' | 'few';
export type CKind = 'all' | 'some' | 'no' | 'somenot' | 'poss-all' | 'poss-some';
export interface Stmt { kind: SKind; a: number; b: number }
export interface SConcl { kind: CKind; a: number; b: number }
export interface SyllPuzzle { terms: string[]; stmts: Stmt[]; c1: SConcl; c2: SConcl; verdict: number }

// Same order as the exam. Fixed, never shuffled.
export const SYLL_LABELS: string[] = [
  'If only conclusion I follows',
  'If only conclusion II follows',
  'If either conclusion I or II follows',
  'If neither conclusion I nor II follows',
  'If both conclusions I and II follow',
];

const WORDS = ['pens', 'books', 'chairs', 'tables', 'lamps', 'doors', 'stones', 'rivers', 'clouds', 'fields', 'trees', 'mangoes', 'glasses', 'coins', 'shirts', 'bells', 'drums', 'kites', 'nests', 'walls', 'boats', 'roads', 'clocks', 'gates', 'ropes', 'boxes', 'plates', 'bags'];

// A "world" is the set of non-empty Venn regions. Region r has term t when bit t of r is set.
const inT = (r: number, t: number) => ((r >> t) & 1) === 1;
function regs(T: number, pred: (r: number) => boolean): number {
  let m = 0;
  for (let r = 0; r < (1 << T); r++) if (pred(r)) m |= 1 << r;
  return m;
}
const bothMask = (T: number, a: number, b: number) => regs(T, (r) => inT(r, a) && inT(r, b));
const onlyAMask = (T: number, a: number, b: number) => regs(T, (r) => inT(r, a) && !inT(r, b));

interface Cons { forbid: number; needs: number[] }
function consOf(T: number, s: Stmt): Cons {
  const both = bothMask(T, s.a, s.b), onlyA = onlyAMask(T, s.a, s.b);
  switch (s.kind) {
    case 'all': return { forbid: onlyA, needs: [] };
    case 'no': return { forbid: both, needs: [] };
    case 'some': return { forbid: 0, needs: [both] };
    case 'somenot': return { forbid: 0, needs: [onlyA] };
    default: return { forbid: 0, needs: [both, onlyA] };
  }
}

// Every world in which all the statements are true (skip leaves one statement out).
export function models(T: number, stmts: Stmt[], skip = -1): number[] {
  const cs = stmts.filter((_, i) => i !== skip).map((s) => consOf(T, s));
  const forbid = cs.reduce((x, c) => x | c.forbid, 0);
  const needs = cs.flatMap((c) => c.needs);
  const out: number[] = [];
  const lim = 1 << (1 << T);
  for (let m = 0; m < lim; m++) {
    if ((m & forbid) !== 0) continue;
    if (needs.every((n) => (m & n) !== 0)) out.push(m);
  }
  return out;
}

const isPoss = (k: CKind) => k === 'poss-all' || k === 'poss-some';
function conclTest(T: number, c: SConcl): { mask: number; empty: boolean } {
  switch (c.kind) {
    case 'all': case 'poss-all': return { mask: onlyAMask(T, c.a, c.b), empty: true };
    case 'no': return { mask: bothMask(T, c.a, c.b), empty: true };
    case 'some': case 'poss-some': return { mask: bothMask(T, c.a, c.b), empty: false };
    default: return { mask: onlyAMask(T, c.a, c.b), empty: false };
  }
}
export function truthIn(T: number, c: SConcl, m: number): boolean {
  const t = conclTest(T, c);
  return t.empty ? (m & t.mask) === 0 : (m & t.mask) !== 0;
}
export function followsIn(T: number, c: SConcl, ms: number[]): boolean {
  if (ms.length === 0) return false;
  return isPoss(c.kind) ? ms.some((m) => truthIn(T, c, m)) : ms.every((m) => truthIn(T, c, m));
}

// 0 only I, 1 only II, 2 either, 3 neither, 4 both. -1 when the statements contradict each other.
export function verdictS(T: number, stmts: Stmt[], c1: SConcl, c2: SConcl): number {
  const ms = models(T, stmts);
  if (ms.length === 0) return -1;
  const t1 = followsIn(T, c1, ms), t2 = followsIn(T, c2, ms);
  if (t1 && t2) return 4;
  if (t1) return 0;
  if (t2) return 1;
  if (!isPoss(c1.kind) && !isPoss(c2.kind) && ms.every((m) => truthIn(T, c1, m) !== truthIn(T, c2, m))) return 2;
  return 3;
}

const stmtText = (s: Stmt, t: string[]) => {
  switch (s.kind) {
    case 'all': return 'All ' + t[s.a] + ' are ' + t[s.b] + '.';
    case 'some': return 'Some ' + t[s.a] + ' are ' + t[s.b] + '.';
    case 'no': return 'No ' + t[s.a] + ' are ' + t[s.b] + '.';
    case 'somenot': return 'Some ' + t[s.a] + ' are not ' + t[s.b] + '.';
    default: return 'Only a few ' + t[s.a] + ' are ' + t[s.b] + '.';
  }
};
export const conclText = (c: SConcl, t: string[]) => {
  switch (c.kind) {
    case 'all': return 'All ' + t[c.a] + ' are ' + t[c.b] + '.';
    case 'some': return 'Some ' + t[c.a] + ' are ' + t[c.b] + '.';
    case 'no': return 'No ' + t[c.a] + ' are ' + t[c.b] + '.';
    case 'somenot': return 'Some ' + t[c.a] + ' are not ' + t[c.b] + '.';
    case 'poss-all': return 'All ' + t[c.a] + ' being ' + t[c.b] + ' is a possibility.';
    default: return 'Some ' + t[c.a] + ' being ' + t[c.b] + ' is a possibility.';
  }
};

export function syllStem(p: SyllPuzzle): string {
  return 'Statements: ' + p.stmts.map((s) => stmtText(s, p.terms)).join(' ')
    + '  Conclusions: I. ' + conclText(p.c1, p.terms) + '  II. ' + conclText(p.c2, p.terms)
    + '  Take the statements to be true even if they disagree with commonly known facts, and decide which conclusions follow.';
}

const pop = (m: number) => { let n = 0; for (let x = m; x; x &= x - 1) n++; return n; };
function describe(T: number, terms: string[], m: number): string {
  const parts: string[] = [];
  for (let r = 0; r < (1 << T); r++) {
    if (!((m >> r) & 1)) continue;
    parts.push('some things that are ' + terms.map((t, i) => (inT(r, i) ? t : 'not ' + t)).join(', '));
  }
  return parts.length ? parts.join('; ') : 'nothing at all';
}
function smallest(ms: number[], pred: (m: number) => boolean): number | null {
  let best: number | null = null;
  for (const m of ms) if (pred(m) && (best === null || pop(m) < pop(best))) best = m;
  return best;
}

export function syllExplain(p: SyllPuzzle, withExamples = true): string {
  const T = p.terms.length;
  const ms = models(T, p.stmts);
  const parts: string[] = [];
  [p.c1, p.c2].forEach((c, i) => {
    const label = i === 0 ? 'I' : 'II';
    const text = conclText(c, p.terms).replace(/\.$/, '');
    if (!isPoss(c.kind)) {
      if (followsIn(T, c, ms)) {
        const need = p.stmts.map((_, k) => k).filter((k) => !followsIn(T, c, models(T, p.stmts, k)));
        parts.push('Conclusion ' + label + ' (' + text + ') follows: it is true in every arrangement that fits the statements'
          + (need.length ? ' (it rests on statement' + (need.length > 1 ? 's ' : ' ') + need.map((k) => k + 1).join(' and ') + ').' : '.'));
      } else {
        const m = smallest(ms, (x) => !truthIn(T, c, x));
        parts.push('Conclusion ' + label + ' (' + text + ') does not follow: it can be false'
          + (withExamples && m !== null ? ', for example if there are ' + describe(T, p.terms, m) + '.' : '.'));
      }
    } else if (followsIn(T, c, ms)) {
      const m = smallest(ms, (x) => truthIn(T, c, x));
      parts.push('Conclusion ' + label + ' (' + text + ') follows: it is possible'
        + (withExamples && m !== null ? ', for example if there are ' + describe(T, p.terms, m) + '.' : '.'));
    } else {
      parts.push('Conclusion ' + label + ' (' + text + ') does not follow: it is false in every arrangement that fits the statements.');
    }
  });
  if (p.verdict === 2) parts.push('Neither is certain, but exactly one of them is true in every arrangement, so either I or II follows.');
  const out = parts.join(' ');
  return out.length > 1150 && withExamples ? syllExplain(p, false) : out;
}

const KIND_W: SKind[] = ['all', 'all', 'all', 'all', 'some', 'some', 'some', 'no', 'somenot', 'few', 'few'];
const CONTRA: Record<string, CKind> = { some: 'no', no: 'some', all: 'somenot', somenot: 'all' };
const CKINDS: CKind[] = ['all', 'some', 'no', 'somenot', 'poss-all', 'poss-some'];

export function makeSyllogism(seed: string, target: number, opts: { terms?: number } = {}): SyllPuzzle | null {
  for (let attempt = 0; attempt < 150; attempt++) {
    const r = rng(seed + '#' + attempt);
    const T = opts.terms ?? (r() < 0.4 ? 3 : 4);
    const terms = shuffle(WORDS.slice(), r).slice(0, T);
    const stmts: Stmt[] = [];
    for (let i = 0; i + 1 < T; i++) {
      const kind = KIND_W[Math.floor(r() * KIND_W.length)];
      stmts.push(r() < 0.5 ? { kind, a: i, b: i + 1 } : { kind, a: i + 1, b: i });
    }
    if (T === 3 && r() < 0.5) stmts.push({ kind: KIND_W[Math.floor(r() * KIND_W.length)], a: 0, b: 2 });
    const ms = models(T, stmts);
    if (ms.length === 0) continue;

    const adj = new Set<string>();
    stmts.forEach((s) => { adj.add(s.a + ',' + s.b); adj.add(s.b + ',' + s.a); });
    const cands: SConcl[] = [];
    for (let a = 0; a < T; a++) for (let b = 0; b < T; b++) {
      if (a === b) continue;
      for (const kind of CKINDS) if (!stmts.some((s) => s.kind === kind && s.a === a && s.b === b)) cands.push({ kind, a, b });
    }
    const prof = new Map<number, { e: boolean; n: boolean }>();
    for (const c of cands) prof.set(conclTest(T, c).mask, { e: false, n: false });
    const plist = Array.from(prof.entries());
    for (const m of ms) for (const [k, p] of plist) { if ((m & k) === 0) p.e = true; else p.n = true; }
    const follows = (c: SConcl) => {
      const t = conclTest(T, c), p = prof.get(t.mask) as { e: boolean; n: boolean };
      return isPoss(c.kind) ? (t.empty ? p.e : p.n) : (t.empty ? !p.n : !p.e);
    };
    const F: SConcl[] = [], N: SConcl[] = [];
    for (const c of cands) (follows(c) ? F : N).push(c);
    const Fhard = F.filter((c) => !adj.has(c.a + ',' + c.b));
    const pickF = (): SConcl | null => { const l = Fhard.length ? Fhard : F; return l.length ? l[Math.floor(r() * l.length)] : null; };
    const pickN = (plain = false): SConcl | null => { const l = plain ? N.filter((c) => !isPoss(c.kind)) : N; return l.length ? l[Math.floor(r() * l.length)] : null; };

    for (let k = 0; k < 30; k++) {
      let c1: SConcl | null, c2: SConcl | null;
      if (target === 4) { c1 = pickF(); c2 = pickF(); }
      else if (target === 0) { c1 = pickF(); c2 = pickN(); }
      else if (target === 1) { c1 = pickN(); c2 = pickF(); }
      else if (target === 3) { c1 = pickN(); c2 = pickN(); }
      else { c1 = pickN(true); c2 = c1 ? { kind: CONTRA[c1.kind], a: c1.a, b: c1.b } : null; }
      if (!c1 || !c2) continue;
      if (c1.kind === c2.kind && c1.a === c2.a && c1.b === c2.b) continue;
      if (verdictS(T, stmts, c1, c2) === target) return { terms, stmts, c1, c2, verdict: target };
    }
  }
  return null;
}
