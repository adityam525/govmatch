import { csrfProblem, type CsrfInput } from '../lib/csrf';

const results: [string, boolean][] = [];
const check = (n: string, ok: boolean) => { results.push([n, ok]); };
const base: CsrfInput = { method: 'POST', path: '/api/posts', origin: 'https://site.in', referer: null, secFetchSite: 'same-origin', host: 'site.in', siteUrl: 'https://site.in' };
const run = (o: Partial<CsrfInput>) => csrfProblem({ ...base, ...o });

check('a same-site write passes', run({}) === null);
check('GET is never checked', run({ method: 'GET', origin: 'https://evil.com' }) === null);
check('a write from another site is blocked', run({ origin: 'https://evil.com' }) !== null);
check('a lookalike host is blocked', run({ origin: 'https://site.in.evil.com' }) !== null);
check('a different port is blocked', run({ origin: 'https://site.in:8443' }) !== null);
check('Origin "null" is blocked', run({ origin: 'null' }) !== null);
check('a Referer is used when there is no Origin', run({ origin: null, referer: 'https://site.in/admin' }) === null && run({ origin: null, referer: 'https://evil.com/x' }) !== null);
check('cross-site with no Origin is blocked', run({ origin: null, secFetchSite: 'cross-site' }) !== null);
check('no browser headers at all passes (scripts, servers)', run({ origin: null, secFetchSite: null }) === null);
check('NextAuth routes are skipped', run({ path: '/api/auth/callback/credentials', origin: 'https://evil.com' }) === null);
check('DELETE and PATCH are checked too', run({ method: 'DELETE', origin: 'https://evil.com' }) !== null && run({ method: 'patch', origin: 'https://evil.com' }) !== null);
check('the configured site URL is allowed behind a proxy', run({ host: 'internal:3000', origin: 'https://site.in' }) === null);
check('localhost works in development', run({ host: 'localhost:3000', siteUrl: undefined, origin: 'http://localhost:3000' }) === null);

let failed = 0;
for (const [n, ok] of results) { if (!ok) failed++; console.log((ok ? 'PASS' : 'FAIL') + '  ' + n); }
console.log('\n' + (results.length - failed) + ' of ' + results.length + ' cases passed.');
if (failed > 0) process.exit(1);
