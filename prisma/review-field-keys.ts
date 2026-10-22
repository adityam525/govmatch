import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { fieldKey } from '../lib/field-keys';

async function main() {
  const categories = await prisma.qualificationCategory.findMany({ select: { name: true, slug: true }, orderBy: { order: 'asc' } });
  const LEVEL_SLUGS = new Set(['8th-pass', '10th-pass', '12th-pass', 'iti', 'apprentice', 'diploma', 'graduate', 'post-graduate', 'postgraduate', 'doctorate', 'phd']);
  const isLevel = (c: { slug: string; name: string }) => LEVEL_SLUGS.has(c.slug) || /(pass|^iti$|apprentice|diploma|graduate|doctorate)/i.test(c.name);
  console.log('Treated as a LEVEL (ignored when comparing fields):');
  console.log('  ' + categories.filter(isLevel).map((c) => c.name).join(', '));
  console.log('Treated as a FIELD FAMILY (a higher degree in the same family counts):');
  console.log('  ' + categories.filter((c) => !isLevel(c)).map((c) => c.name).join(', '));

  const branches = await prisma.branch.findMany({ select: { name: true, qualification: { select: { name: true } } } });
  const groups = new Map<string, { name: string; qual: string }[]>();
  for (const b of branches) {
    const key = fieldKey(b.name) ?? '(empty)';
    groups.set(key, [...(groups.get(key) ?? []), { name: b.name, qual: b.qualification.name }]);
  }
  const merged = [...groups.entries()].filter(([, list]) => list.length > 1);
  console.log(`\n${branches.length} branches -> ${groups.size} field keys. Keys shared by several branches (check these are really the same field):`);
  for (const [key, list] of merged) {
    console.log(`  "${key}":`);
    for (const item of list) console.log(`      ${item.name}   [${item.qual}]`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
