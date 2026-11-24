import 'dotenv/config';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { STARTERS } from './data/qb-starters';
import { validateTemplate, type TemplateDef } from '../lib/qb/template';

const apply = process.argv.includes('--apply');
const slugs = process.argv.slice(2).filter((a) => !a.startsWith('--'));
async function main() {
  if (!slugs.length) throw new Error('Usage: npx tsx prisma/update-starter.ts slug [slug...] [--apply]');
  for (const slug of slugs) {
    const st = STARTERS.find((s) => s.slug === slug);
    if (!st) { console.log('no such starter: ' + slug); continue; }
    const report = validateTemplate(st.def as unknown as TemplateDef);
    if (!report.ok) { console.log('NOT READY ' + slug + ': ' + report.errors[0]); continue; }
    const row = await prisma.qbTemplate.findFirst({ where: { OR: [{ slug }, { title: st.title }] }, select: { id: true, title: true } });
    if (!row) { console.log('not in the database yet: ' + slug); continue; }
    console.log((apply ? 'updating: ' : 'would update: ') + row.title);
    if (apply) await prisma.qbTemplate.update({ where: { id: row.id }, data: { definition: st.def as unknown as Prisma.InputJsonValue } });
  }
  if (!apply) console.log('\nPreview only. Re-run with --apply.');
}
main().catch((e) => { console.error(e.message ?? e); process.exit(1); }).finally(() => prisma.$disconnect());
