import { evaluateMarks, evaluateTyping, marksCutoff, mergeResults, parseCategoryMarks, parseTypingOptions } from '../lib/skill-rules';

const results: [string, boolean][] = [];
const check = (n: string, ok: boolean) => { results.push([n, ok]); };

const post = { minMarksPercent: 50, minMarksByCategory: { OBC: 45, sc: 40, ST: 40 } };
check('general uses the base minimum', marksCutoff(post, 'General') === 50);
check('OBC has its own cut-off', marksCutoff(post, 'OBC') === 45);
check('category keys ignore case', marksCutoff(post, 'SC') === 40);
check('a category not listed falls back to the base', marksCutoff(post, 'EWS') === 50);
check('only a base: everyone gets it', marksCutoff({ minMarksPercent: 55 }, 'ST') === 55);
check('no marks rule at all gives null', marksCutoff({}, 'General') === null);
check('unknown category with category rules is flagged', marksCutoff(post, null) === 'unknown-category');
check('unknown category with only a base still works', marksCutoff({ minMarksPercent: 50 }, null) === 50);
check('junk category figures are dropped', JSON.stringify(parseCategoryMarks({ OBC: 'x', SC: 101, ST: 40, GEN: -1 })) === '{"ST":40}');

check('exactly at the cut-off passes', evaluateMarks(post, 'General', 50).status === 'yes');
check('just below fails', evaluateMarks(post, 'General', 49.9).status === 'no');
check('OBC at 46 passes where General would fail', evaluateMarks(post, 'OBC', 46).status === 'yes' && evaluateMarks(post, 'General', 46).status === 'no');
check('missing percentage is unknown, not a failure', evaluateMarks(post, 'General', null).status === 'unknown');
check('no marks rule gives no check', evaluateMarks({}, 'General', 10).checks.length === 0);
check('the failure message names both numbers', evaluateMarks(post, 'General', 40).checks[0].text === 'Needs at least 50% marks; you have 40%.');

const typing = [{ lang: 'EN', wpm: 30 }, { lang: 'HI', wpm: 25 }];
check('English meets it', evaluateTyping(typing, 35, null).status === 'yes');
check('Hindi alone is enough', evaluateTyping(typing, null, 25).status === 'yes');
check('English too slow and Hindi unknown stays unknown', evaluateTyping(typing, 20, null).status === 'unknown');
check('both entered and both too slow fails', evaluateTyping(typing, 20, 10).status === 'no');
check('nothing entered is unknown', evaluateTyping(typing, null, null).status === 'unknown');
check('English-only requirement fails when English is slow', evaluateTyping([{ lang: 'EN', wpm: 30 }], 20, null).status === 'no');
check('no typing rule gives no check', evaluateTyping(undefined, null, null).checks.length === 0);
check('bad typing entries are dropped', parseTypingOptions([{ lang: 'FR', wpm: 30 }, { lang: 'EN', wpm: 0 }, { lang: 'EN', wpm: 30 }, 'x']).length === 1);

const ok = { status: 'yes' as const, checks: [] };
const unk = { status: 'unknown' as const, checks: [] };
const no = { status: 'no' as const, checks: [] };
check('merge: a failure beats unknown', mergeResults(unk, [no]).status === 'no');
check('merge: unknown beats yes', mergeResults(ok, [unk]).status === 'unknown');
check('merge: all yes stays yes', mergeResults(ok, [ok, ok]).status === 'yes');

let failed = 0;
for (const [n, pass] of results) { if (!pass) failed++; console.log((pass ? 'PASS' : 'FAIL') + '  ' + n); }
console.log('\n' + (results.length - failed) + ' of ' + results.length + ' cases passed.');
if (failed > 0) process.exit(1);
