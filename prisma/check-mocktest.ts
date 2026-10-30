import { paletteStatus, sanitizeAnswers, scoreAttempt, validateTest, type SnapshotQuestion } from '../lib/mock-test';

const results: [string, boolean][] = [];
const check = (name: string, ok: boolean) => results.push([name, ok]);

const q = (id: string, sectionIndex: number, correctIndex: number, marks: number, negativeMarks: number): SnapshotQuestion =>
  ({ id, sectionIndex, correctIndex, marks, negativeMarks, optionCount: 4 });
const questions = [q('q1', 0, 1, 2, 0.5), q('q2', 0, 2, 2, 0.5), q('q3', 1, 0, 1, 0.25), q('q4', 1, 3, 1, 0.25)];
const answers = {
  q1: { selected: 1, marked: false, visited: true, timeSec: 20 },   // right
  q2: { selected: 0, marked: false, visited: true, timeSec: 30 },   // wrong
  q3: { selected: null, marked: true, visited: true, timeSec: 5 },  // marked, no answer
  q4: { selected: 3, marked: true, visited: true, timeSec: 15 },    // right and marked
};
const r = scoreAttempt(['Maths', 'English'], questions, answers);
check('total is 2 + 1 - 0.5 = 2.5 out of 6', r.score === 2.5 && r.maxScore === 6);
check('2 correct, 1 wrong, 1 unattempted', r.correct === 2 && r.wrong === 1 && r.unattempted === 1);
check('marked without an answer scores nothing', r.perQuestion.find((p) => p.id === 'q3')?.status === 'unattempted');
check('answered and marked still counts', r.perQuestion.find((p) => p.id === 'q4')?.earned === 1);
check('negative marks apply to a wrong answer', r.perQuestion.find((p) => p.id === 'q2')?.earned === -0.5);
check('section scores', r.sections[0].score === 1.5 && r.sections[0].maxScore === 4 && r.sections[1].score === 1 && r.sections[1].maxScore === 2);
check('accuracy is right over attempted: 2 of 3 is 67', r.accuracy === 67);
check('a missing answer entry is unattempted', scoreAttempt(['A'], [q('x', 0, 0, 1, 0)], {}).unattempted === 1);
check('nothing attempted gives null accuracy', scoreAttempt(['A'], [q('x', 0, 0, 1, 0)], {}).accuracy === null);
check('zero negative marking never gives -0', Object.is(scoreAttempt(['A'], [q('x', 0, 0, 1, 0)], { x: { selected: 2, marked: false, visited: true, timeSec: 0 } }).perQuestion[0].earned, 0));

check('palette: untouched', paletteStatus(undefined) === 'not-visited');
check('palette: visited only', paletteStatus({ selected: null, marked: false, visited: true, timeSec: 0 }) === 'not-answered');
check('palette: answered', paletteStatus({ selected: 1, marked: false, visited: true, timeSec: 0 }) === 'answered');
check('palette: marked only', paletteStatus({ selected: null, marked: true, visited: true, timeSec: 0 }) === 'marked');
check('palette: answered and marked', paletteStatus({ selected: 1, marked: true, visited: true, timeSec: 0 }) === 'answered-marked');

const clean = sanitizeAnswers(
  { q1: { selected: 9, marked: true, timeSec: -5 }, q2: { selected: '1', timeSec: 999999 }, ghost: { selected: 0 }, q3: 'junk' },
  [{ id: 'q1', optionCount: 4 }, { id: 'q2', optionCount: 4 }, { id: 'q3', optionCount: 4 }],
);
check('unknown questions are dropped', !('ghost' in clean));
check('an out-of-range choice becomes unanswered', clean.q1.selected === null);
check('a text choice is rejected', clean.q2.selected === null);
check('time is clamped', clean.q1.timeSec === 0 && clean.q2.timeSec === 86400);
check('a malformed entry is ignored', !('q3' in clean));
check('marking implies the question was visited', clean.q1.visited === true);

const valid = { title: 'T', durationMinutes: 60, sections: [{ name: 'S', questions: [{ text: 'Q?', options: ['a', 'b', 'c', 'd'], correctIndex: 2, marks: 2, negativeMarks: 0.5 }] }] };
const withQ = (patch: object) => ({ ...valid, sections: [{ name: 'S', questions: [{ ...valid.sections[0].questions[0], ...patch }] }] });
check('a valid test passes', 'data' in validateTest(valid));
check('blank negative marks mean 0', (validateTest(withQ({ negativeMarks: '' })) as any).data?.sections[0].questions[0].negativeMarks === 0);
check('correct answer out of range is rejected', 'error' in validateTest(withQ({ correctIndex: 4 })));
check('one option is rejected', 'error' in validateTest(withQ({ options: ['a'], correctIndex: 0 })));
check('an empty option is rejected', 'error' in validateTest(withQ({ options: ['a', '', 'c'] })));
check('zero marks are rejected', 'error' in validateTest(withQ({ marks: 0 })));
check('negative marks above 10 are rejected', 'error' in validateTest(withQ({ negativeMarks: 11 })));
check('no time limit is rejected', 'error' in validateTest({ ...valid, durationMinutes: 0 }));
check('a section with no questions is rejected', 'error' in validateTest({ ...valid, sections: [{ name: 'S', questions: [] }] }));
check('no sections is rejected', 'error' in validateTest({ ...valid, sections: [] }));
check('an unknown exam layout is rejected', 'error' in validateTest({ ...valid, examStyle: 'XYZ' }));

let failed = 0;
for (const [name, ok] of results) { if (!ok) failed++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); }
console.log(`\n${results.length - failed} of ${results.length} cases passed.`);
if (failed > 0) process.exit(1);
