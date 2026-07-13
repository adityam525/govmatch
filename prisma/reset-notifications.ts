import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  // Delete in dependency order (children first)
  await prisma.answerKey.deleteMany({});
  await prisma.result.deleteMany({});
  await prisma.admitCard.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.notification.deleteMany({});

  console.log('All notifications and related records cleared.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
