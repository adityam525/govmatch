import { avgMalesAnswer, dqOptions, diffAnswer, makeTable, newShopFemales, pctMoreAnswer, profitAnswer, tableStem, type Shop } from '../lib/qb/data/table';
import { validateFixed } from '../lib/qb/fixed';
import { rng } from '../lib/qb/random';

const results: [string, boolean][] = [];
const check = (n: string, ok: boolean) => { results.push([n, ok]); };

// The table from a real exam paper: totals 480, 560, 320, 750; females 75, 60, 45, 80 percent.
const paper: Shop[] = [
  { name: 'A', total: 480, pct: 75 }, { name: 'B', total: 560, pct: 60 },
  { name: 'C', total: 320, pct: 45 }, { name: 'D', total: 750, pct: 80 },
];
check('exam answer: males in A and C minus females in B and D is 640', diffAnswer(paper, [0, 2, 1, 3]) === 640);
check('exam answer: females in A are 140 percent more than males in D', pctMoreAnswer(paper, 0, 3) === 140);
check('exam answer: shop C overall profit is 2320', profitAnswer(paper, 2, 20, 25, 50) === 2320);
check('exam answer: shop E sold 25 percent more than C and 60 percent of it to females gives 240', newShopFemales(paper, 2, 25, 60) === 240);
check('average of males in A, C and D is a whole number only when it should be', Number.isInteger(avgMalesAnswer(paper, [0, 2, 3])) === ((120 + 176 + 150) % 3 === 0));

// Independent arithmetic for every generated question
const fem = (S: Shop[], i: number) => (S[i].total * S[i].pct) / 100;
const mal = (S: Shop[], i: number) => (S[i].total * (100 - S[i].pct)) / 100;
let ok = true, msg = '', made = 0, kinds = new Set<string>();
for (let i = 0; i < 12 && ok; i++) {
  const ds = makeTable('check-table-' + i);
  if (!ds) { ok = false; msg = 'a scenario could not be made'; break; }
  const S = ds.shops;
  for (const q of ds.questions) {
    made++; kinds.add(q.kind);
    let want = NaN;
    const a = q.args;
    if (q.kind === 'diff') want = Math.abs(mal(S, a[0]) + mal(S, a[1]) - fem(S, a[2]) - fem(S, a[3]));
    else if (q.kind === 'pct') want = ((fem(S, a[0]) - mal(S, a[1])) / mal(S, a[1])) * 100;
    else if (q.kind === 'avg') want = (mal(S, a[0]) + mal(S, a[1]) + mal(S, a[2])) / 3;
    else if (q.kind === 'profit') want = (mal(S, a[0]) * a[1] * a[2]) / 100 + (fem(S, a[0]) * a[1] * a[3]) / 100;
    else if (q.kind === 'newshop') want = (((S[a[0]].total * (100 + a[1])) / 100) * a[2]) / 100;
    if (Math.abs(want - q.answer) > 1e-9) { ok = false; msg = q.kind + ' answer is ' + q.answer + ' but the check gets ' + want; break; }
    const o = dqOptions(q, rng('opt-' + i + q.kind));
    if (!o) { ok = false; msg = q.kind + ': options could not be built'; break; }
    if (o.options.length !== 5 || new Set(o.options).size !== 5) { ok = false; msg = q.kind + ': options are not five different ones'; break; }
    if (o.options[o.correctIndex] !== String(q.answer) + (q.percent ? '%' : '')) { ok = false; msg = q.kind + ': the marked option is not the answer'; break; }
    const bad = validateFixed({ text: tableStem(ds) + ' ' + q.text, options: o.options, correctIndex: o.correctIndex, explanation: q.explanation });
    if (bad.length) { ok = false; msg = q.kind + ': ' + bad[0]; break; }
  }
}
check('12 generated scenarios (' + made + ' questions) are correct and well formed' + (msg ? ' (' + msg + ')' : ''), ok);
check('all five question kinds appear', kinds.size === 5);

let failed = 0;
for (const [n, pass] of results) { if (!pass) failed++; console.log((pass ? 'PASS' : 'FAIL') + '  ' + n); }
console.log('\n' + (results.length - failed) + ' of ' + results.length + ' cases passed.');
if (failed > 0) process.exit(1);
