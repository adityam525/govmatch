import { shuffleFixed, validateFixed } from '../lib/qb/fixed';
import { coerceDefinition } from '../lib/qb/template-input';
import { LABELS, classify, makeQuadratic, rootsFromCoeffs, type Coeffs } from '../lib/qb/choice/quadratic';
import {
  VERDICT_LABELS, buildGraph, complementary, holds, ineqExplain, ineqStem, makeIneq, parseChain, parseConcl, verdictOf,
  type IneqPuzzle, type Op,
} from '../lib/qb/choice/inequality';

const results: [string, boolean][] = [];
const check = (n: string, ok: boolean) => { results.push([n, ok]); };

// Five options and the ordered flag
const five = { text: 'Which relation holds between x and y?', options: ['a1', 'a2', 'a3', 'a4', 'a5'], correctIndex: 4, explanation: 'Because of the working shown here.' };
check('five options are accepted', validateFixed(five).length === 0);
check('six options are refused', validateFixed({ ...five, options: [...five.options, 'a6'] }).length > 0);
check('an answer pointing past the options is refused', validateFixed({ ...five, options: five.options.slice(0, 4) }).length > 0);
check('an ordered question is not shuffled', JSON.stringify(shuffleFixed({ ...five, ordered: true }, () => 0.3).options) === JSON.stringify(five.options));
check('an unordered five-option question keeps its answer when shuffled', (() => { const q = shuffleFixed(five, () => 0.3); return q.options[q.correctIndex] === 'a5'; })());
check('the editor save path keeps the ordered flag', (() => { const d: any = coerceDefinition({ fixed: { ...five, ordered: true } }); return d.def?.fixed?.ordered === true && d.def.fixed.options.length === 5; })());

// Quadratics: the five equation pairs of the exam paper
const q = (a: number, b: number, c: number): Coeffs => ({ a, b, c });
const paper: [Coeffs, Coeffs, number, string][] = [
  [q(1, 11, 24), q(4, 13, 10), 2, 'x < y'],
  [q(1, -7, -60), q(1, 13, 40), 1, 'x >= y'],
  [q(1, 1, -12), q(1, 2, -15), 4, 'no relation'],
  [q(2, 13, 21), q(1, 6, 9), 3, 'x <= y'],
  [q(1, 12, 35), q(1, 7, 10), 3, 'x <= y'],
];
paper.forEach(([x, y, want, name], i) => {
  const rx = rootsFromCoeffs(x.a, x.b, x.c), ry = rootsFromCoeffs(y.a, y.b, y.c);
  check('exam equation pair ' + (i + 1) + ' gives ' + name, !!rx && !!ry && classify(rx, ry) === want);
});
for (let t = 0; t < 5; t++) {
  let ok = true, msg = '';
  for (let i = 0; i < 8 && ok; i++) {
    const p = makeQuadratic('check-q' + t + '-' + i, t);
    if (!p) { ok = false; msg = 'could not be made'; break; }
    const rx = rootsFromCoeffs(p.x.a, p.x.b, p.x.c), ry = rootsFromCoeffs(p.y.a, p.y.b, p.y.c);
    if (!rx || !ry || classify(rx, ry) !== t || p.correctIndex !== t) { ok = false; msg = 'answer disagrees with the equations'; break; }
    const bad = validateFixed({ text: p.text, options: p.options, correctIndex: p.correctIndex, explanation: p.explanation, ordered: true });
    if (bad.length) { ok = false; msg = bad[0]; }
  }
  check('quadratic puzzles for answer ' + (t + 1) + ' (' + LABELS[t].length + ' chars) are correct and well formed' + (msg ? ' (' + msg + ')' : ''), ok);
}

// Inequalities: the exam sets, then the solver against brute force
const run = (stmts: string[], c1: string, c2: string) => verdictOf(buildGraph(stmts.map(parseChain)), parseConcl(c1), parseConcl(c2));
check('exam inequality set 1 gives only I', run(['W > T > K >= J', 'S >= M > K < D'], 'J < S', 'D > W') === 0);
check('exam inequality set 3 gives both', run(['X >= Z > L', 'P <= F = G', 'Y <= T = L <= P'], 'X > T', 'Y <= G') === 4);
check('exam inequality set 2, as printed, gives only I (the printed key says neither)', run(['G > R >= N < A = O >= X = C > P >= U'], 'A >= U', 'X < G') === 0);
check('exact opposites are recognised', complementary(parseConcl('A > B'), parseConcl('B >= A')) && !complementary(parseConcl('A >= B'), parseConcl('A > B')));
check('opposites that are both uncertain give either', run(['A >= B'], 'A > B', 'A <= B') === 2);

const test = (op: Op, a: number, b: number) => (op === '>' ? a > b : op === '>=' ? a >= b : op === '<' ? a < b : op === '<=' ? a <= b : a === b);
function brute(p: IneqPuzzle) {
  const names = Array.from(new Set(p.chains.flatMap((c) => c.letters)));
  const idx: Record<string, number> = {};
  names.forEach((n, i) => { idx[n] = i; });
  const cons = p.chains.flatMap((c) => c.ops.map((op, i) => ({ a: c.letters[i], op, b: c.letters[i + 1] })));
  const byLevel: typeof cons[] = names.map(() => []);
  cons.forEach((c) => byLevel[Math.max(idx[c.a], idx[c.b])].push(c));
  const val: Record<string, number> = {};
  let models = 0, all1 = true, all2 = true;
  const K = names.length;
  const rec = (i: number) => {
    if (i === names.length) {
      models++;
      if (!test(p.c1.op, val[p.c1.a], val[p.c1.b])) all1 = false;
      if (!test(p.c2.op, val[p.c2.a], val[p.c2.b])) all2 = false;
      return;
    }
    for (let v = 0; v < K; v++) {
      val[names[i]] = v;
      if (byLevel[i].every((c) => test(c.op, val[c.a], val[c.b]))) rec(i + 1);
    }
  };
  rec(0);
  return { models, all1, all2 };
}
for (let t = 0; t < 5; t++) {
  let ok = true, msg = '';
  for (let i = 0; i < 3 && ok; i++) {
    const p = makeIneq('check-i' + t + '-' + i, t, { nA: 4, nB: 4, shared: 1 });
    if (!p) { ok = false; msg = 'could not be made'; break; }
    const g = buildGraph(p.chains);
    const b = brute(p);
    if (b.models === 0) { ok = false; msg = 'the statements contradict each other'; break; }
    if (b.all1 !== holds(g, p.c1) || b.all2 !== holds(g, p.c2)) { ok = false; msg = 'solver disagrees with brute force'; break; }
    if (verdictOf(g, p.c1, p.c2) !== t || p.verdict !== t) { ok = false; msg = 'wrong verdict'; break; }
    const bad = validateFixed({ text: ineqStem(p), options: VERDICT_LABELS, correctIndex: p.verdict, explanation: ineqExplain(p), ordered: true });
    if (bad.length) { ok = false; msg = bad[0]; }
  }
  check('inequality puzzles for "' + VERDICT_LABELS[t] + '" match a brute-force check' + (msg ? ' (' + msg + ')' : ''), ok);
}

let failed = 0;
for (const [n, pass] of results) { if (!pass) failed++; console.log((pass ? 'PASS' : 'FAIL') + '  ' + n); }
console.log('\n' + (results.length - failed) + ' of ' + results.length + ' cases passed.');
console.log('NOTE: the paper key for inequality set 2 (neither) disagrees with the chain as printed (A > U, so I is true).');
if (failed > 0) process.exit(1);
