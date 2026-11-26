import { SYLL_LABELS, makeSyllogism, models, syllExplain, syllStem, verdictS, type SKind, type Stmt } from '../lib/qb/choice/syllogism';
import { validateFixed } from '../lib/qb/fixed';

const results: [string, boolean][] = [];
const check = (n: string, ok: boolean) => { results.push([n, ok]); };
const S = (kind: SKind, a: number, b: number): Stmt => ({ kind, a, b });

// Three syllogism sets from a real exam paper (terms: indexes 0..3)
check('exam set: only a few digital are network ... gives only I',
  verdictS(4, [S('few', 0, 1), S('all', 1, 2), S('all', 2, 3)], { kind: 'some', a: 0, b: 2 }, { kind: 'poss-all', a: 0, b: 1 }) === 0);
check('exam set: only a few hut is house ... gives only II',
  verdictS(4, [S('few', 0, 1), S('some', 1, 2), S('no', 2, 3)], { kind: 'no', a: 0, b: 3 }, { kind: 'somenot', a: 1, b: 3 }) === 1);
check('exam set: some glue is not paper ... gives either',
  verdictS(4, [S('somenot', 0, 1), S('few', 1, 2), S('all', 2, 3)], { kind: 'no', a: 0, b: 3 }, { kind: 'some', a: 0, b: 3 }) === 2);
// The fourth set, as printed, does not follow (a one-thing world satisfies every statement).
const q26 = [S('all', 0, 1), S('some', 1, 2), S('all', 2, 3)];
check('exam set 26: "some completed are not difficult" is not certain, so the printed key (both) cannot be derived',
  verdictS(4, q26, { kind: 'somenot', a: 0, b: 2 }, { kind: 'poss-all', a: 3, b: 1 }) === 1);

// Contradictories, and pairs that are not
const base = [S('all', 0, 1)];
check('some and no on one pair are contradictories', verdictS(3, [S('some', 1, 2)], { kind: 'some', a: 0, b: 2 }, { kind: 'no', a: 0, b: 2 }) === 2);
check('some and some-not are not contradictories', verdictS(3, base, { kind: 'some', a: 0, b: 2 }, { kind: 'somenot', a: 0, b: 2 }) === 3);

// The mask solver against a set-based one written separately
const inT = (r: number, t: number) => ((r >> t) & 1) === 1;
function semantic(kind: SKind, a: number, b: number, w: number[]): boolean {
  const A = w.filter((r) => inT(r, a)), AB = A.filter((r) => inT(r, b)), AnB = A.filter((r) => !inT(r, b));
  return kind === 'all' ? AnB.length === 0 : kind === 'no' ? AB.length === 0 : kind === 'some' ? AB.length > 0 : kind === 'somenot' ? AnB.length > 0 : AB.length > 0 && AnB.length > 0;
}
let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const KINDS: SKind[] = ['all', 'some', 'no', 'somenot', 'few'];
let agree = true;
for (let i = 0; i < 8 && agree; i++) {
  const T = i < 4 ? 3 : 4;
  const stmts: Stmt[] = [];
  for (let k = 0; k < 3; k++) { const a = Math.floor(rnd() * T); let b = Math.floor(rnd() * T); if (b === a) b = (a + 1) % T; stmts.push(S(KINDS[Math.floor(rnd() * 5)], a, b)); }
  const fast = new Set(models(T, stmts));
  const lim = 1 << (1 << T);
  for (let m = 0; m < lim && agree; m++) {
    const w: number[] = []; for (let r = 0; r < (1 << T); r++) if ((m >> r) & 1) w.push(r);
    const slow = stmts.every((s) => semantic(s.kind, s.a, s.b, w));
    if (slow !== fast.has(m)) agree = false;
  }
}
check('the mask solver agrees with the set-based solver on 8 random statement sets', agree);

// Generated puzzles
for (let t = 0; t < 5; t++) {
  let ok = true, msg = '';
  for (let i = 0; i < 5 && ok; i++) {
    const p = makeSyllogism('check-s' + t + '-' + i, t);
    if (!p) { ok = false; msg = 'could not be made'; break; }
    if (verdictS(p.terms.length, p.stmts, p.c1, p.c2) !== t || p.verdict !== t) { ok = false; msg = 'wrong verdict'; break; }
    const bad = validateFixed({ text: syllStem(p), options: SYLL_LABELS, correctIndex: p.verdict, explanation: syllExplain(p), ordered: true });
    if (bad.length) { ok = false; msg = bad[0]; }
  }
  check('syllogism puzzles for "' + SYLL_LABELS[t] + '" are correct and well formed' + (msg ? ' (' + msg + ')' : ''), ok);
}

let failed = 0;
for (const [n, pass] of results) { if (!pass) failed++; console.log((pass ? 'PASS' : 'FAIL') + '  ' + n); }
console.log('\n' + (results.length - failed) + ' of ' + results.length + ' cases passed.');
if (failed > 0) process.exit(1);
