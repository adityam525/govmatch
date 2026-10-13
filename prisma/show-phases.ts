import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { computeJobPhase, formatCalendarDate, todayIST, STALE_AFTER_DAYS } from '../lib/job-status';

async function main() {
  const jobs = await prisma.notification.findMany({
    include: { importantDates: true, admitCards: true, results: true, answerKeys: true },
    orderBy: { createdAt: 'desc' },
  });
  const now = new Date();
  console.log(`Today (IST): ${formatCalendarDate(todayIST(now))} | closes after ${STALE_AFTER_DAYS} quiet days\n`);

  const counts: Record<string, number> = {};
  const table = jobs.map((job) => {
    const info = computeJobPhase(job, now);
    counts[info.phase] = (counts[info.phase] ?? 0) + 1;
    return {
      phase: info.phase,
      published: job.published ? 'yes' : 'draft',
      stored: job.status,
      apps: info.applicationOpen ? 'open' : '-',
      start: formatCalendarDate(job.applicationStartDate),
      end: formatCalendarDate(job.applicationEndDate),
      lastActivity: formatCalendarDate(info.lastActivity),
      title: job.title.length > 46 ? job.title.slice(0, 45) + '...' : job.title,
    };
  });

  console.table(table);
  console.log(counts);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
