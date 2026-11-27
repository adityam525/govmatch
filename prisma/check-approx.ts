import { approxText, makeApprox } from '../lib/qb/series/approx';
import { validateFixed } from '../lib/qb/fixed';

const results: [string, boolean][] = [];
const check = (n: string, ok: boolean) => { results.push([n, ok]); };

// Solves a printed expression for ?, straight from the text, with no help from the generator.
function solve(expr: string): number | null {
  const parts = expr.split(' = ');
  if (parts.length !== 2) return null;
  const js = (s: string) => s
    .replace(/(\d+(?:\.\d+)?)\/(\d+) of (\d+(?:\.\d+)?)/g, '(($1/$2)*$3)')
    .replace(/(\d+(?:\.\d+)?)% of (\d+(?:\.\d+)?)/g, '(($1/100)*$2)')
    .replace(/\u221a(\d+(?:\.\d+)?)/g, 'Math.sqrt($1)')
    .replace(/\u221b(\d+(?:\.\d+)?)/g, 'Math.cbrt($1)')
    .replace(/\((\d+(?:\.\d+)?)\)\u00b2/g, 'Math.pow($1,2)')
    .replace(/\(\?\)\u00b2/g, 'Math.pow(q,2)')
    .replace(/\u00d7/g, '*')
    .replace(/\?/g, 'q');
  try {
    const L = new Function('q', 'return ' + js(parts[0])) as (q: number) => number;
    const R = new Function('q', 'return ' + js(parts[1])) as (q: number) => number;
    const f = (q: number) => L(q) - R(q);
    let lo = 0.001, hi = 100000;
    if (!(f(lo) * f(hi) < 0)) return null;
    for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (f(lo) * f(mid) <= 0) hi = mid; else lo = mid; }
    return (lo + hi) / 2;
  } catch { return null; }
}
const nearest = (opts: number[], v: number) => opts.reduce((b, o, j) => (Math.abs(o - v) < Math.abs(opts[b] - v) ? j : b), 0);

// The six approximation questions of a real exam paper, with their options and keys.
const exam: [string, number[], number][] = [
  ['59.99% of 800 - 12.01% of 900.1 = ? + 4/7 of 91.01', [461, 320, 142, 280, 456], 1],
  ['? + 247.01 - 156.09 = (17.01)\u00b2 + 15.01% of 79.99', [200, 275, 250, 210, 260], 3],
  ['\u221a1443.98 + (16.02)\u00b2 = 6 \u00d7 (?)\u00b2', [12, 8, 7, 11, 14], 2],
  ['32.04% of 1499.98 - 70.01% of 600.01 + 2.99 \u00d7 7.01 = (?)\u00b2', [5, 14, 7, 11, 9], 4],
  ['2079.001 / ? = \u221b1331.01 - 35.01 \u00d7 11.99 + 639.99', [9, 13, 7, 15, 12], 0],
  ['?/3 + 171.01 + 156.99 = 321.09 + 249.01 - 97.99', [468, 432, 420, 480, 456], 1],
];
exam.forEach(([expr, opts, key], i) => {
  const v = solve(expr);
  check('exam approximation ' + (i + 1) + ' gives ' + opts[key], v !== null && nearest(opts, v) === key);
});

let ok = true, msg = '';
const forms = new Set<number>();
for (let i = 0; i < 60 && ok; i++) {
  const q = makeApprox('check-approx-' + i, i % 6);
  if (!q) { ok = false; msg = 'form ' + ((i % 6) + 1) + ' could not be made'; break; }
  forms.add(q.form);
  const v = solve(q.expr);
  if (v === null) { ok = false; msg = 'could not solve ' + q.expr; break; }
  if (Math.abs(v - q.ans) > 0.9) { ok = false; msg = q.expr + ' solves to ' + v.toFixed(2) + ' but the marked answer is ' + q.ans; break; }
  if (q.options.length !== 5 || new Set(q.options).size !== 5) { ok = false; msg = 'options are not five different ones'; break; }
  if (nearest(q.options.map(Number), v) !== q.correctIndex) { ok = false; msg = 'the marked option is not the nearest to ' + v.toFixed(2); break; }
  const bad = validateFixed({ text: approxText(q), options: q.options, correctIndex: q.correctIndex, explanation: q.explanation });
  if (bad.length) { ok = false; msg = bad[0]; break; }
}
check('60 generated approximation questions are correct and well formed' + (msg ? ' (' + msg + ')' : ''), ok);
check('all six forms appear', forms.size === 6);

let failed = 0;
for (const [n, pass] of results) { if (!pass) failed++; console.log((pass ? 'PASS' : 'FAIL') + '  ' + n); }
console.log('\n' + (results.length - failed) + ' of ' + results.length + ' cases passed.');
if (failed > 0) process.exit(1);
