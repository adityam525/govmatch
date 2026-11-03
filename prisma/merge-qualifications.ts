import 'dotenv/config';
import { prisma } from '../lib/prisma';

const apply = process.argv.includes('--apply');
const MERGES = [
  { from: 'bsc-agriculture', to: 'bsc' }, { from: 'bsc-nursing', to: 'bsc' }, { from: 'msc-nursing', to: 'msc' },
  { from: 'diploma-education', to: 'diploma' }, { from: 'diploma-nursing', to: 'diploma' }, { from: 'diploma-pharmacy', to: 'diploma' },
];

async function main() {
  for (const m of MERGES) {
    const [from, to] = await Promise.all([
      prisma.qualification.findUnique({ where: { slug: m.from }, include: { branches: { select: { id: true, name: true } } } }),
      prisma.qualification.findUnique({ where: { slug: m.to }, select: { id: true, name: true } }),
    ]);
    if (!from) { console.log(`${m.from}: already merged or not present`); continue; }
    if (!to) { console.log(`${m.from}: target ${m.to} not found, skipped`); continue; }
    const used = {
      posts: await prisma.post.count({ where: { OR: [{ qualificationId: from.id }, { qualifications: { some: { id: from.id } } }] } }),
      rules: await prisma.postQualificationRule.count({ where: { qualificationId: from.id } }),
      profiles: await prisma.userProfile.count({ where: { qualificationId: from.id } }),
      educations: await prisma.userEducation.count({ where: { qualificationId: from.id } }),
    };
    const total = used.posts + used.rules + used.profiles + used.educations;
    if (total > 0) { console.log(`${from.name}: STILL USED (${JSON.stringify(used)}), not merged. Tell me and I will repoint it.`); continue; }
    console.log(`${apply ? 'merging' : 'would merge'} ${from.name} into ${to.name}; moving ${from.branches.length} branches: ${from.branches.map((b) => b.name).join(', ') || '-'}`);
    if (apply) {
      await prisma.branch.updateMany({ where: { qualificationId: from.id }, data: { qualificationId: to.id } });
      await prisma.qualification.delete({ where: { id: from.id } });
    }
  }

  const diploma = await prisma.qualification.findUnique({ where: { slug: 'diploma' }, select: { id: true, name: true } });
  if (diploma && diploma.name !== 'Diploma') {
    const clash = await prisma.qualification.findUnique({ where: { name: 'Diploma' }, select: { id: true } });
    if (clash) console.log('Cannot rename to "Diploma": the name is taken.');
    else { console.log(`${apply ? 'renaming' : 'would rename'} "${diploma.name}" to "Diploma"`); if (apply) await prisma.qualification.update({ where: { id: diploma.id }, data: { name: 'Diploma' } }); }
  }
  if (!apply) console.log('\nPreview only. Re-run with --apply.');
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
