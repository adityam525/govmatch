import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  await prisma.notification.update({
    where: { slug: 'rrb-technician-2026' },
    data: { examDate: new Date('2026-08-05') },
  });

  await prisma.notification.update({
    where: { slug: 'ssc-aso-2026' },
    data: { examDate: new Date('2026-07-30') },
  });

  await prisma.notification.update({
    where: { slug: 'ibps-po-2026' },
    data: { examDate: new Date('2026-08-25') },
  });

  await prisma.notification.update({
    where: { slug: 'iaf-agniveervayu-2026' },
    data: { examDate: new Date('2026-08-15') },
  });

  console.log('Exam dates set successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
