import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { ORGS_1 } from './data/orgs-1';

const apply = process.argv.includes('--apply');
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

async function main() {
  let all = [...ORGS_1];
  try { all = [...all, ...(await import('./data/orgs-2')).ORGS_2]; } catch { /* part 2 not added yet */ }

  const sectors = await prisma.category.findMany({ select: { id: true, name: true } });
  const sectorId = new Map(sectors.map((s) => [norm(s.name), s.id]));
  const bad = [...new Set(all.map((o) => o[2]).filter((n) => !sectorId.has(norm(n))))];
  if (bad.length) { console.log('Unknown sectors in the data:', bad.join(', '), '\nExisting:', sectors.map((s) => s.name).join(', ')); process.exit(1); }

  const existing = await prisma.organization.findMany({ select: { name: true, shortName: true, slug: true } });
  const seen = new Set(existing.flatMap((o) => [norm(o.name), norm(o.shortName)]));
  const shorts = new Set(existing.map((o) => o.shortName.toLowerCase()));
  const slugs = new Set(existing.map((o) => o.slug));

  let made = 0, skipped = 0;
  const clashes: string[] = [];
  for (const [name, shortName, sector] of all) {
    if (seen.has(norm(name)) || seen.has(norm(shortName))) {
      skipped++;
      if (!seen.has(norm(name))) console.log('skipped (short name already used): ' + name + ' [' + shortName + ']');
      continue;
    }
    let slug = slugify(shortName);
    if (shorts.has(shortName.toLowerCase()) || slugs.has(slug)) { clashes.push(`${name} (${shortName})`); continue; }
    shorts.add(shortName.toLowerCase()); slugs.add(slug); seen.add(norm(name)); seen.add(norm(shortName));
    made++;
    console.log(`${apply ? 'creating' : 'would create'}: ${name} [${shortName}] in ${sector}`);
    if (apply) await prisma.organization.create({ data: { name, shortName, slug, categoryId: sectorId.get(norm(sector)) } });
  }
  console.log(`\n${apply ? 'Created' : 'Would create'}: ${made}. Already present, skipped: ${skipped}.`);
  if (clashes.length) console.log('Short name already used by another organization, skipped:\n  ' + clashes.join('\n  '));
  const blank = await prisma.organization.count({ where: { website: null } });
  console.log(`Organizations with no website (fill in Admin): ${blank}${apply ? '' : ' (before this run)'}`);
  if (!apply) console.log('\nPreview only. Re-run with --apply.');
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
