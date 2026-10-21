import 'dotenv/config';
import { prisma } from '../lib/prisma';

const trim = (s: string) => s.replace(/^-+|-+$/g, '');

async function main() {
  const jobs = await prisma.notification.findMany({
    select: { id: true, title: true, slug: true, published: true },
    orderBy: { createdAt: 'asc' },
  });

  const ugly = jobs.filter((j) => j.slug !== trim(j.slug));
  console.log(`${jobs.length} jobs. ${ugly.length} have a leading or trailing hyphen in the slug:`);
  for (const j of ugly) console.log(`  [${j.published ? 'published' : 'draft'}] ${j.slug}  |  ${j.title}  |  id ${j.id}`);

  const groups = new Map<string, typeof jobs>();
  for (const j of jobs) groups.set(trim(j.slug), [...(groups.get(trim(j.slug)) ?? []), j]);
  const clashes = [...groups.entries()].filter(([, list]) => list.length > 1);
  console.log(`\n${clashes.length} slugs that clash once hyphens are trimmed:`);
  for (const [slug, list] of clashes) {
    console.log(`  ${slug}`);
    for (const j of list) console.log(`     id ${j.id}  [${j.published ? 'published' : 'draft'}]  ${j.title}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
