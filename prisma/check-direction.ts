import { buildWalk, dirQuestions, makeWalk, walkText, type Turn } from '../lib/qb/direction/walk';
import { validateFixed } from '../lib/qb/fixed';

const results: [string, boolean][] = [];
const check = (n: string, ok: boolean) => { results.push([n, ok]); };

// A second way of working out positions: complex numbers (re, im) = (east, north)
function viaComplex(start: number, legs: number[], turns: Turn[]): [number, number][] {
  const H: [number, number][] = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  let h = H[start]; let p: [number, number] = [0, 0];
  const out: [number, number][] = [p];
  legs.forEach((l, i) => {
    if (i > 0) h = turns[i - 1] === 'R' ? [h[1], -h[0]] : [-h[1], h[0]];
    p = [p[0] + h[0] * l, p[1] + h[1] * l]; out.push(p);
  });
  return out;
}
// A second way of naming a direction: a sign table
const TAB: (string | null)[][] = [['South-west', 'South', 'South-east'], ['West', null, 'East'], ['North-west', 'North', 'North-east']];
const dirT = (dx: number, dy: number) => TAB[Math.sign(dy) + 1][Math.sign(dx) + 1];
const NV: [number, number][] = [[0, 1], [1, 0], [0, -1], [-1, 0]];

// A real exam walk: 12 east, right 10, right 7, left 2, right 5
const w = buildWalk(1, [12, 10, 7, 2, 5], ['R', 'R', 'L', 'R']);
check('exam walk: the last point is 12 m south of the office', w.pts[5][0] === 0 && w.pts[5][1] === -12);
check('exam answer: point T is south of the office', dirT(w.pts[5][0], w.pts[5][1]) === 'South');
const R = w.pts[3];
const G: [number, number] = [R[0] + 31, R[1]];
check('exam answer: P to G (31 m east of R) is 26 m', Math.round(Math.sqrt((G[0] - w.pts[1][0]) ** 2 + (G[1] - w.pts[1][1]) ** 2)) === 26 && (G[0] - w.pts[1][0]) ** 2 + (G[1] - w.pts[1][1]) ** 2 === 676);
const M: [number, number] = [0, -10];
check('exam answer: S is south-east of M (office 10 m north of M)', dirT(w.pts[4][0] - M[0], w.pts[4][1] - M[1]) === 'South-east');
check('exam walk text names every point and turn', walkText(w).includes('right turn') && walkText(w).includes('left turn') && walkText(w).includes('point T'));

let ok = true, msg = '', made = 0;
const kinds = new Set<string>();
for (let i = 0; i < 60 && ok; i++) {
  const g = makeWalk('check-walk-' + i);
  if (!g) { ok = false; msg = 'a walk could not be made'; break; }
  const c = viaComplex(g.start, g.legs, g.turns);
  if (c.some((p, k) => p[0] !== g.pts[k][0] || p[1] !== g.pts[k][1])) { ok = false; msg = 'positions disagree with the complex-number walk'; break; }
  for (const q of dirQuestions(g, 'q' + i)) {
    made++; kinds.add(q.kind);
    let want = '';
    const last = c[c.length - 1];
    if (q.kind === 'final') want = dirT(last[0], last[1]) as string;
    else if (q.kind === 'dist') { const [A, Y, di, d] = q.args; const Gp: [number, number] = [c[Y][0] + d * NV[di][0], c[Y][1] + d * NV[di][1]]; want = String(Math.round(Math.sqrt((c[A][0] - Gp[0]) ** 2 + (c[A][1] - Gp[1]) ** 2))); }
    else if (q.kind === 'newpoint') { const [X, di, d] = q.args; want = dirT(c[X][0] + d * NV[di][0], c[X][1] + d * NV[di][1]) as string; }
    else if (q.kind === 'home') want = String(Math.round(Math.sqrt(last[0] ** 2 + last[1] ** 2)));
    const marked = q.options[q.correctIndex].replace(' m', '');
    if (marked !== want || q.answer !== want) { ok = false; msg = q.kind + ': marked ' + marked + ' but the check gets ' + want; break; }
    if (q.options.length !== 5 || new Set(q.options).size !== 5) { ok = false; msg = q.kind + ': options are not five different ones'; break; }
    const bad = validateFixed({ text: walkText(g) + ' ' + q.text, options: q.options, correctIndex: q.correctIndex, explanation: q.explanation });
    if (bad.length) { ok = false; msg = q.kind + ': ' + bad[0]; break; }
  }
}
check('60 generated walks (' + made + ' questions) are correct and well formed' + (msg ? ' (' + msg + ')' : ''), ok);
check('all four question kinds appear', kinds.size === 4);

let failed = 0;
for (const [n, pass] of results) { if (!pass) failed++; console.log((pass ? 'PASS' : 'FAIL') + '  ' + n); }
console.log('\n' + (results.length - failed) + ' of ' + results.length + ' cases passed.');
if (failed > 0) process.exit(1);
