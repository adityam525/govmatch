import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { fieldKey } from '../lib/field-keys';

async function main() {
  const rows = await prisma.branch.findMany({ select: { name: true, qualification: { select: { name: true } }, _count: { select: { posts: true, educations: true } } } });
  const bad = rows.filter((b) => !fieldKey(b.name));
  bad.forEach((b) => console.log(b.qualification.name + ' > ' + b.name + ' | posts ' + b._count.posts + ', user educations ' + b._count.educations));
  console.log('\n' + bad.length + ' of ' + rows.length + ' branches have no field key.');
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
