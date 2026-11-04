// A small, safe expression language for question templates. No eval and no dynamic code.

export class ExprError extends Error {}

export type Node =
  | { t: 'num'; v: number }
  | { t: 'var'; name: string }
  | { t: 'un'; op: '-' | '!'; a: Node }
  | { t: 'bin'; op: string; a: Node; b: Node }
  | { t: 'call'; fn: string; args: Node[] };

type Tok = { k: 'num' | 'id' | 'op'; s: string; v?: number };

const MAX_LEN = 300;
const CONSTANTS: Record<string, number> = { pi: Math.PI };
const has = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o, k);

export function roundTo(x: number, d: number): number {
  const f = 10 ** d;
  const r = Math.round(Math.abs(x) * f + 1e-9) / f;
  return x < 0 && r !== 0 ? -r : r;
}

function gcd(a: number, b: number): number {
  if (!Number.isInteger(a) || !Number.isInteger(b)) throw new ExprError('gcd and lcm need whole numbers');
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) { const t = y; y = x % y; x = t; }
  return x;
}

interface Fn { min: number; max: number; f: (...a: number[]) => number }
const FUNCS = new Map<string, Fn>([
  ['sqrt', { min: 1, max: 1, f: (x) => { if (x < 0) throw new ExprError('sqrt of a negative number'); return Math.sqrt(x); } }],
  ['abs', { min: 1, max: 1, f: (x) => Math.abs(x) }],
  ['round', { min: 1, max: 2, f: (x, d = 0) => roundTo(x, d) }],
  ['floor', { min: 1, max: 1, f: (x) => Math.floor(x + 1e-9) }],
  ['ceil', { min: 1, max: 1, f: (x) => Math.ceil(x - 1e-9) }],
  ['min', { min: 1, max: 8, f: (...a) => Math.min(...a) }],
  ['max', { min: 1, max: 8, f: (...a) => Math.max(...a) }],
  ['pow', { min: 2, max: 2, f: (a, b) => Math.pow(a, b) }],
  ['gcd', { min: 2, max: 2, f: (a, b) => gcd(a, b) }],
  ['lcm', { min: 2, max: 2, f: (a, b) => { const g = gcd(a, b); return g === 0 ? 0 : Math.abs(a * b) / g; } }],
  ['mod', { min: 2, max: 2, f: (a, b) => { if (b === 0) throw new ExprError('mod by zero'); return a % b; } }],
]);
export const FUNCTION_NAMES = [...FUNCS.keys()];

function tokenize(src: string): Tok[] {
  if (src.length > MAX_LEN) throw new ExprError('Expression is too long');
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === ' ' || c === '\t') { i++; continue; }
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      const text = src.slice(i, j);
      if (!/^(\d+\.?\d*|\.\d+)$/.test(text)) throw new ExprError('Bad number "' + text + '"');
      out.push({ k: 'num', s: text, v: Number(text) });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++;
      out.push({ k: 'id', s: src.slice(i, j) });
      i = j;
      continue;
    }
    const two = src.slice(i, i + 2);
    if (['<=', '>=', '==', '!=', '&&', '||'].includes(two)) { out.push({ k: 'op', s: two }); i += 2; continue; }
    if ('+-*/^%(),<>!'.includes(c)) { out.push({ k: 'op', s: c }); i++; continue; }
    throw new ExprError('Unexpected character "' + c + '"');
  }
  return out;
}

class Parser {
  private pos = 0;
  constructor(private toks: Tok[]) {}
  private peek() { return this.toks[this.pos]; }
  private isOp(s: string) { const t = this.peek(); return !!t && t.k === 'op' && t.s === s; }
  private take(s: string) { if (!this.isOp(s)) throw new ExprError('Expected "' + s + '"'); this.pos++; }

  parse(): Node {
    if (this.toks.length === 0) throw new ExprError('Expression is empty');
    const n = this.or();
    if (this.pos < this.toks.length) throw new ExprError('Unexpected "' + this.toks[this.pos].s + '"');
    return n;
  }
  private level(ops: string[], next: () => Node): Node {
    let left = next();
    while (true) {
      const t = this.peek();
      if (!t || t.k !== 'op' || !ops.includes(t.s)) return left;
      this.pos++;
      left = { t: 'bin', op: t.s, a: left, b: next() };
    }
  }
  private or(): Node { return this.level(['||'], () => this.and()); }
  private and(): Node { return this.level(['&&'], () => this.eq()); }
  private eq(): Node { return this.level(['==', '!='], () => this.cmp()); }
  private cmp(): Node { return this.level(['<', '>', '<=', '>='], () => this.add()); }
  private add(): Node { return this.level(['+', '-'], () => this.mul()); }
  private mul(): Node { return this.level(['*', '/', '%'], () => this.unary()); }
  private unary(): Node {
    if (this.isOp('-')) { this.pos++; return { t: 'un', op: '-', a: this.unary() }; }
    if (this.isOp('!')) { this.pos++; return { t: 'un', op: '!', a: this.unary() }; }
    return this.pow();
  }
  private pow(): Node {
    const base = this.atom();
    if (this.isOp('^')) { this.pos++; return { t: 'bin', op: '^', a: base, b: this.unary() }; }
    return base;
  }
  private atom(): Node {
    const t = this.peek();
    if (!t) throw new ExprError('Expression ends too early');
    this.pos++;
    if (t.k === 'num') return { t: 'num', v: t.v as number };
    if (t.k === 'id') {
      if (this.isOp('(')) {
        this.pos++;
        const args: Node[] = [];
        if (!this.isOp(')')) {
          args.push(this.or());
          while (this.isOp(',')) { this.pos++; args.push(this.or()); }
        }
        this.take(')');
        if (!FUNCS.has(t.s)) throw new ExprError('Unknown function "' + t.s + '"');
        const fn = FUNCS.get(t.s) as Fn;
        if (args.length < fn.min || args.length > fn.max) throw new ExprError(t.s + ' takes ' + fn.min + ' to ' + fn.max + ' values');
        return { t: 'call', fn: t.s, args };
      }
      return { t: 'var', name: t.s };
    }
    if (t.s === '(') { const n = this.or(); this.take(')'); return n; }
    throw new ExprError('Unexpected "' + t.s + '"');
  }
}

const cache = new Map<string, Node>();

export function parse(src: string): Node {
  const hit = cache.get(src);
  if (hit) return hit;
  const node = new Parser(tokenize(src)).parse();
  if (cache.size > 500) cache.clear();
  cache.set(src, node);
  return node;
}

export function tryParse(src: string): { ok: true; node: Node } | { ok: false; error: string } {
  try { return { ok: true, node: parse(src) }; } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Invalid expression' }; }
}

export function identifiers(n: Node, into: Set<string> = new Set()): Set<string> {
  if (n.t === 'var') into.add(n.name);
  else if (n.t === 'un') identifiers(n.a, into);
  else if (n.t === 'bin') { identifiers(n.a, into); identifiers(n.b, into); }
  else if (n.t === 'call') n.args.forEach((a) => identifiers(a, into));
  return into;
}

function finite(x: number): number {
  if (!Number.isFinite(x)) throw new ExprError('Result is not a finite number');
  return x;
}

export function evaluate(n: Node, env: Record<string, number>): number {
  if (n.t === 'num') return n.v;
  if (n.t === 'var') {
    if (has(env, n.name)) return env[n.name];
    if (has(CONSTANTS, n.name)) return CONSTANTS[n.name];
    throw new ExprError('Unknown name "' + n.name + '"');
  }
  if (n.t === 'un') {
    const a = evaluate(n.a, env);
    return n.op === '-' ? -a : a === 0 ? 1 : 0;
  }
  if (n.t === 'call') {
    const fn = FUNCS.get(n.fn) as Fn;
    return finite(fn.f(...n.args.map((a) => evaluate(a, env))));
  }
  const a = evaluate(n.a, env);
  const b = evaluate(n.b, env);
  switch (n.op) {
    case '+': return finite(a + b);
    case '-': return finite(a - b);
    case '*': return finite(a * b);
    case '/': if (b === 0) throw new ExprError('Division by zero'); return finite(a / b);
    case '%': if (b === 0) throw new ExprError('Division by zero'); return finite(a % b);
    case '^': return finite(Math.pow(a, b));
    case '<': return a < b ? 1 : 0;
    case '>': return a > b ? 1 : 0;
    case '<=': return a <= b + 1e-9 ? 1 : 0;
    case '>=': return a >= b - 1e-9 ? 1 : 0;
    case '==': return Math.abs(a - b) < 1e-9 ? 1 : 0;
    case '!=': return Math.abs(a - b) < 1e-9 ? 0 : 1;
    case '&&': return a !== 0 && b !== 0 ? 1 : 0;
    case '||': return a !== 0 || b !== 0 ? 1 : 0;
  }
  throw new ExprError('Unknown operator');
}

export function evalExpr(src: string, env: Record<string, number>): number {
  return evaluate(parse(src), env);
}
