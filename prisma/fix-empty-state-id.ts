import 'dotenv/config';
import { randomUUID } from 'crypto';
import { prisma } from '../lib/prisma';

async function main() {
  const ap = await prisma.state.findUnique({ where: { code: 'AP' } });
  if (!ap) { console.log('No state with code AP found.'); return; }
  if (ap.id !== '') { console.log('AP already has a valid id:', ap.id); return; }
  const updated = await prisma.state.update({ where: { code: 'AP' }, data: { id: randomUUID() } });
  console.log('Fixed. New id for', updated.name, '=', updated.id);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
