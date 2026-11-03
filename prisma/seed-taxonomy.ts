import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { fieldKey } from '../lib/field-keys';
import { NEW_TYPES, type QualDef } from './data/taxonomy-types';
import { PART_A } from './data/taxonomy-a';
import { PART_B } from './data/taxonomy-b';

const apply = process.argv.includes('--apply');
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

async function main() {
  const defs: QualDef[] = [...PART_A, ...PART_B];
  const quals = await prisma.qualification.findMany({ include: { branches: { select: { name: true } } } });
  const branchRows = await prisma.branch.findMany({ select: { name: true, slug: true } });
  const takenNames = new Set(branchRows.map((b) => norm(b.name)));
  const takenSlugs = new Set(branchRows.map((b) => b.slug));
  const types = await prisma.qualificationCategory.findMany({ select: { id: true, name: true, order: true } });
  const typeByName = new Map(types.map((t) => [norm(t.name), t]));
  let nextOrder = Math.max(0, ...types.map((t) => t.order)) + 1;

  const missingTypes = new Set<string>();
  for (const d of defs) for (const t of d.types) if (!typeByName.has(norm(t)) && !NEW_TYPES.some((n) => norm(n) === norm(t))) missingTypes.add(t);
  if (missingTypes.size) {
    console.log('Education types not in the database and not planned:', [...missingTypes].join(', '));
    console.log('Fix the names in the data files, then run again.');
    process.exit(1);
  }

  let newQuals = 0, newBranches = 0, newTypes = 0;
  const odd: string[] = [];

  for (const t of NEW_TYPES) {
    if (typeByName.has(norm(t))) continue;
    newTypes++;
    console.log(`${apply ? 'creating' : 'would create'} education type: ${t}`);
    if (apply) {
      const made = await prisma.qualificationCategory.create({ data: { name: t, slug: slugify(t), order: nextOrder++ } });
      typeByName.set(norm(t), { id: made.id, name: t, order: made.order });
    }
  }

  for (const d of defs) {
    let q = quals.find((x) => x.slug === d.slug) ?? quals.find((x) => norm(x.name) === norm(d.name));
    let qualId = q?.id ?? '';
    let have = (q?.branches ?? []).map((b) => b.name);
    if (!q) {
      newQuals++;
      console.log(`${apply ? 'creating' : 'would create'} qualification: ${d.name} (level ${d.level}; ${d.types.join(', ')})`);
      if (apply) {
        const made = await prisma.qualification.create({
          data: { name: d.name, slug: d.slug, level: d.level, categories: { connect: d.types.map((t) => ({ id: typeByName.get(norm(t))!.id })) } },
        });
        qualId = made.id;
      }
      have = [];
    }

    const haveKeys = new Set(have.map((n) => fieldKey(n)).filter((k): k is string => !!k));
    const haveNames = new Set(have.map(norm));
    for (const label of d.branches) {
      const key = fieldKey(label);
      if ((key && haveKeys.has(key)) || haveNames.has(norm(label))) continue;
      let name = label;
      if (takenNames.has(norm(name))) name = `${label} (${d.short ?? d.name})`;
      if (takenNames.has(norm(name))) { odd.push(`${d.name}: "${label}" skipped, the name is already used`); continue; }
      let slug = slugify(name);
      if (takenSlugs.has(slug)) slug = `${slug}-${d.slug}`;
      if (takenSlugs.has(slug)) { odd.push(`${d.name}: "${label}" skipped, the slug is already used`); continue; }
      takenNames.add(norm(name)); takenSlugs.add(slug);
      if (key) haveKeys.add(key);
      newBranches++;
      console.log(`  ${apply ? 'branch' : 'would add branch'}: ${name}  (field key: ${fieldKey(name) ?? 'NONE'})`);
      if (apply && qualId) await prisma.branch.create({ data: { name, slug, qualificationGroup: d.name, qualificationId: qualId } });
    }
  }

  console.log(`\n${apply ? 'Created' : 'Would create'}: ${newTypes} education types, ${newQuals} qualifications, ${newBranches} branches.`);
  if (odd.length) { console.log('\nSkipped:'); odd.forEach((o) => console.log('  - ' + o)); }
  if (!apply) console.log('\nPreview only. Re-run with --apply.');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
