const BASE = process.env.BASE ?? 'http://localhost:3000';
let failed = 0, warned = 0;
const out = (ok: boolean | 'warn', name: string) => { if (ok === 'warn') { warned++; console.log('WARN  ' + name); } else { if (!ok) failed++; console.log((ok ? 'PASS' : 'FAIL') + '  ' + name); } };
const call = (path: string, init: RequestInit = {}) => fetch(BASE + path, { redirect: 'manual', ...init });
const json = { 'Content-Type': 'application/json' };

async function main() {
  let r = await call('/profile');
  out(r.status >= 300 && r.status < 400 && (r.headers.get('location') ?? '').includes('/login'), 'logged-out /profile redirects to login');
  r = await call('/exam/run/abc');
  out(r.status >= 300 && r.status < 400, 'logged-out exam run redirects');
  r = await call('/admin');
  out(r.status >= 300 && r.status < 400 && (r.headers.get('location') ?? '').includes('/admin/login'), 'logged-out /admin redirects to admin login');
  r = await call('/api/users/abc/profile');
  out(r.status === 401 || r.status === 403, 'user API without a session is refused');
  r = await call('/api/admin/qb-templates');
  out(r.status === 401, 'admin API without admin session is refused');
  r = await call('/api/organizations', { method: 'POST', headers: json, body: '{}' });
  out(r.status === 401, 'lookup write without admin session is refused');
  r = await call('/api/organizations', { method: 'POST', headers: { ...json, Origin: 'https://evil.example' }, body: '{}' });
  out(r.status === 403, 'cross-site write is blocked (CSRF)');
  r = await call('/api/users/abc/practice', { method: 'POST', headers: { ...json, Origin: 'https://evil.example' }, body: '{}' });
  out(r.status === 403, 'cross-site practice request is blocked');
  r = await call('/jobs/definitely-not-a-job');
  out(r.status === 404, 'missing job returns a real 404');
  r = await call('/api/password-reset/request', { method: 'POST', headers: json, body: JSON.stringify({ email: 'nobody-' + Date.now() + '@example.com' }) });
  out(r.status === 200, 'password reset does not reveal whether an email exists');
  r = await call('/api/password-reset/confirm', { method: 'POST', headers: json, body: JSON.stringify({ token: 'bad', password: 'Whatever123' }) });
  out(r.status === 400, 'password reset rejects a bad token');
  r = await call('/');
  const h = (n: string) => r.headers.get(n);
  out(h('x-content-type-options') === 'nosniff' ? true : 'warn', 'header X-Content-Type-Options: nosniff');
  out(h('x-frame-options') || (h('content-security-policy') ?? '').includes('frame-ancestors') ? true : 'warn', 'clickjacking protection header');
  out(h('referrer-policy') ? true : 'warn', 'header Referrer-Policy');
  out(h('x-powered-by') ? 'warn' : true, 'X-Powered-By is hidden');
  console.log('\n' + failed + ' failed, ' + warned + ' warnings.');
  if (failed > 0) process.exit(1);
}
main().catch((e) => { console.error(e); process.exit(1); });
