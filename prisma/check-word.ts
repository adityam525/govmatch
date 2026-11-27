import { FAMILIES, makeWord, solveWord, type Family, type Params } from '../lib/qb/word/word';
import { validateFixed } from '../lib/qb/fixed';

const results: [string, boolean][] = [];
const check = (n: string, ok: boolean) => { results.push([n, ok]); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;

// The word problems of a real exam paper, as their printed numbers, with the key
const exam: [string, Family, Params, number][] = [
  ['boat: still 14.4, ratio 3:1, 216 km downstream is 10 hours', 'boat', { u10: 144, m: 3, n: 1, D: 216, down: 1 }, 10],
  ['work: A+B 18 days, B 45 days, 50% by A in (X+10) days gives X = 5', 'work', { Tab: 18, Tb: 45, f: 50, c: 10 }, 5],
  ['profit: CP:SP 20:27, MP 4500, discount 25% gives 875', 'profit', { MP: 4500, d: 25, a: 20, b: 27 }, 875],
  ['ages: Akash six years ago was 18', 'ages', { k: 2, h: 1, p: 25, d: 18, z: 6 }, 18],
  ['trains: B crosses a 400 m platform in 16 seconds', 'trains', { vA: 90, p: 25, tA: 12, T: 36, L: 400 }, 16],
  ['mixture: initial water is 6 litres', 'mixture', { m: 4, n: 1, R: 20, M: 5, m2: 13, n2: 2 }, 6],
  ['simple then compound interest: 656.25', 'sici', { I: 525, r: 10, E: 500 }, 656.25],
  ['partnership: B invested for 4 months', 'partner', { Ia: 4500, Ib: 6000, Pt: 2600, S: 800 }, 4],
];
for (const [name, fam, p, key] of exam) check('exam answer, ' + name, near(solveWord(fam, p), key));

let ok = true, msg = '', made = 0;
const seen = new Set<string>();
for (const fam of FAMILIES) {
  for (let i = 0; i < 25 && ok; i++) {
    const q = makeWord('check-' + fam + '-' + i, fam);
    if (!q) { ok = false; msg = fam + ' could not be made'; break; }
    made++; seen.add(fam);
    const back = solveWord(fam, q.params);
    if (!near(back, q.answer)) { ok = false; msg = fam + ': built answer ' + q.answer + ' but the printed numbers give ' + back; break; }
    if (!(q.answer > 0)) { ok = false; msg = fam + ': non-positive answer'; break; }
    if (q.options.length !== 5 || new Set(q.options).size !== 5) { ok = false; msg = fam + ': options are not five different ones'; break; }
    if (!near(parseFloat(q.options[q.correctIndex]), q.answer)) { ok = false; msg = fam + ': the marked option is not the answer'; break; }
    const bad = validateFixed({ text: q.text, options: q.options, correctIndex: q.correctIndex, explanation: q.explanation });
    if (bad.length) { ok = false; msg = fam + ': ' + bad[0]; break; }
  }
}
check(made + ' generated word problems are correct and well formed' + (msg ? ' (' + msg + ')' : ''), ok);
check('all eight families appear', seen.size === 8);

let failed = 0;
for (const [n, pass] of results) { if (!pass) failed++; console.log((pass ? 'PASS' : 'FAIL') + '  ' + n); }
console.log('\n' + (results.length - failed) + ' of ' + results.length + ' cases passed.');
if (failed > 0) process.exit(1);
