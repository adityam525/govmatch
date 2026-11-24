import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

async function main() {
  const [email, ...nameParts] = process.argv.slice(2);
  const password = process.env.ADMIN_NEW_PASSWORD ?? '';
  const name = nameParts.join(' ').trim() || 'Admin';
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw new Error('Usage: ADMIN_NEW_PASSWORD="..." npx tsx prisma/create-admin.ts email@example.com Full Name');
  if (password.length < 12 || password.length > 72 || /\s/.test(password)) throw new Error('ADMIN_NEW_PASSWORD must be 12 to 72 characters with no spaces.');
  const row = await prisma.adminAccount.upsert({
    where: { email: email.toLowerCase() },
    update: { passwordHash: await bcrypt.hash(password, 12), name, isActive: true, failedAttempts: 0, lockedUntil: null },
    create: { email: email.toLowerCase(), name, passwordHash: await bcrypt.hash(password, 12) },
  });
  console.log('Admin account ready: ' + row.email);
}
main().catch((e) => { console.error(e.message ?? e); process.exit(1); }).finally(() => prisma.$disconnect());
