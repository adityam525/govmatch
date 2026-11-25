import { buildPuzzle, LETTERS, makePuzzle, questionsFor, relation, solve, stem, type Clue } from '../lib/qb/puzzle/linear';
import { validateFixed } from '../lib/qb/fixed';

const results: [string, boolean][] = [];
const check = (n: string, ok: boolean) => { results.push([n, ok]); };
const L = (s: string) => LETTERS.indexOf(s);

// The six clues of a real 9-person exam puzzle (checked by hand: the only order is A I E H G F C D B).
const paper: Clue[] = [
  { t: 'between', a: L('B'), b: L('G'), n: 3 },
  { t: 'offset', a: L('C'), b: L('G'), d: 2 },
  { t: 'offset', a: L('H'), b: L('C'), d: -3 },
  { t: 'adjacent', a: L('E'), b: L('H') },
  { t: 'between', a: L('E'), b: L('A'), n: 1 },
  { t: 'offset', a: L('F'), b: L('D'), d: -2 },
];
const solved = solve(paper, 9);
check('the exam puzzle has exactly one solution', solved.length === 9);
const p = buildPuzzle(9, Array.from(solved), paper);
check('and it is A I E H G F C D B', p.arrangement.map((x) => p.names[x]).join('') === 'AIEHGFCDB');
check('I is third to the left of G', relation(p.pos[L('I')] - p.pos[L('G')]) === 'Third to the left');
check('five persons sit to the left of F', p.pos[L('F')] === 5);
check('three persons sit between D and H', Math.abs(p.pos[L('D')] - p.pos[L('H')]) - 1 === 3);
check('E is fourth to the left of C', p.arrangement[p.pos[L('C')] - 4] === L('E'));

for (const n of [6, 7]) {
  let ok = true; let msg = '';
  for (let i = 0; i < 4 && ok; i++) {
    const g = makePuzzle(n, 'check-' + n + '-' + i);
    if (!g) { ok = false; msg = 'no puzzle could be made'; break; }
    const s = solve(g.clues, n);
    if (s.length !== n) { ok = false; msg = 'not unique'; break; }
    const again = buildPuzzle(n, Array.from(s), g.clues);
    if (again.arrangement.join() !== g.arrangement.join()) { ok = false; msg = 'solver disagrees'; break; }
    for (let k = 0; k < g.clues.length; k++) if (solve(g.clues.filter((_, j) => j !== k), n).length === n) { ok = false; msg = 'a clue is not needed'; }
    const qs = questionsFor(again, 'q' + i);
    if (qs.length < 4) { ok = false; msg = 'too few questions'; }
    for (const q of qs) {
      const bad = validateFixed({ text: stem(g) + ' ' + q.text, options: q.options, correctIndex: q.correctIndex, explanation: q.explanation });
      if (bad.length) { ok = false; msg = bad[0]; }
    }
  }
  check(n + '-person puzzles are unique, minimal and well formed' + (msg ? ' (' + msg + ')' : ''), ok);
}

let failed = 0;
for (const [n, pass] of results) { if (!pass) failed++; console.log((pass ? 'PASS' : 'FAIL') + '  ' + n); }
console.log('\n' + (results.length - failed) + ' of ' + results.length + ' cases passed.');
if (failed > 0) process.exit(1);
