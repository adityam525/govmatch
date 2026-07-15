import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  const n = await prisma.notification.findUnique({
    where: { slug: 'rrb-technician-2026' },
  });
  console.log(JSON.stringify(n, null, 2));
}

main().finally(() => prisma.$disconnect());
