import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { prisma } from '../lib/prisma';

const OUT = join(process.cwd(), 'prisma', 'org-logos.csv');
const quote = (value: string) => `"${value.replace(/"/g, '""')}"`;

async function main() {
  const orgs = await prisma.organization.findMany({
    select: { slug: true, name: true, website: true, logoUrl: true, _count: { select: { notifications: true } } },
  });
  orgs.sort((a, b) => b._count.notifications - a._count.notifications || a.name.localeCompare(b.name));

  const lines = ['slug,name,website,jobs,logo_url'];
  for (const org of orgs) {
    // Organizations that already have a logo are left out.
    if (org.logoUrl) continue;
    lines.push([quote(org.slug), quote(org.name), quote(org.website ?? ''), String(org._count.notifications), ''].join(','));
  }
  writeFileSync(OUT, lines.join('\n') + '\n');
  console.log(`Wrote ${lines.length - 1} organizations to prisma/org-logos.csv - fill in the logo_url column.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
