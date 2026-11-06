import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { ORG_WEBSITES } from './data/org-websites';

const apply = process.argv.includes('--apply');
async function main() {
  const rows = await prisma.organization.findMany({ where: { OR: [{ website: null }, { website: '' }] }, select: { id: true, name: true, shortName: true } });
  const byShort = new Map(Object.entries(ORG_WEBSITES).map(([k, v]) => [k.toLowerCase(), v]));
  let filled = 0;
  const left: string[] = [];
  for (const o of rows) {
    const host = byShort.get(o.shortName.toLowerCase());
    if (!host) { left.push(o.name + ' [' + o.shortName + ']'); continue; }
    filled++;
    console.log((apply ? 'set ' : 'would set ') + o.shortName + ' -> https://' + host);
    if (apply) await prisma.organization.update({ where: { id: o.id }, data: { website: 'https://' + host } });
  }
  console.log('\n' + (apply ? 'Set' : 'Would set') + ': ' + filled + '. Still without a website: ' + left.length);
  if (left.length) { console.log('\nFill these in Admin (or give them to your AI agent):'); left.forEach((l) => console.log('  - ' + l)); }
  if (!apply) console.log('\nPreview only. Re-run with --apply.');
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
