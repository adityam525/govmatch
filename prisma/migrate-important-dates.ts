import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { istDay, istToDate } from '../lib/schedule';

const apply = process.argv.includes('--apply');
const deleteOld = process.argv.includes('--delete-old');

async function main() {
  const rows = await prisma.importantDate.findMany({
    include: { notification: { select: { id: true, title: true, scheduleEvents: { select: { label: true, at: true } } } } },
    orderBy: { createdAt: 'asc' },
  });
  let moved = 0, skipped = 0;
  for (const row of rows) {
    const day = row.date.toISOString().slice(0, 10);
    const at = istToDate(day);
    // Same calendar day already in the schedule counts as a duplicate, whatever the label says.
    const exists = row.notification.scheduleEvents.some((e) => e.at && istDay(e.at) === day);
    if (!at || exists) { skipped++; continue; }
    console.log(`${apply ? 'moving' : 'would move'}: ${row.notification.title} | ${row.label} | ${day}`);
    moved++;
    if (!apply) continue;
    await prisma.scheduleEvent.create({
      data: {
        notificationId: row.notification.id, kind: 'OTHER', label: row.label, at, timeKnown: false, order: 100,
        history: { create: { kind: 'ANNOUNCED', newAt: at, newTimeKnown: false } },
      },
    });
  }
  console.log(`\n${rows.length} old rows | ${apply ? 'moved' : 'to move'}: ${moved} | already in the schedule: ${skipped}`);
  if (apply && deleteOld) {
    const res = await prisma.importantDate.deleteMany({});
    console.log(`Deleted ${res.count} old rows.`);
  }
  if (!apply) console.log('Preview only. Re-run with --apply (add --delete-old to remove the old rows afterwards).');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
