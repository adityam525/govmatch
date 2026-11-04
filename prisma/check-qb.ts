import { evalExpr, roundTo, tryParse } from '../lib/qb/expr';
import { rng } from '../lib/qb/random';
import { fmt, generate, validateTemplate, type TemplateDef } from '../lib/qb/template';

const results: [string, boolean][] = [];
const check = (n: string, ok: boolean) => { results.push([n, ok]); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-9;
const ev = (s: string, env: Record<string, number> = {}) => evalExpr(s, env);
const fails = (s: string, env: Record<string, number> = {}) => { try { ev(s, env); return false; } catch { return true; } };

check('precedence: 2 + 3 * 4', ev('2 + 3 * 4') === 14);
check('brackets', ev('(2 + 3) * 4') === 20);
check('power is right-associative: 2 ^ 3 ^ 2', ev('2 ^ 3 ^ 2') === 512);
check('unary minus binds below power: -2 ^ 2', ev('-2 ^ 2') === -4);
check('negative exponent', near(ev('2 ^ -1'), 0.5));
check('left to right: 10 - 4 - 3', ev('10 - 4 - 3') === 3);
check('division and modulo', ev('7 / 2') === 3.5 && ev('7 % 3') === 1);
check('variables', ev('a * b + 1', { a: 3, b: 4 }) === 13);
check('functions', ev('sqrt(16) + abs(-3) + max(1, 5, 2)') === 12);
check('round with decimals', ev('round(2.675, 2)') === 2.68);
check('gcd and lcm', ev('gcd(12, 18)') === 6 && ev('lcm(4, 6)') === 12);
check('floor and ceil absorb float noise', ev('floor(0.1 * 3 / 0.1)') === 3 && ev('ceil(2.0000000001)') === 2);
check('comparisons and logic', ev('3 > 2 && 2 >= 2') === 1 && ev('1 == 2 || !0') === 1);
check('equality tolerates float noise', ev('0.1 + 0.2 == 0.3') === 1);
check('pi constant', near(ev('pi'), Math.PI));
check('division by zero is an error', fails('1 / 0') && fails('5 % 0'));
check('sqrt of a negative is an error', fails('sqrt(-1)'));
check('unknown name is an error', fails('a + 1'));
check('inherited names are not visible', fails('constructor') && fails('__proto__') && fails('toString'));
check('unknown function is a parse error', !tryParse('eval(1)').ok && !tryParse('process(1)').ok);
check('wrong argument count is a parse error', !tryParse('sqrt(1, 2)').ok);
check('syntax errors are caught', !tryParse('2 +').ok && !tryParse('(2').ok && !tryParse('2 $ 3').ok && !tryParse('').ok && !tryParse('1.2.3').ok);
check('code-like text is rejected', !tryParse('process.exit(1)').ok && !tryParse('[1,2]').ok && !tryParse('a; b').ok);
check('a huge power is an error, not Infinity', fails('10 ^ 400'));
check('round half away from zero', roundTo(-1.5, 0) === -2 && roundTo(1.5, 0) === 2);

const a1 = rng('s'); const a2 = rng('s'); const b1 = rng('t');
check('same seed, same numbers', a1() === a2() && a1() === a2());
check('different seed, different numbers', rng('s')() !== b1());
check('random values are in [0, 1)', Array.from({ length: 1000 }, (_, i) => rng(i)()).every((x) => x >= 0 && x < 1));

check('fmt trims zeros', fmt(3) === '3' && fmt(3.5, 1) === '3.5' && fmt(0.1 + 0.2, 6) === '0.3' && fmt(-0.0000001, 2) === '0');

const train: TemplateDef = {
  text: 'A train {L} m long crosses a pole in {t} s. Find its speed in km/h.',
  variables: [{ name: 'L', kind: 'int', min: 60, max: 300, step: 10 }, { name: 't', kind: 'int', min: 4, max: 30, step: 1 }],
  derived: [{ name: 'ms', expr: 'L / t' }],
  constraints: ['(L * 18) % (t * 5) == 0'],
  answer: { expr: 'L / t * 18 / 5', decimals: 0, unit: 'km/h' },
  distractors: ['L / t', 'L * 18 / t', 'L / t * 5 / 18'],
  explanation: 'Speed = {L} / {t} = {ms:2} m/s. Multiply by 18/5 to get km/h: {answer}.',
};

const g1 = generate(train, 'seed-1');
const g2 = generate(train, 'seed-1');
check('a train question is generated', g1.ok);
check('same seed gives the identical question', JSON.stringify(g1) === JSON.stringify(g2));
if (g1.ok) {
  check('text has the drawn numbers and no braces', !g1.q.text.includes('{') && g1.q.text.includes(String(g1.q.values.L)));
  check('explanation has no braces', !g1.q.explanation.includes('{') && g1.q.explanation.includes(' m/s'));
  check('four unique options', g1.q.options.length === 4 && new Set(g1.q.options).size === 4);
}

let allRight = true; let allUnique = true; let distinct = new Set<string>();
for (let i = 0; i < 100; i++) {
  const r = generate(train, 'run-' + i);
  if (!r.ok) { allRight = false; continue; }
  const want = (r.q.values.L / r.q.values.t) * 3.6;
  if (!near(Number(r.q.options[r.q.correctIndex]), Math.round(want))) allRight = false;
  if (!near(want, Math.round(want))) allRight = false;
  if (new Set(r.q.options).size !== 4) allUnique = false;
  distinct.add(r.q.text);
}
check('100 draws: the marked option is the true answer', allRight);
check('100 draws: options always unique', allUnique);
check('100 draws: many different questions', distinct.size > 30);

const small: TemplateDef = {
  text: 'Double {a}.', variables: [{ name: 'a', kind: 'int', min: 10, max: 20 }], derived: [], constraints: [],
  answer: { expr: 'a * 2', decimals: 0 }, distractors: ['a * 3', 'a * 4', 'a * 5'], explanation: '{a} x 2 = {answer}.',
};
const sm = generate(small, 'x');
check('wrong-answer formulas are used when valid', sm.ok && [...sm.q.options].sort().join() === [...[2, 3, 4, 5].map((k) => String(k * (sm.ok ? sm.q.values.a : 0)))].sort().join());
const noD = generate({ ...small, distractors: [] }, 'y');
check('with no wrong-answer formulas, near values fill four unique options', noD.ok && new Set(noD.q.options).size === 4);
const dupD = generate({ ...small, distractors: ['a * 2', 'a * 2', 'a * 3'] }, 'z');
check('a wrong formula equal to the answer is dropped', dupD.ok && new Set(dupD.q.options).size === 4);

const clean = generate({ ...small, variables: [{ name: 'a', kind: 'int', min: 1, max: 10 }], answer: { expr: 'a / 3', decimals: 0 } }, 'c');
check('a not-clean answer is redrawn until it is clean', clean.ok && Number.isInteger(clean.q.answer));
const neg = generate({ ...small, variables: [{ name: 'a', kind: 'int', min: 1, max: 5 }], answer: { expr: 'a - 10', decimals: 0 } }, 'n');
check('negative answers are refused by default', !neg.ok && neg.reason === 'answer-negative');
const negOk = generate({ ...small, variables: [{ name: 'a', kind: 'int', min: 1, max: 5 }], answer: { expr: 'a - 10', decimals: 0, allowNegative: true } }, 'n');
check('negative answers work when allowed', negOk.ok && negOk.q.answer < 0);
check('an impossible rule gives a clear reason', (() => { const r = generate({ ...small, constraints: ['a > 100'] }, 'k'); return !r.ok && r.reason === 'constraint'; })());

const dec = generate({ ...small, variables: [{ name: 'a', kind: 'decimal', min: 0.5, max: 2.5, step: 0.5, decimals: 1 }], answer: { expr: 'a * 10', decimals: 0 } }, 'd');
check('decimal variables stay on their step', dec.ok && [0.5, 1, 1.5, 2, 2.5].includes(dec.q.values.a));
const ch = generate({ ...small, variables: [{ name: 'a', kind: 'choice', choices: [12, 15, 18] }] }, 'e');
check('choice variables come from the list', ch.ok && [12, 15, 18].includes(ch.q.values.a));
const fixedDec = generate({ ...small, text: 'Value {a:2}', variables: [{ name: 'a', kind: 'int', min: 3, max: 3 }] }, 'f');
check('{name:2} shows fixed decimals', fixedDec.ok && fixedDec.q.text === 'Value 3.00');

const rep = validateTemplate(train);
check('a good template passes validation', rep.ok && rep.errors.length === 0);
check('validation draws 200 and accepts them all', rep.draws === 200 && rep.accepted === 200);
check('validation reports samples and the answer range', rep.samples.length === 5 && rep.answerMin !== null && (rep.answerMax as number) >= (rep.answerMin as number));
const bad = (patch: Partial<TemplateDef>) => validateTemplate({ ...train, ...patch });
check('unknown name in the answer is an error', !bad({ answer: { expr: 'zz * 2', decimals: 0 } }).ok);
check('syntax error in a formula is an error', !bad({ distractors: ['L /'] }).ok);
check('a wrong placeholder in the text is an error', !bad({ text: 'Speed of {train}?' }).ok);
check('duplicate variable names are an error', !bad({ variables: [train.variables[0], train.variables[0]] }).ok);
check('a reserved name is an error', !bad({ variables: [{ name: 'answer', kind: 'int', min: 1, max: 3 }] }).ok);
check('a bad range is an error', !bad({ variables: [{ name: 'L', kind: 'int', min: 10, max: 5 }, train.variables[1]] }).ok);
check('no variables is an error', !bad({ variables: [] }).ok);
check('an impossible template fails with the reason', !bad({ constraints: ['L < 0'] }).ok);
check('a derived value cannot use a later value', !bad({ derived: [{ name: 'p', expr: 'q + 1' }, { name: 'q', expr: 'L' }] }).ok);
check('a missing explanation is only a warning', (() => { const r = bad({ explanation: '' }); return r.ok && r.warnings.some((w) => w.includes('explanation')); })());

let failed = 0;
for (const [n, ok] of results) { if (!ok) failed++; console.log((ok ? 'PASS' : 'FAIL') + '  ' + n); }
console.log('\n' + (results.length - failed) + ' of ' + results.length + ' cases passed.');
if (failed > 0) process.exit(1);
