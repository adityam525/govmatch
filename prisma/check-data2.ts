import { pieFrom, pAvgMales, pRatioNums, pFemPctOfTotal, pNewMalesPct, pDiff, makePie, pieQuestions, pieStem } from '../lib/qb/data/pie';
import { caseletFrom, cTotal, cFemPctOfA, cMalePct, caseletQuestions, caseletStem, makeCaselet } from '../lib/qb/data/caselet';
import { gcd, type DQ2 } from '../lib/qb/data/opts';
import { validateFixed } from '../lib/qb/fixed';

const results: [string, boolean][] = [];
const check = (n: string, ok: boolean) => { results.push([n, ok]); };

// Pie charts from a real exam paper: 2000 students, females 130, X, 220, 150 out of 800.
const pp = pieFrom(2000, [30.5, 25, 12.5, 32], [130, 300, 220, 150], 1);
check('the exam pie data is accepted', !!pp);
if (pp) {
  check('exam answer: average males in B, C and D is 240', pAvgMales(pp, [1, 2, 3]) === 240);
  const [a, b] = pRatioNums(pp, [2, 3], [0, 2]);
  check('exam answer: males in C and D to females in A and C is 52:35', a / gcd(a, b) === 52 && b / gcd(a, b) === 35);
  check('exam answer: females in C and B are 81.25 percent of students in D', pFemPctOfTotal(pp, [2, 1], 3) === 81.25);
  check('exam answer: males in E (3X, 35 percent females) are 17 percent more than students in B', pNewMalesPct(pp, 3, 35, 1) === 17);
  check('exam answer: students in A and B minus twice the males in B is 710', pDiff(pp, 0, 1, 1) === 710);
}
// Caselet from the same paper
const cl = caseletFrom('buses', 'seats', 40, 6, 6, 50, 50, 10, 7);
check('the exam caselet is accepted', !!cl);
if (cl) {
  check('exam answer: total seats in A and B is 94', cTotal(cl) === 94);
  check('exam answer: females in both are 87.5 percent of the seats in A', cFemPctOfA(cl) === 87.5);
  check('exam answer: occupied in B to vacant in both is 17:3', cl.oB / gcd(cl.oB, cl.vA + cl.vB) === 17 && (cl.vA + cl.vB) / gcd(cl.oB, cl.vA + cl.vB) === 3);
  check('males in both buses are 50 of the 85 occupied', cl.mA + cl.mB === 50 && cl.oA + cl.oB === 85 && Math.abs(cMalePct(cl) - 58.82) < 0.01);
}

function wellFormed(q: DQ2, stem: string): string {
  if (q.options.length !== 5 || new Set(q.options).size !== 5) return 'options are not five different ones';
  const marked = q.options[q.correctIndex];
  const ok = q.ratio ? marked === q.ratio : Math.abs(parseFloat(marked) - q.answer) < 0.006;
  if (!ok) return 'the marked option (' + marked + ') is not the answer';
  const bad = validateFixed({ text: stem + ' ' + q.text, options: q.options, correctIndex: q.correctIndex, explanation: q.explanation });
  return bad.length ? bad[0] : '';
}

let ok = true, msg = '', made = 0;
const kinds = new Set<string>();
for (let i = 0; i < 10 && ok; i++) {
  const p = makePie('check-pie-' + i);
  if (!p) { ok = false; msg = 'a pie scenario could not be made'; break; }
  for (const q of pieQuestions(p, 'qp' + i)) {
    made++; kinds.add(q.kind);
    let want = NaN;
    const x = q.args;
    const mal = (k: number) => p.tot[k] - p.fem[k];
    if (q.kind === 'avg') want = x.reduce((n, k) => n + mal(k), 0) / x.length;
    else if (q.kind === 'ratio') { const n = mal(x[0]) + mal(x[1]), d = p.fem[x[2]] + p.fem[x[3]]; want = n / d; }
    else if (q.kind === 'pct') want = ((p.fem[x[0]] + p.fem[x[1]]) * 100) / p.tot[x[2]];
    else if (q.kind === 'new') want = (Math.abs((x[0] * p.fem[p.hidden] * (100 - x[1])) / 100 - p.tot[x[2]]) * 100) / p.tot[x[2]];
    else if (q.kind === 'diff') want = Math.abs(p.tot[x[0]] + p.tot[x[1]] - 2 * mal(x[2]));
    if (Math.abs(want - q.answer) > 1e-9) { ok = false; msg = 'pie ' + q.kind + ' answer is ' + q.answer + ' but the check gets ' + want; break; }
    const w = wellFormed(q, pieStem(p));
    if (w) { ok = false; msg = 'pie ' + q.kind + ': ' + w; break; }
  }
}
check('10 generated pie scenarios (' + made + ' questions) are correct and well formed' + (msg ? ' (' + msg + ')' : ''), ok);
check('all five pie question kinds appear', kinds.size === 5);

ok = true; msg = ''; made = 0;
const ck = new Set<string>();
for (let i = 0; i < 10 && ok; i++) {
  const c = makeCaselet('check-caselet-' + i);
  if (!c) { ok = false; msg = 'a caselet could not be made'; break; }
  if (c.oA !== c.mA + c.fA || c.oB !== c.mB + c.fB || c.tB !== c.oB + c.vB || c.mA - c.fA !== c.d) { ok = false; msg = 'the caselet numbers do not add up'; break; }
  for (const q of caseletQuestions(c, 'qc' + i)) {
    made++; ck.add(q.kind);
    let want = NaN;
    if (q.kind === 'total') want = c.tA + c.oB + c.vB;
    else if (q.kind === 'fempct') want = ((c.fA + c.fB) / c.tA) * 100;
    else if (q.kind === 'ratio') want = c.oB / (c.vA + c.vB);
    else if (q.kind === 'malepct') want = ((c.mA + c.mB) / (c.oA + c.oB)) * 100;
    else if (q.kind === 'diff') want = Math.abs(c.mB - c.fA);
    if (Math.abs(want - q.answer) > 1e-9) { ok = false; msg = 'caselet ' + q.kind + ' answer is ' + q.answer + ' but the check gets ' + want; break; }
    const w = wellFormed(q, caseletStem(c));
    if (w) { ok = false; msg = 'caselet ' + q.kind + ': ' + w; break; }
  }
}
check('10 generated caselets (' + made + ' questions) are correct and well formed' + (msg ? ' (' + msg + ')' : ''), ok);
check('at least four caselet question kinds appear', ck.size >= 4);

let failed = 0;
for (const [n, pass] of results) { if (!pass) failed++; console.log((pass ? 'PASS' : 'FAIL') + '  ' + n); }
console.log('\n' + (results.length - failed) + ' of ' + results.length + ' cases passed.');
if (failed > 0) process.exit(1);
