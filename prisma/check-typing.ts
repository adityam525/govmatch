import { profileSpeed, scoreTyping } from '../lib/typing-test';
const results: [string, boolean][] = [];
const check = (n: string, ok: boolean) => { results.push([n, ok]); };
const p = 'a'.repeat(300);
check('perfect typing: 300 chars in 1 minute is 60 WPM', scoreTyping(p, p, 60).netWpm === 60 && scoreTyping(p, p, 60).accuracy === 100);
check('half the time doubles the speed', scoreTyping(p, p, 30).netWpm === 120);
check('mistakes lower net speed and accuracy, not gross', (() => { const t = 'a'.repeat(240) + 'b'.repeat(60); const r = scoreTyping(p, t, 60); return r.grossWpm === 60 && r.netWpm === 48 && r.accuracy === 80 && r.errors === 60; })());
check('nothing typed gives zeros', scoreTyping(p, '', 60).netWpm === 0 && scoreTyping(p, '', 60).accuracy === 0);
check('typing past the passage counts as errors', scoreTyping('abc', 'abcdef', 60).errors === 3);
check('profile speed is clamped to 5..200', profileSpeed(0) === 5 && profileSpeed(500) === 200 && profileSpeed(42.6) === 43);
let failed = 0;
for (const [n, ok] of results) { if (!ok) failed++; console.log((ok ? 'PASS' : 'FAIL') + '  ' + n); }
console.log('\n' + (results.length - failed) + ' of ' + results.length + ' cases passed.');
if (failed > 0) process.exit(1);
