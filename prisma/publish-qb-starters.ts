import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { validateTemplate, type TemplateDef } from '../lib/qb/template';

const apply = process.argv.includes('--apply');
async function main() {
  const rows = await prisma.qbTemplate.findMany({ where: { published: false }, select: { id: true, title: true, definition: true } });
  let ok = 0;
  for (const r of rows) {
    const rep = validateTemplate(r.definition as unknown as TemplateDef);
    console.log((rep.ok ? (apply ? 'publishing: ' : 'would publish: ') : 'NOT READY: ') + r.title + (rep.ok ? '' : ' | ' + rep.errors[0]));
    if (rep.ok) { ok++; if (apply) await prisma.qbTemplate.update({ where: { id: r.id }, data: { published: true } }); }
  }
  console.log('\n' + ok + ' of ' + rows.length + ' drafts pass. ' + (apply ? 'Published.' : 'Preview only. Re-run with --apply.'));
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
