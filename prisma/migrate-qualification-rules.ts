import 'dotenv/config';
import { prisma } from '../lib/prisma';

const apply = process.argv.includes('--apply');

async function main() {
  const posts = await prisma.post.findMany({
    select: {
      id: true, title: true, qualificationId: true,
      qualifications: { select: { id: true, name: true } },
      branches: { select: { id: true, name: true, qualificationId: true } },
      _count: { select: { qualificationRules: true } },
    },
  });

  let made = 0, skipped = 0, noQual = 0, loosened = 0;
  for (const p of posts) {
    if (p._count.qualificationRules > 0) { skipped++; continue; }
    const qualIds = p.qualifications.length ? p.qualifications.map((q) => q.id) : p.qualificationId ? [p.qualificationId] : [];
    if (qualIds.length === 0) { noQual++; continue; }

    const unmatched = p.branches.filter((b) => !qualIds.includes(b.qualificationId));
    // A qualification with no branches of its own inherits branches that matched none of the
    // post's qualifications, so a post never becomes looser than it was.
    const rules = qualIds.map((qualificationId) => {
      const own = p.branches.filter((b) => b.qualificationId === qualificationId).map((b) => b.id);
      return { qualificationId, branchIds: own.length > 0 ? own : unmatched.map((b) => b.id) };
    });
    const hadBranches = p.branches.length > 0;
    const openOnes = rules.filter((r) => r.branchIds.length === 0).length;
    if (hadBranches && openOnes > 0) loosened++;

    if (unmatched.length || (hadBranches && openOnes > 0)) {
      console.log(`check: ${p.title}${unmatched.length ? `  | branches matching none of its qualifications: ${unmatched.map((b) => b.name).join(', ')}` : ''}${hadBranches && openOnes > 0 ? `  | ${openOnes} qualification(s) now accept any branch` : ''}`);
    }
    if (apply) await prisma.postQualificationRule.createMany({ data: rules.map((r) => ({ ...r, postId: p.id })) });
    made += rules.length;
  }
  console.log(`\n${posts.length} posts | rules ${apply ? 'created' : 'to create'}: ${made} | already converted: ${skipped} | no qualification: ${noQual} | posts loosened: ${loosened}`);
  if (!apply) console.log('Preview only. Re-run with --apply.');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
