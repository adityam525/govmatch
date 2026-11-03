import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { fieldKey } from '../lib/field-keys';

async function main() {
  const rows = await prisma.branch.findMany({ select: { id: true, name: true, _count: { select: { posts: true, educations: true, userProfiles: true } } } });
  for (const b of rows.filter((x) => !fieldKey(x.name))) {
    const used = b._count.posts + b._count.educations + b._count.userProfiles;
    if (used > 0) { console.log('kept (in use): ' + b.name); continue; }
    await prisma.branch.delete({ where: { id: b.id } });
    console.log('deleted: ' + b.name);
  }
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
