import 'dotenv/config';
import { prisma } from '../lib/prisma';

const db = prisma as any;
const bad = /example|replace every value|\[demo\]|dummy|lorem|test job/i;
const fakeLink = /example\.com|demo\.govmatch\.test|localhost/i;

async function main() {
  const jobs = await db.notification.findMany({
    where: { published: true },
    select: {
      title: true, slug: true, status: true, officialLink: true, directEligibility: true, applicationEndDate: true,
      organization: { select: { name: true, website: true } },
      posts: { select: { title: true, qualificationId: true, qualificationRules: { select: { id: true } } } },
      scheduleEvents: { select: { kind: true, at: true } },
    },
  });
  const drafts = await db.notification.count({ where: { published: false } });
  console.log(`Published jobs: ${jobs.length} | drafts: ${drafts}\n`);

  const problems = new Map<string, string[]>();
  const add = (title: string, msg: string) => problems.set(title, [...(problems.get(title) ?? []), msg]);
  for (const j of jobs) {
    if (bad.test(j.title)) add(j.title, 'title looks like placeholder or test data');
    if (!j.officialLink) add(j.title, 'no official link');
    else if (fakeLink.test(j.officialLink)) add(j.title, 'official link is a placeholder: ' + j.officialLink);
    const hasClose = j.applicationEndDate || j.scheduleEvents.some((e: any) => e.kind === 'APPLICATION_CLOSE' && e.at);
    if (!hasClose && j.status !== 'UPCOMING') add(j.title, 'no application closing date');
    if (j.posts.length === 0 && !j.directEligibility) add(j.title, 'no posts and no general eligibility text');
    for (const p of j.posts) if (!p.qualificationId && p.qualificationRules.length === 0) add(j.title, `post "${p.title}" has no qualification`);
    if (!j.organization?.website) add(j.title, `organization "${j.organization?.name ?? 'none'}" has no website`);
  }
  if (problems.size === 0) console.log('No problems found in published jobs.');
  for (const [title, list] of problems) { console.log(title); list.forEach((m) => console.log('  - ' + m)); }
  console.log(`\nJobs with at least one problem: ${problems.size} of ${jobs.length}`);

  const names = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'AUTH_SECRET', 'NEXTAUTH_URL', 'NEXT_PUBLIC_SITE_URL', 'ADMIN_PASSWORD', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];
  console.log('\nEnvironment variables in this shell (set or missing):');
  for (const n of names) console.log(`  ${n}: ${process.env[n] ? 'set' : 'missing'}`);
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  if (!site || /localhost/.test(site)) console.log('  WARNING: NEXT_PUBLIC_SITE_URL is missing or points at localhost. Sitemap and blog links would be wrong.');

  const leftover = await db.importantDate.count();
  console.log(`\nOld Important Dates rows still in the table: ${leftover}`);
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
