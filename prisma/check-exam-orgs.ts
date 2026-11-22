import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { QB_EXAMS_3 } from './data/qb-exams-3';

async function main() {
  const wanted = [...new Set(QB_EXAMS_3.map((e) => e.org))];
  for (const org of wanted) {
    const row = await prisma.organization.findFirst({ where: { shortName: { equals: org, mode: 'insensitive' } }, select: { shortName: true } });
    console.log((row ? 'ok       ' : 'MISSING  ') + org + (row ? '' : '   (add it in Admin, or change the name in qb-exams-3.ts)'));
  }
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
