import { JOBS } from './jobs';
import { USERS } from './users';

const problems: string[] = [];
const dupes = (keys: string[], what: string) =>
  keys.filter((k, i) => keys.indexOf(k) !== i).forEach((k) => problems.push(`Duplicate ${what} key: ${k}`));

dupes(JOBS.map((j) => j.key), 'job');
dupes(USERS.map((u) => u.key), 'user');

const jobKeys = new Set(JOBS.map((j) => j.key));
for (const u of USERS) {
  for (const k of [...(u.saved ?? []), ...(u.applied ?? [])]) if (!jobKeys.has(k)) problems.push(`User ${u.key} references an unknown job: ${k}`);
}

for (const j of JOBS) {
  if (!j.title.startsWith('[DEMO] ')) problems.push(`Job ${j.key} title is not marked [DEMO]`);
  for (const e of j.schedule) {
    let day = e.day;
    let time = e.time;
    for (const c of e.changes ?? []) {
      if (c.oldDay !== day || c.oldTime !== time) problems.push(`Job ${j.key}, "${e.label}": a change starts from ${c.oldDay}/${c.oldTime ?? '-'} but the event stood at ${day}/${time ?? '-'}`);
      day = c.newDay;
      time = c.newTime;
    }
  }
}

const count = (p: string) => JOBS.filter((j) => j.phase === p).length;
console.log(`${JOBS.length} jobs (live ${count('LIVE')}, upcoming ${count('UPCOMING')}, closed ${count('CLOSED')}, cancelled ${count('CANCELLED')}, drafts ${JOBS.filter((j) => j.published === false).length})`);
console.log(`${USERS.length} users (${USERS.filter((u) => u.plan?.startsWith('PREMIUM')).length} with a premium record, ${USERS.filter((u) => u.active === false).length} deactivated)`);

if (problems.length > 0) {
  console.log('\nProblems:');
  problems.forEach((p) => console.log('  - ' + p));
  process.exit(1);
}
console.log('\nFixtures are consistent.');
