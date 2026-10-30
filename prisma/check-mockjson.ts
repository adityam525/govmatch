import { SAMPLE_JSON, normalizeImport } from '../lib/mock-test-json';
import { validateTest } from '../lib/mock-test';

const ok = (name: string, pass: boolean, results: [string, boolean][]) => results.push([name, pass]);
const results: [string, boolean][] = [];
const run = (raw: unknown) => { const n = normalizeImport(raw); return 'error' in n ? n : validateTest(n.payload); };

const sample = JSON.parse(SAMPLE_JSON);
const v: any = run(sample);
ok('the sample file is valid', 'data' in v, results);
ok('a letter answer becomes the right index', v.data?.sections[0].questions[0].correctIndex === 1, results);
ok('top-level marks reach the question', v.data?.sections[0].questions[0].marks === 2, results);
ok('top-level negative marks reach the question', v.data?.sections[0].questions[0].negativeMarks === 0.5, results);

const withQ = (patch: object) => ({ ...sample, sections: [{ name: 'S', questions: [{ ...sample.sections[0].questions[0], ...patch }] }] });
ok('a question may carry its own marks', (run(withQ({ marks: 4 })) as any).data?.sections[0].questions[0].marks === 4, results);
ok('a numeric correctIndex works', (run(withQ({ answer: undefined, correctIndex: 3 })) as any).data?.sections[0].questions[0].correctIndex === 3, results);
ok('a missing answer is rejected', 'error' in run(withQ({ answer: undefined })), results);
ok('an answer letter beyond the options is rejected', 'error' in run(withQ({ answer: 'E' })), results);
ok('an unknown answer word is rejected', 'error' in run(withQ({ answer: 'maybe' })), results);
ok('a non-object file is rejected', 'error' in run([1, 2]), results);
ok('a file with no sections is rejected', 'error' in run({ title: 'x', durationMinutes: 5 }), results);

let failed = 0;
for (const [name, pass] of results) { if (!pass) failed++; console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}`); }
console.log(`\n${results.length - failed} of ${results.length} cases passed.`);
if (failed > 0) process.exit(1);
