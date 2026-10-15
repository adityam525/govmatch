import 'dotenv/config';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, parse } from 'node:path';
import { prisma } from '../lib/prisma';

const DIR = join(process.cwd(), 'public', 'org-logos');
const EXTENSIONS = ['.svg', '.png', '.webp', '.jpg', '.jpeg'];
const apply = process.argv.includes('--apply');

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

async function main() {
  if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true });

  const files = new Map<string, string>();
  for (const file of readdirSync(DIR)) {
    const { name, ext } = parse(file);
    if (EXTENSIONS.includes(ext.toLowerCase())) files.set(slugify(name), file);
  }

  const orgs = await prisma.organization.findMany({
    select: {
      id: true,
      name: true,
      shortName: true,
      slug: true,
      logoUrl: true,
      _count: { select: { notifications: true } },
    },
    orderBy: { name: 'asc' },
  });

  let linked = 0;
  let alreadySet = 0;
  let keptCustom = 0;
  const missing: { slug: string; name: string; jobs: number }[] = [];

  for (const org of orgs) {
    const slug = org.slug ?? slugify(org.shortName);
    const keys = [org.slug, slugify(org.shortName), slugify(org.name)].filter((k): k is string => !!k);
    const file = keys.map((k) => files.get(k)).find(Boolean);

    if (!file) {
      if (!org.logoUrl) missing.push({ slug, name: org.name, jobs: org._count.notifications });
      continue;
    }

    const url = `/org-logos/${encodeURIComponent(file)}`;
    if (org.logoUrl === url) {
      alreadySet++;
      continue;
    }
    if (org.logoUrl && !org.logoUrl.startsWith('/org-logos/')) {
      keptCustom++;
      console.log(`keeping the URL set in admin: ${org.name}`);
      continue;
    }

    console.log(`${apply ? 'linked' : 'would link'}: ${org.name} -> ${url}`);
    if (apply) await prisma.organization.update({ where: { id: org.id }, data: { logoUrl: url } });
    linked++;
  }

  console.log(
    `\n${files.size} logo files found | ${apply ? 'linked' : 'to link'}: ${linked} | already set: ${alreadySet} | custom URLs kept: ${keptCustom}`,
  );
  if (!apply && linked > 0) console.log('Re-run with --apply to save these.');

  missing.sort((a, b) => b.jobs - a.jobs || a.name.localeCompare(b.name));
  console.log(`\n${missing.length} organizations still have no logo. Top 40 by number of jobs (file name to use):`);
  for (const m of missing.slice(0, 40)) console.log(`  ${m.slug}.png   (${m.jobs} jobs)  ${m.name}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
