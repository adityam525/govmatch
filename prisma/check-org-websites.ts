import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function visit(url: string): Promise<string> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 15000);
  try {
    const res = await fetch(url, { signal: ctl.signal, redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (GovMatch link check)' } });
    return res.status < 400 ? 'ok' : 'HTTP ' + res.status;
  } catch (e) {
    return e instanceof Error && e.name === 'AbortError' ? 'slow (15s)' : 'cannot connect';
  } finally { clearTimeout(timer); }
}

async function main() {
  const orgs = await prisma.organization.findMany({ where: { website: { not: null } }, select: { shortName: true, website: true } });
  const bad: string[] = [];
  let i = 0;
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (i < orgs.length) {
      const o = orgs[i++];
      const r = await visit(o.website as string);
      if (r !== 'ok') bad.push(o.shortName + ' | ' + o.website + ' | ' + r);
    }
  }));
  bad.sort().forEach((b) => console.log(b));
  console.log('\n' + (orgs.length - bad.length) + ' of ' + orgs.length + ' addresses opened. ' + bad.length + ' to check by hand in a browser.');
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
