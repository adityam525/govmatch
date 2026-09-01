import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  const posts = await prisma.post.findMany({ select: { id: true, qualificationId: true } });
  console.log(`Found ${posts.length} posts to migrate.`);

  let migrated = 0;
  for (const post of posts) {
    if (!post.qualificationId) continue;
    await prisma.post.update({
      where: { id: post.id },
      data: {
        qualifications: { connect: [{ id: post.qualificationId }] },
      },
    });
    migrated++;
  }

  console.log(`Migrated ${migrated} posts into the new qualifications many-to-many table.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
