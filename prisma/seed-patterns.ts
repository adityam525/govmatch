import 'dotenv/config';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { PATTERNS } from './data/mock-patterns';

const apply = process.argv.includes('--apply');
async function main() {
  let made = 0, skipped = 0, missing = 0;
  for (const p of PATTERNS) {
    const org = await prisma.organization.findFirst({ where: { shortName: { equals: p.org, mode: 'insensitive' } }, select: { id: true } });
    if (!org) { missing++; console.log('No organization with short name "' + p.org + '" for ' + p.name + '. Add it in Admin first.'); continue; }
    if (await prisma.mockPattern.findFirst({ where: { name: p.name, organizationId: org.id }, select: { id: true } })) { skipped++; continue; }
    const q = p.sections.reduce((n, x) => n + x.questionCount, 0);
    const marks = Math.round(p.sections.reduce((n, x) => n + x.questionCount * x.marks, 0) * 100) / 100;
    console.log((apply ? 'creating' : 'would create') + ': ' + p.name + '  (' + q + ' questions, ' + marks + ' marks, ' + p.totalMinutes + ' min)');
    made++;
    if (apply) await prisma.mockPattern.create({ data: { name: p.name, organizationId: org.id, totalMinutes: p.totalMinutes, sections: p.sections as unknown as Prisma.InputJsonValue } });
  }
  console.log('\n' + (apply ? 'Created' : 'Would create') + ': ' + made + '. Already there: ' + skipped + '. Missing organization: ' + missing + '.');
  if (!apply) console.log('Preview only. Re-run with --apply.');
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
