import { PRIMES, ambiguous, buildSeries, makeSeries, seriesExplain, seriesOptions, seriesStem, validTerms, type Spec } from '../lib/qb/series/series';
import { validateFixed } from '../lib/qb/fixed';
import { rng } from '../lib/qb/random';

const results: [string, boolean][] = [];
const check = (n: string, ok: boolean) => { results.push([n, ok]); };
const same = (a: number[], b: number[]) => a.length === b.length && a.every((x, i) => Math.abs(x - b[i]) < 1e-9);

// The five number series of a real exam paper, rebuilt from their rules.
check('exam series 157, ?, 171, 150, 185, 164 gives 136', (() => { const t = buildSeries({ type: 'interleave', a: 157, d: 14, b: 136, e: 14 }).terms; return same(t, [157, 136, 171, 150, 185, 164]) && !ambiguous(t, 1); })());
check('exam series 1.8, 9, 36, 108, ?, 216 gives 216', same(buildSeries({ type: 'decmul', s: 1.8, M: 5 }).terms, [1.8, 9, 36, 108, 216, 216]));
check('exam series 4, ?, 39, 103, 228, 444 gives 12', (() => { const t = buildSeries({ type: 'diffpow', s: 4, p: 3, k0: 2, sign: 1 }).terms; return same(t, [4, 12, 39, 103, 228, 444]) && !ambiguous(t, 1); })());
check('exam series 6, 7, 16, 51, 208, ? gives 1045', (() => { const t = buildSeries({ type: 'muladd', s: 6, pat: 0 }).terms; return same(t, [6, 7, 16, 51, 208, 1045]) && !ambiguous(t, 5); })());
check('exam series 224, 207, 188, 165, 136, ? gives 105', (() => { const t = buildSeries({ type: 'diffprime', s: 224, first: PRIMES.indexOf(17), sign: -1 }).terms; return same(t, [224, 207, 188, 165, 136, 105]) && !ambiguous(t, 5); })());

// The ambiguity filter really does catch a series that fits another rule
check('a plain arithmetic series is not ambiguous', !ambiguous([5, 8, 11, 14, 17, 20], 3));
check('a series that fits a straight line but hides a different number is ambiguous', ambiguous([5, 8, 11, 99, 17, 20], 3));

// Second, separate way of working out each family
function again(sp: Spec): number[] {
  const idx = [0, 1, 2, 3, 4, 5];
  if (sp.type === 'diffpow') return idx.map((n) => sp.s + sp.sign * idx.slice(0, n).reduce((acc, i) => acc + Math.pow(sp.k0 + i, sp.p), 0));
  if (sp.type === 'diffprime') return idx.map((n) => sp.s + sp.sign * PRIMES.slice(sp.first, sp.first + n).reduce((acc, x) => acc + x, 0));
  if (sp.type === 'interleave') return idx.map((n) => (n % 2 === 0 ? sp.a + (n / 2) * sp.d : sp.b + ((n - 1) / 2) * sp.e));
  const out: number[] = [sp.type === 'linrec' || sp.type === 'altop' || sp.type === 'decmul' || sp.type === 'muladd' ? sp.s : 0];
  for (let i = 0; i < 5; i++) {
    const x = out[i], k = i + 1;
    if (sp.type === 'muladd') out.push(sp.pat === 0 ? k * x + k : sp.pat === 1 ? k * x - k : sp.pat === 2 ? 2 * x + k : k * x + k * k);
    else if (sp.type === 'decmul') out.push(x * (sp.M - i));
    else if (sp.type === 'altop') out.push(k % 2 === 1 ? x + sp.p : x * sp.q);
    else if (sp.type === 'linrec') out.push(sp.m * x + sp.a);
  }
  return out;
}

let ok = true, msg = '';
const seen = new Set<string>();
for (let i = 0; i < 80 && ok; i++) {
  const q = makeSeries('check-series-' + i);
  if (!q) { ok = false; msg = 'a series could not be made'; break; }
  seen.add(q.spec.type);
  if (!validTerms(q.terms)) { ok = false; msg = 'terms are not whole numbers from 1 to 200000'; break; }
  if (!same(q.terms, again(q.spec))) { ok = false; msg = q.spec.type + ' disagrees with the second calculation'; break; }
  if (ambiguous(q.terms, q.h)) { ok = false; msg = 'an ambiguous series got through'; break; }
  const o = seriesOptions(q, rng('opt-' + i));
  if (!o || o.options.length !== 5 || new Set(o.options).size !== 5) { ok = false; msg = 'options are not five different ones'; break; }
  if (o.options[o.correctIndex] !== String(q.terms[q.h])) { ok = false; msg = 'the marked option is not the answer'; break; }
  const bad = validateFixed({ text: seriesStem(q), options: o.options, correctIndex: o.correctIndex, explanation: seriesExplain(q) });
  if (bad.length) { ok = false; msg = bad[0]; break; }
}
check('80 generated series are correct, unambiguous and well formed' + (msg ? ' (' + msg + ')' : ''), ok);
check('all seven families appear', seen.size === 7);

let failed = 0;
for (const [n, pass] of results) { if (!pass) failed++; console.log((pass ? 'PASS' : 'FAIL') + '  ' + n); }
console.log('\n' + (results.length - failed) + ' of ' + results.length + ' cases passed.');
if (failed > 0) process.exit(1);
