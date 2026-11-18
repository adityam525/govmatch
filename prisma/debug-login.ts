import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

async function main() {
  const email = (process.argv[2] ?? '').trim().toLowerCase();
  const password = process.env.TEST_PASSWORD ?? '';
  const user = await prisma.user.findUnique({ where: { email } });
  console.log('user found:        ' + !!user);
  console.log('has passwordHash:  ' + !!user?.passwordHash + (user && !user.passwordHash ? '  (Google-only account?)' : ''));
  console.log('isActive:          ' + user?.isActive);
  if (user?.passwordHash) console.log('password matches:  ' + (await bcrypt.compare(password, user.passwordHash)));
  console.log('NEXTAUTH_SECRET:   ' + (process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET ? 'set' : 'MISSING'));
}
main().catch(console.error).finally(() => prisma.$disconnect());
