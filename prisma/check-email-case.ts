import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true } });
  const mixed = users.filter((u) => u.email !== u.email.toLowerCase());
  console.log(`${users.length} users, ${mixed.length} with uppercase letters in email.`);
  for (const u of mixed) console.log(' -', u.email);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
