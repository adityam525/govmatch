import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  const posts = await prisma.post.findMany({
    take: 5,
    include: { qualifications: true },
  });
  for (const p of posts) {
    console.log(p.title, '-> qualifications:', p.qualifications.map((q) => q.name));
  }
}

main().finally(() => prisma.$disconnect());
