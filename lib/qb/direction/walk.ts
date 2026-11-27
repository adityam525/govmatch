import { rng, shuffle } from '../random';
import { numberOptions } from '../data/opts';

export type Turn = 'L' | 'R';
export interface Walk { start: number; legs: number[]; turns: Turn[]; heads: number[]; pts: [number, number][]; names: string[] }
export interface DirQ { kind: string; args: number[]; text: string; options: string[]; correctIndex: number; explanation: string; answer: string; hard: boolean }

// Headings: 0 north, 1 east, 2 south, 3 west. A right turn adds 1, a left turn adds 3.
export const VEC: [number, number][] = [[0, 1], [1, 0], [0, -1], [-1, 0]];
export const HEAD_NAME = ['north', 'east', 'south', 'west'];
export const DIR8 = ['North', 'North-east', 'East', 'South-east', 'South', 'South-west', 'West', 'North-west'];

export function dir8(dx: number, dy: number): string | null {
  if (dx === 0 && dy === 0) return null;
  const sx = Math.sign(dx), sy = Math.sign(dy);
  if (sx === 0) return sy > 0 ? 'North' : 'South';
  if (sy === 0) return sx > 0 ? 'East' : 'West';
  return (sy > 0 ? 'North' : 'South') + '-' + (sx > 0 ? 'east' : 'west');
}

export function buildWalk(start: number, legs: number[], turns: Turn[]): Walk {
  const heads = [start];
  for (const t of turns) heads.push((heads[heads.length - 1] + (t === 'R' ? 1 : 3)) % 4);
  const pts: [number, number][] = [[0, 0]];
  legs.forEach((l, i) => { const p = pts[i]; const v = VEC[heads[i]]; pts.push([p[0] + v[0] * l, p[1] + v[1] * l]); });
  return { start, legs, turns, heads, pts, names: ['office', 'P', 'Q', 'R', 'S', 'T', 'U'].slice(0, legs.length + 1) };
}

export function makeWalk(seed: string): Walk | null {
  for (let attempt = 0; attempt < 300; attempt++) {
    const r = rng(seed + '#' + attempt);
    const start = Math.floor(r() * 4);
    const count = 4 + Math.floor(r() * 2);
    const legs = Array.from({ length: count }, () => 2 + Math.floor(r() * 14));
    const turns: Turn[] = Array.from({ length: count - 1 }, () => (r() < 0.5 ? 'L' : 'R'));
    const w = buildWalk(start, legs, turns);
    if (new Set(w.pts.map((p) => p[0] + ',' + p[1])).size !== w.pts.length) continue;
    const last = w.pts[w.pts.length - 1];
    if (last[0] === 0 && last[1] === 0) continue;
    return w;
  }
  return null;
}

export function walkText(w: Walk): string {
  const n = w.names;
  let s = 'A person starts walking from his office and walks ' + w.legs[0] + ' m in the ' + HEAD_NAME[w.start] + ' direction and reaches point ' + n[1] + '.';
  for (let i = 1; i < w.legs.length; i++) {
    s += ' From point ' + n[i] + ', he takes a ' + (w.turns[i - 1] === 'R' ? 'right' : 'left') + ' turn and walks ' + w.legs[i] + ' m to reach point ' + n[i + 1] + '.';
  }
  return s;
}

const label = (w: Walk, i: number) => (i === 0 ? 'the office' : 'point ' + w.names[i]);
const coords = (w: Walk) => w.pts.map((p, i) => (i === 0 ? 'office' : w.names[i]) + ' (' + p[0] + ', ' + p[1] + ')').join(', ');
const intro = 'Take the office as (0, 0), east as the x direction and north as the y direction. ';
const dist2 = (a: [number, number], b: [number, number]) => (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]);
const isqrt = (n: number) => { const s = Math.round(Math.sqrt(n)); return s * s === n ? s : -1; };

function dirOptions(ans: string, r: () => number) {
  const others = shuffle(DIR8.filter((d) => d !== ans), r).slice(0, 4);
  const options = shuffle([ans, ...others], r);
  return { options, correctIndex: options.indexOf(ans) };
}
function distOptions(d: number, wrong: number[], r: () => number) {
  const o = numberOptions(d, wrong, r);
  return o ? { options: o.options.map((x) => x + ' m'), correctIndex: o.correctIndex } : null;
}

export function dirQuestions(w: Walk, seed: string): DirQ[] {
  const n = w.pts.length, last = n - 1;
  const out: DirQ[] = [];
  const makers: ((r: () => number) => DirQ | null)[] = [
    () => {
      const [x, y] = w.pts[last]; const ans = dir8(x, y) as string;
      const r = rng(seed + '#d0');
      return { kind: 'final', args: [], answer: ans, ...dirOptions(ans, r), hard: false,
        text: 'What is the direction of point ' + w.names[last] + ' with respect to the office?',
        explanation: intro + 'The points are ' + coords(w) + '. Point ' + w.names[last] + ' is ' + Math.abs(x) + ' m ' + (x === 0 ? '' : x > 0 ? 'east' : 'west') + (x !== 0 && y !== 0 ? ' and ' : '') + Math.abs(y) + ' m ' + (y === 0 ? '' : y > 0 ? 'north' : 'south') + ' of the office, so it is to the ' + ans.toLowerCase() + '.' };
    },
    (r) => {
      for (let t = 0; t < 300; t++) {
        const Y = Math.floor(r() * n), A = Math.floor(r() * n); if (A === Y) continue;
        const dirIdx = Math.floor(r() * 4), d = 5 + Math.floor(r() * 36);
        const G: [number, number] = [w.pts[Y][0] + d * VEC[dirIdx][0], w.pts[Y][1] + d * VEC[dirIdx][1]];
        const sq = dist2(w.pts[A], G), dist = isqrt(sq);
        if (dist < 5) continue;
        const dx = Math.abs(w.pts[A][0] - G[0]), dy = Math.abs(w.pts[A][1] - G[1]);
        const o = distOptions(dist, [dx + dy, Math.max(dx, dy), Math.round(dist * 1.1), Math.round(Math.sqrt(dx * dx + dy * dy + 2 * dx * dy))], r);
        if (!o) continue;
        return { kind: 'dist', args: [A, Y, dirIdx, d], answer: String(dist), ...o, hard: dx > 0 && dy > 0,
          text: 'If point G is ' + d + ' m ' + HEAD_NAME[dirIdx] + ' of ' + label(w, Y) + ', then what is the shortest distance between ' + label(w, A) + ' and point G?',
          explanation: intro + 'The points are ' + coords(w) + '. Point G is ' + d + ' m ' + HEAD_NAME[dirIdx] + ' of ' + label(w, Y) + ', so G is at (' + G[0] + ', ' + G[1] + '). From ' + label(w, A) + ' the straight-line gap is ' + dx + ' m across and ' + dy + ' m up or down, so the distance is the square root of (' + dx + '^2 + ' + dy + '^2) = ' + dist + ' m.' };
      }
      return null;
    },
    (r) => {
      for (let t = 0; t < 100; t++) {
        const X = 1 + Math.floor(r() * last), dirIdx = Math.floor(r() * 4), d = 4 + Math.floor(r() * 17);
        const M: [number, number] = [-d * VEC[dirIdx][0], -d * VEC[dirIdx][1]];
        const ans = dir8(w.pts[X][0] - M[0], w.pts[X][1] - M[1]); if (!ans) continue;
        return { kind: 'newpoint', args: [X, dirIdx, d], answer: ans, ...dirOptions(ans, r), hard: true,
          text: 'If the office is ' + d + ' m ' + HEAD_NAME[dirIdx] + ' of point M, then in which direction is point ' + w.names[X] + ' with respect to point M?',
          explanation: intro + 'The points are ' + coords(w) + '. The office is ' + d + ' m ' + HEAD_NAME[dirIdx] + ' of M, so M is at (' + M[0] + ', ' + M[1] + '). Point ' + w.names[X] + ' is at (' + w.pts[X][0] + ', ' + w.pts[X][1] + '), which is ' + (w.pts[X][0] - M[0]) + ' across and ' + (w.pts[X][1] - M[1]) + ' up from M, so it is to the ' + ans.toLowerCase() + ' of M.' };
      }
      return null;
    },
    (r) => {
      const [x, y] = w.pts[last], dist = isqrt(x * x + y * y);
      if (dist < 5 || x === 0 || y === 0) return null;
      const o = distOptions(dist, [Math.abs(x) + Math.abs(y), Math.max(Math.abs(x), Math.abs(y)), Math.round(dist * 1.1), Math.round(dist * 0.9)], r);
      if (!o) return null;
      return { kind: 'home', args: [], answer: String(dist), ...o, hard: true,
        text: 'How far is point ' + w.names[last] + ' from the office (shortest distance)?',
        explanation: intro + 'The points are ' + coords(w) + '. Point ' + w.names[last] + ' is ' + Math.abs(x) + ' m across and ' + Math.abs(y) + ' m up or down from the office, so the distance is the square root of (' + Math.abs(x) + '^2 + ' + Math.abs(y) + '^2) = ' + dist + ' m.' };
    },
  ];
  makers.forEach((mk, k) => {
    for (let t = 0; t < 12; t++) { const q = mk(rng(seed + '#m' + k + '.' + t)); if (q) { out.push(q); break; } }
  });
  return out;
}
