import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  const tests = await prisma.mockTest.findMany({
    select: {
      id: true, title: true, userId: true, published: true, source: true,
      notification: { select: { slug: true, published: true, organization: { select: { name: true } }, states: { select: { code: true } } } },
      examLevel: { select: { name: true } },
    },
  });
  console.log(`${tests.length} tests in total\n`);
  for (const t of tests) {
    const problems: string[] = [];
    if (t.userId) problems.push('belongs to a user, so it is not an official test');
    if (!t.published) problems.push('is a draft');
    if (!t.notification) problems.push('is not linked to a job');
    else if (!t.notification.published) problems.push('its job is unpublished');
    console.log(`${t.title}\n  owner: ${t.userId ? 'user' : 'admin'} | published: ${t.published} | job: ${t.notification?.slug ?? '-'} | level: ${t.examLevel?.name ?? '-'} | org: ${t.notification?.organization?.name ?? '-'} | states: ${t.notification?.states.map((s) => s.code).join(',') || '-'}`);
    console.log(`  ${problems.length ? 'WON\'T SHOW on job page / filters: ' + problems.join('; ') : 'should show on its job page and in the filters'}\n`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
