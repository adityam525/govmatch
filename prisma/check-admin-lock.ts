import { afterFailure, isLocked, minutesLeft, MAX_FAILS, LOCK_MS } from '../lib/admin-lock';
const results: [string, boolean][] = [];
const check = (n: string, ok: boolean) => { results.push([n, ok]); };
const now = 1_000_000;
check('first failure counts up', afterFailure(0, now).failedAttempts === 1 && afterFailure(0, now).lockedUntil === null);
check('the 5th failure locks for 15 minutes', (() => { const r = afterFailure(MAX_FAILS - 1, now); return r.lockedUntil?.getTime() === now + LOCK_MS && r.failedAttempts === 0; })());
check('locked until the time passes', isLocked(new Date(now + 1000), now) && !isLocked(new Date(now - 1), now) && !isLocked(null, now));
check('minutes left rounds up, never 0', minutesLeft(new Date(now + 61_000), now) === 2 && minutesLeft(new Date(now + 10), now) === 1);
let failed = 0;
for (const [n, ok] of results) { if (!ok) failed++; console.log((ok ? 'PASS' : 'FAIL') + '  ' + n); }
console.log('\n' + (results.length - failed) + ' of ' + results.length + ' cases passed.');
if (failed > 0) process.exit(1);
