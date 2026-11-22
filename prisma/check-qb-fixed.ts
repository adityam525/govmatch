import { isFixed, shuffleFixed, validateFixed } from '../lib/qb/fixed';
import { generateAny } from '../lib/qb/generate-any';
import { rng } from '../lib/qb/random';

const good = { text: 'Which word is a synonym of "rapid"?', options: ['Slow', 'Quick', 'Late', 'Heavy'], correctIndex: 1, explanation: '"Quick" means the same as "rapid". The others do not.' };
const results: [string, boolean][] = [];
const check = (n: string, ok: boolean) => { results.push([n, ok]); };
check('a good question passes', validateFixed(good).length === 0);
check('three options fail', validateFixed({ ...good, options: ['a', 'b', 'c'] }).length > 0);
check('duplicate options fail (ignoring case)', validateFixed({ ...good, options: ['Quick', 'quick', 'Late', 'Heavy'] }).length > 0);
check('bad correctIndex fails', validateFixed({ ...good, correctIndex: 4 }).length > 0);
check('missing explanation fails', validateFixed({ ...good, explanation: '' }).length > 0);
check('"all of the above" fails', validateFixed({ ...good, options: ['a', 'b', 'c', 'All of the above'] }).length > 0);
check('shuffle keeps the same correct answer', (() => { for (let s = 0; s < 50; s++) { const q = shuffleFixed(good, rng('x' + s)); if (q.options[q.correctIndex] !== 'Quick' || new Set(q.options).size !== 4) return false; } return true; })());
check('isFixed tells the kinds apart', isFixed({ fixed: good }) && !isFixed({ text: 'x', variables: [] }) && !isFixed(null));
check('generateAny returns a fixed question as it is', (() => { const r: any = generateAny({ fixed: good } as any, rng('a') as any); return r.ok && r.q.text === good.text && r.q.correctIndex === 1; })());
let failed = 0;
for (const [n, ok] of results) { if (!ok) failed++; console.log((ok ? 'PASS' : 'FAIL') + '  ' + n); }
console.log('\n' + (results.length - failed) + ' of ' + results.length + ' cases passed.');
if (failed > 0) process.exit(1);
