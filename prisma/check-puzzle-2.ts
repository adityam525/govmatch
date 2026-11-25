import { buildLine, lineQuestions, lineStem, makeLine, solveLine, type LClue, type LineKind } from '../lib/qb/puzzle/line';
import { buildCirc, circQuestions, circStem, makeCirc, solveCirc, type CClue } from '../lib/qb/puzzle/circle';
import { LETTERS } from '../lib/qb/puzzle/linear';
import { validateFixed } from '../lib/qb/fixed';

const results: [string, boolean][] = [];
const check = (n: string, ok: boolean) => { results.push([n, ok]); };
const L = (s: string) => LETTERS.indexOf(s);

// Nine boxes in a stack (a real exam set, solved by hand: top to bottom I D F G A E B H C).
const stackClues: LClue[] = [
  { t: 'offset', a: L('C'), b: L('A'), d: 4 },
  { t: 'adjacent', a: L('G'), b: L('A') },
  { t: 'between', a: L('G'), b: L('B'), n: 2 },
  { t: 'offset', a: L('B'), b: L('E'), d: 1 },
  { t: 'before', a: L('D'), b: L('E') },
  { t: 'atLeast', a: L('E'), k: 5 },
  { t: 'offset', a: L('F'), b: L('I'), d: 2 },
];
const ss = solveLine(stackClues, 9);
check('the exam stack has exactly one solution', ss.length === 9);
const sp = buildLine('stack', 9, Array.from(ss), stackClues);
check('top to bottom it is I D F G A E B H C', sp.arrangement.map((x) => sp.names[x]).join('') === 'IDFGAEBHC');
check('only H is in its alphabetical place', sp.names.filter((_, i) => sp.pos[i] === i).join('') === 'H');
check('box C is just below box H', sp.arrangement[sp.pos[L('H')] + 1] === L('C'));
check('three boxes are between I and A', Math.abs(sp.pos[L('I')] - sp.pos[L('A')]) - 1 === 3);
check('box D is two boxes above box G', sp.pos[L('G')] - sp.pos[L('D')] === 2);

// Six persons of different heights (solved by hand: tallest first C A B D E F).
const hClues: LClue[] = [
  { t: 'before', a: L('C'), b: L('A') },
  { t: 'before', a: L('A'), b: L('B') },
  { t: 'between', a: L('C'), b: L('D'), n: 2 },
  { t: 'mirror', a: L('A'), b: L('E') },
  { t: 'atLeast', a: L('F'), k: 4 },
];
const hs = solveLine(hClues, 6);
check('the exam height puzzle has exactly one solution', hs.length === 6);
const hp = buildLine('height', 6, Array.from(hs), hClues);
check('tallest first it is C A B D E F', hp.arrangement.map((x) => hp.names[x]).join('') === 'CABDEF');
check('B is the third tallest', hp.arrangement[2] === L('B'));
check('one person is between A and D', Math.abs(hp.pos[L('A')] - hp.pos[L('D')]) - 1 === 1);
check('F is immediately shorter than E', hp.arrangement[hp.pos[L('E')] + 1] === L('F'));

// Six persons round a table facing the centre (clockwise order A B C D E F).
const cClues: CClue[] = [
  { t: 'offset', a: L('B'), b: L('A'), d: 1 },
  { t: 'opposite', a: L('D'), b: L('A') },
  { t: 'offset', a: L('C'), b: L('E'), d: 4 },
  { t: 'offset', a: L('F'), b: L('A'), d: 5 },
];
const cs = solveCirc(cClues, 6);
check('the circular puzzle has exactly one solution', cs.length === 6);
const cp = buildCirc(6, Array.from(cs), cClues);
check('clockwise from A it is A B C D E F', cp.arrangement.map((x) => cp.names[x]).join('') === 'ABCDEF');

function generated(label: string, make: (n: number, s: string) => { n: number; clues: unknown[]; names: string[] } | null, solveLen: (p: any) => number, questions: (p: any, s: string) => any[], stemOf: (p: any) => string, sameAfterSolve: (p: any) => boolean, dropOne: (p: any, k: number) => number) {
  for (const n of [6, 7]) {
    let ok = true; let msg = '';
    for (let i = 0; i < 3 && ok; i++) {
      const g = make(n, 'check-' + label + n + '-' + i);
      if (!g) { ok = false; msg = 'no puzzle could be made'; break; }
      if (solveLen(g) !== n) { ok = false; msg = 'not unique'; break; }
      if (!sameAfterSolve(g)) { ok = false; msg = 'solver disagrees'; break; }
      for (let k = 0; k < g.clues.length; k++) if (dropOne(g, k) === n) { ok = false; msg = 'a clue is not needed'; }
      const qs = questions(g, 'q' + i);
      if (qs.length < 3) { ok = false; msg = 'too few questions'; }
      for (const q of qs) {
        const bad = validateFixed({ text: stemOf(g) + ' ' + q.text, options: q.options, correctIndex: q.correctIndex, explanation: q.explanation });
        if (bad.length) { ok = false; msg = bad[0]; }
      }
    }
    check(label + ' puzzles with ' + n + ' persons are unique, minimal and well formed' + (msg ? ' (' + msg + ')' : ''), ok);
  }
}
for (const kind of ['stack', 'height'] as LineKind[]) {
  generated(kind, (n, s) => makeLine(kind, n, s), (p) => solveLine(p.clues, p.n).length, lineQuestions, lineStem,
    (p) => buildLine(p.kind, p.n, Array.from(solveLine(p.clues, p.n)), p.clues).arrangement.join() === p.arrangement.join(),
    (p, k) => solveLine(p.clues.filter((_: unknown, j: number) => j !== k), p.n).length);
}
generated('circle', (n, s) => makeCirc(n, s), (p) => solveCirc(p.clues, p.n).length, circQuestions, circStem,
  (p) => buildCirc(p.n, Array.from(solveCirc(p.clues, p.n)), p.clues).arrangement.join() === p.arrangement.join(),
  (p, k) => solveCirc(p.clues.filter((_: unknown, j: number) => j !== k), p.n).length);

let failed = 0;
for (const [n, pass] of results) { if (!pass) failed++; console.log((pass ? 'PASS' : 'FAIL') + '  ' + n); }
console.log('\n' + (results.length - failed) + ' of ' + results.length + ' cases passed.');
if (failed > 0) process.exit(1);
