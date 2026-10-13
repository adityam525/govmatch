import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  const slugs = ['rrb-technician-2026', 'ssc-aso-2026', 'ibps-po-2026', 'iaf-agniveervayu-2026'];
  const res = await prisma.notification.updateMany({
    where: { slug: { in: slugs } },
    data: { published: false },
  });
  console.log(`Unpublished ${res.count} jobs. Re-publish each from /admin/notifications after verifying.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
