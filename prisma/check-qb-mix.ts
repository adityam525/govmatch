import { DEFAULT_MIX, rebalance, type Level, type Mix } from '../lib/qb/mix';

const results: [string, boolean][] = [];
const check = (n: string, ok: boolean) => { results.push([n, ok]); };
const sum = (m: Mix) => m.EASY + m.MEDIUM + m.HARD;

let s = rebalance(DEFAULT_MIX, 'EASY', 0, []);
check('setting Easy to 0 shares it between Medium and Hard', s.mix.EASY === 0 && s.mix.MEDIUM === 50 && s.mix.HARD === 50);
s = rebalance(s.mix, 'MEDIUM', 30, s.touched);
check('then Medium to 30 moves only the untouched Hard', s.mix.EASY === 0 && s.mix.MEDIUM === 30 && s.mix.HARD === 70);
s = rebalance(s.mix, 'HARD', 20, s.touched);
check('then Hard to 20 moves the one edited first (Easy)', s.mix.EASY === 50 && s.mix.MEDIUM === 30 && s.mix.HARD === 20);
check('the total stays 100 in all of those', sum(s.mix) === 100);

const KEYS: Level[] = ['EASY', 'MEDIUM', 'HARD'];
let ok = true, seed = 7;
const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
for (let run = 0; run < 300 && ok; run++) {
  let m: Mix = { ...DEFAULT_MIX }; let t: Level[] = [];
  for (let i = 0; i < 12; i++) {
    const r = rebalance(m, KEYS[Math.floor(rnd() * 3)], Math.floor(rnd() * 130) - 15, t);
    m = r.mix; t = r.touched;
    if (sum(m) !== 100 || KEYS.some((k) => !Number.isInteger(m[k]) || m[k] < 0 || m[k] > 100)) { ok = false; break; }
  }
}
check('300 random edit sequences always total 100 with whole numbers from 0 to 100', ok);
check('empty or invalid input counts as 0', rebalance(DEFAULT_MIX, 'HARD', NaN, []).mix.HARD === 0);

let failed = 0;
for (const [n, pass] of results) { if (!pass) failed++; console.log((pass ? 'PASS' : 'FAIL') + '  ' + n); }
console.log('\n' + (results.length - failed) + ' of ' + results.length + ' cases passed.');
if (failed > 0) process.exit(1);
