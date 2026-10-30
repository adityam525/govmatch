import { readSectionTimes, toTimedSectionCreate } from '../lib/mock-sections';
import { validatePattern } from '../lib/mock-pattern';
import { validateTest } from '../lib/mock-test';

const results: [string, boolean][] = [];
const check = (name: string, ok: boolean) => results.push([name, ok]);

const q = { text: 'Q?', options: ['a', 'b'], correctIndex: 0, marks: 1, negativeMarks: 0 };
const test = (times: unknown[], total: unknown = 60) => ({
  title: 'T', durationMinutes: total,
  sections: times.map((t, i) => ({ name: `S${i + 1}`, durationMinutes: t, questions: [q] })),
});
const read = (t: unknown) => readSectionTimes(t) as any;

check('every section timed: total is the sum', read(test([20, 25, 15])).payload?.durationMinutes === 60 && read(test([20, 25, 15], 999)).payload?.durationMinutes === 60);
check('the times are returned in order', JSON.stringify(read(test([20, 25, 15])).times) === '[20,25,15]');
check('no section times: the total is kept', read(test([null, null], 45)).payload?.durationMinutes === 45);
check('blank strings count as no time', JSON.stringify(read(test(['', ''], 45)).times) === '[null,null]');
check('a mix of timed and untimed is rejected', 'error' in read(test([20, null])));
check('a zero time is rejected', 'error' in read(test([0, 10])));
check('a decimal time is rejected', 'error' in read(test([10.5, 10])));
check('a text time is rejected', 'error' in read(test(['abc', 10])));
check('sections over the limit are rejected', 'error' in read(test([200, 200])));
check('the result passes validateTest', 'data' in (validateTest(read(test([20, 25, 15])).payload) as any));
check('untimed with no total is caught by validateTest', 'error' in (validateTest(read(test([null], '')).payload) as any));

const data: any = (validateTest(read(test([20, 25])).payload) as any).data;
const create = toTimedSectionCreate(data.sections, [20, 25]);
check('section times reach the database shape', create[0].durationMinutes === 20 && create[1].durationMinutes === 25);
check('untimed sections store null', toTimedSectionCreate(data.sections, [null, null])[0].durationMinutes === null);

const pat = (sections: unknown[], extra: object = {}) => ({ name: 'SSC CGL Tier 1', organizationId: 'org1', totalMinutes: 60, sections, ...extra });
const sec = (o: object = {}) => ({ name: 'Maths', questionCount: 25, marks: 2, negativeMarks: 0.5, ...o });
check('a valid pattern passes', 'data' in (validatePattern(pat([sec()])) as any));
check('pattern: timed sections set the total', (validatePattern(pat([sec({ durationMinutes: 15 }), sec({ name: 'English', durationMinutes: 20 })], { totalMinutes: '' })) as any).data?.totalMinutes === 35);
check('pattern: a mix of timed and untimed is rejected', 'error' in (validatePattern(pat([sec({ durationMinutes: 15 }), sec({ name: 'E' })])) as any));
check('pattern: no organization is rejected', 'error' in (validatePattern(pat([sec()], { organizationId: '' })) as any));
check('pattern: zero questions is rejected', 'error' in (validatePattern(pat([sec({ questionCount: 0 })])) as any));
check('pattern: zero marks is rejected', 'error' in (validatePattern(pat([sec({ marks: 0 })])) as any));
check('pattern: no total and no section times is rejected', 'error' in (validatePattern(pat([sec()], { totalMinutes: '' })) as any));
check('pattern: no sections is rejected', 'error' in (validatePattern(pat([])) as any));
check('pattern: over the question limit is rejected', 'error' in (validatePattern(pat([sec({ questionCount: 200 }), sec({ name: 'B', questionCount: 200 })])) as any));

let failed = 0;
for (const [name, ok] of results) { if (!ok) failed++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); }
console.log(`\n${results.length - failed} of ${results.length} cases passed.`);
if (failed > 0) process.exit(1);
