import { parseQuestions } from '../lib/question-parser';

const results: [string, boolean][] = [];
const check = (name: string, ok: boolean) => { results.push([name, ok]); };
const warns = (r: ReturnType<typeof parseQuestions>, i: number, text: string) =>
  r.questions[i].warnings.filter((w) => w.includes(text)).length > 0;

const A = [
  '1. Capital of India?', '(a) Mumbai', '(b) New Delhi', '(c) Kolkata', '(d) Chennai', 'Ans: (b)',
  '2. Largest planet?', 'A. Earth', 'B. Jupiter', 'C. Mars', 'D. Venus', 'Answer: B',
  'Explanation: Jupiter is the biggest.', 'It is a gas giant.',
].join('\n');
const a = parseQuestions(A);
check('inline: two questions', a.questions.length === 2);
check('inline: options read', a.questions[0].options.length === 4 && a.questions[0].options[1] === 'New Delhi');
check('inline: answer B', a.questions[0].correctIndex === 1 && a.questions[0].answerSource === 'inline');
check('A. B. style options', a.questions[1].options[1] === 'Jupiter' && a.questions[1].correctIndex === 1);
check('explanation continues', a.questions[1].explanation === 'Jupiter is the biggest. It is a gas giant.');
check('clean paper has no warnings', a.questions.every((q) => q.warnings.length === 0) && a.warnings.length === 0);

const keyed = (k: string) => ['1. First?', '(a) x', '(b) y', '2. Second?', '(a) x', '(b) y', 'Answer Key', k].join('\n');
const styles: [string, string][] = [['dash', '1-B 2-A'], ['dot', '1. b 2. a'], ['colon', 'Q1: B Q2: A'], ['spaces', '1 B 2 A'], ['commas', '1-B, 2-A']];
for (const [label, line] of styles) {
  const r = parseQuestions(keyed(line));
  check('key at bottom (' + label + ')', r.questions[0].correctIndex === 1 && r.questions[1].correctIndex === 0 && r.keyFound);
}
check('key on the heading line', parseQuestions('1. Q?\n(a) x\n(b) y\nAnswers: 1-B').questions[0].correctIndex === 1);
check('short key reported', parseQuestions(keyed('1-B')).warnings.filter((w) => w.includes('answers for')).length > 0);
check('unreadable key reported', parseQuestions(keyed('see attached')).warnings.filter((w) => w.includes('could not be read')).length > 0);

const bold = parseQuestions('1. Q?\n(a) one\n**(b) two**\n(c) three');
check('bold option is the answer', bold.questions[0].correctIndex === 1 && bold.questions[0].options[1] === 'two');
check('bold inside option', parseQuestions('1. Q?\n(a) one\n(b) **two**\n(c) three').questions[0].correctIndex === 1);
const tick = parseQuestions('1. Q?\n(a) one\n(b) two \u2713\n(c) three');
check('tick mark is the answer', tick.questions[0].correctIndex === 1 && tick.questions[0].options[1] === 'two');
check('(correct) marker', parseQuestions('1. Q?\n(a) one\n(b) two (correct)').questions[0].correctIndex === 1);
const two = parseQuestions('1. Q?\n**(a) one**\n**(b) two**');
check('two marked: no guess', two.questions[0].correctIndex === null && warns(two, 0, 'More than one'));

const inl = parseQuestions('1. Sum?\n(a) 3 (b) 4 (c) 5 (d) 6\nAns: (b)');
check('four options on one line', inl.questions[0].options.join('|') === '3|4|5|6' && inl.questions[0].correctIndex === 1);
const num = parseQuestions('1. 2+2?\n(1) 3 (2) 4 (3) 5 (4) 6\nAns: 2');
check('numbered options', num.questions[0].options.length === 4 && num.questions[0].correctIndex === 1);
check('numeric key', parseQuestions('1. Q?\n(1) a\n(2) b\nAnswer Key\n1-2').questions[0].correctIndex === 1);

const wrap = parseQuestions('1. A very long question\nthat wraps here?\n(a) first\noption continues\n(b) second');
check('wrapped question', wrap.questions[0].text === 'A very long question that wraps here?');
check('wrapped option', wrap.questions[0].options[0] === 'first option continues');
const stray = parseQuestions('1. Which year?\n7. something in the text\n(a) 1990\n(b) 2000');
check('stray number stays in the question', stray.questions.length === 1 && stray.questions[0].text.includes('7. something'));

const none = parseQuestions('1. Q?\n(a) one\n(b) two');
check('no answer: no guess', none.questions[0].correctIndex === null && warns(none, 0, 'No correct answer'));
const clash = parseQuestions('1. Q?\n(a) one\n(b) two\nAns: (a)\nAnswer Key\n1-B');
check('inline and key disagree', clash.questions[0].correctIndex === 0 && warns(clash, 0, 'answer key says B'));
check('matching key is quiet', parseQuestions('1. Q?\n(a) one\n(b) two\nAns: (b)\nAnswer Key\n1-B').questions[0].warnings.length === 0);
check('answer beyond options dropped', parseQuestions('1. Q?\n(a) one\n(b) two\nAns: (d)').questions[0].correctIndex === null);
check('one option flagged', warns(parseQuestions('1. Q?\n(a) one\nAns: (a)'), 0, 'Fewer than 2'));
check('page numbers ignored', parseQuestions('1. Q?\n(a) one\nPage 2 of 5\n(b) two').questions[0].options.length === 2);
check('numbering may start above 1', parseQuestions('5. Q?\n(a) x\n(b) y\n6. R?\n(a) x\n(b) y').questions.length === 2);
check('no questions warns', parseQuestions('Just some notes\nwith no numbering').warnings.length === 1);
check('empty input safe', parseQuestions('').questions.length === 0);
check('Windows line endings', parseQuestions('1. Q?\r\n(a) x\r\n(b) y\r\nAns: (a)').questions[0].correctIndex === 0);

check('bold answer key heading and lines', parseQuestions('1. Q?\n(a) x\n(b) y\n**Answer Key**\n**1-B**').questions[0].correctIndex === 1);
const abbr = parseQuestions('1. Q?\n(a) M.Tech or B.Tech\n(b) other\nAns: B');
check('B.Tech inside an option does not split it', abbr.questions[0].options.length === 2 && abbr.questions[0].options[0] === 'M.Tech or B.Tech');
let failed = 0;
for (const [name, ok] of results) { if (!ok) failed++; console.log((ok ? 'PASS' : 'FAIL') + '  ' + name); }
console.log('\n' + (results.length - failed) + ' of ' + results.length + ' cases passed.');
if (failed > 0) process.exit(1);
