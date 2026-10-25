import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { istToDate } from '../lib/schedule';

const apply = process.argv.includes('--apply');

// Turns each job's existing dates into schedule events. Date-only values become
// "end of that day, IST". Jobs that already have events are skipped, so it is safe to re-run.
async function main() {
  const jobs = await prisma.notification.findMany({
    include: {
      scheduleEvents: { select: { id: true } },
      admitCards: { select: { title: true, releaseDate: true, examDate: true } },
      results: { select: { title: true, releaseDate: true } },
    },
  });

  const day = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : null);

  let created = 0;
  let skipped = 0;
  for (const job of jobs) {
    if (job.scheduleEvents.length > 0) { skipped++; continue; }

    const rows: { kind: string; label: string; day: string }[] = [];
    const add = (kind: string, label: string, value: string | null) => { if (value) rows.push({ kind, label, day: value }); };

    add('APPLICATION_OPEN', 'Applications open', day(job.applicationStartDate));
    add('APPLICATION_CLOSE', 'Applications close', day(job.applicationEndDate));
    add('EXAM', 'Exam', day(job.examDate));
    for (const card of job.admitCards) add('ADMIT_CARD', card.title, day(card.releaseDate));
    for (const result of job.results) add('RESULT', result.title, day(result.releaseDate));

    if (rows.length === 0) continue;
    console.log(`${apply ? 'creating' : 'would create'} ${rows.length} events: ${job.title}`);
    created += rows.length;
    if (!apply) continue;

    for (const [order, row] of rows.entries()) {
      const at = istToDate(row.day);
      if (!at) continue;
      await prisma.scheduleEvent.create({
        data: {
          notificationId: job.id,
          kind: row.kind,
          label: row.label,
          at,
          timeKnown: false,
          order,
          history: { create: { kind: 'ANNOUNCED', newAt: at, newTimeKnown: false } },
        },
      });
    }
  }
  console.log(`\n${jobs.length} jobs | events ${apply ? 'created' : 'to create'}: ${created} | jobs already migrated: ${skipped}`);
  if (!apply && created > 0) console.log('Preview only. Re-run with --apply.');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
