import 'dotenv/config';
import { prisma } from '../../lib/prisma';
import { computeJobPhase, todayIST } from '../../lib/job-status';
import { bestFitForJob, loadFitContext, type FitVerdict } from '../../lib/job-fit';
import { getJobSchedule, getRecentlyPostponedJobIds, getScheduleNoticesForUser } from '../../lib/schedule-queries';
import { isPremiumSubscription } from '../../lib/plan';
import { DEMO_DOMAIN } from './shared';
import { JOBS } from './jobs';

let passed = 0;
let failed = 0;
const check = (name: string, ok: boolean, detail = '') => {
  if (ok) passed++; else failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : detail ? `  -> ${detail}` : ''}`);
};

type V = FitVerdict;
// Expected verdicts: user key -> job key -> verdict. Written by hand from the rules.
const E: Record<string, Record<string, V>> = {
  'grad-cs': {
    'e-tenth': 'eligible', 'e-twelfth': 'eligible', 'e-graduate': 'eligible',
    'e-postgraduate': 'not-eligible', 'e-btech-cs': 'eligible', 'e-btech-mech': 'not-eligible',
    'e-diploma-civil': 'not-eligible', 'e-ma-economics': 'not-eligible',
    'r-men-only': 'eligible', 'r-women-only': 'not-eligible', 'r-bihar-only': 'eligible',
    'r-police': 'eligible', 'r-experience-only': 'unknown',
  },
  'tenth-only': {
    'e-tenth': 'eligible', 'e-twelfth': 'not-eligible', 'e-graduate': 'not-eligible',
    'r-women-only': 'eligible', 'r-men-only': 'not-eligible',
  },
  'diploma-civil': {
    'e-tenth': 'eligible', 'e-twelfth': 'not-eligible', 'e-graduate': 'not-eligible', 'e-diploma-civil': 'eligible',
  },
  iti: { 'e-tenth': 'eligible', 'e-twelfth': 'not-eligible' },
  'two-ma': {
    'e-graduate': 'eligible', 'e-postgraduate': 'eligible', 'e-ma-economics': 'eligible', 'e-btech-cs': 'not-eligible',
  },
  'mtech-cs': { 'e-btech-cs': 'eligible', 'e-btech-mech': 'eligible', 'e-postgraduate': 'eligible' },
  'twelfth-obc': { 'e-twelfth': 'not-eligible', 'e-twelfth-obc': 'eligible' },
  'general-over': { 'e-twelfth': 'not-eligible', 'e-twelfth-obc': 'not-eligible' },
  'pwd-locomotor': { 'a-relaxation-all': 'eligible' },
  'pwd-hearing': { 'a-relaxation-all': 'not-eligible' },
  'pwd-low': { 'a-relaxation-all': 'not-eligible' },
  'ex-serviceman': { 'a-relaxation-all': 'eligible', 'r-police': 'not-eligible' },
  widow: { 'a-relaxation-all': 'eligible', 'r-men-only': 'not-eligible', 'r-women-only': 'eligible' },
  'experienced-ctet': { 'r-experience-certs': 'eligible', 'r-experience-only': 'eligible', 'r-bihar-only': 'eligible' },
  short: { 'r-police': 'not-eligible' },
  'up-resident': { 'r-bihar-only': 'not-eligible' },
  'contract-only': { 'e-tenth': 'not-eligible', 'r-contract': 'eligible' },
  'no-education': { 'e-tenth': 'unknown' },
  'no-dob': { 'e-tenth': 'unknown' },
};

async function main() {
  const today = todayIST();
  const jobs = await prisma.notification.findMany({
    where: { slug: { startsWith: 'demo-' } },
    include: {
      importantDates: true, admitCards: true, results: true, answerKeys: true,
      scheduleEvents: true,
      posts: { include: { qualification: true, qualifications: true, branches: true, roles: true } },
    },
  });
  const byKey = new Map(jobs.map((j) => [j.slug.replace(/^demo-/, ''), j]));
  check(`all ${JOBS.length} demo jobs exist`, jobs.length === JOBS.length, `found ${jobs.length}`);

  console.log('\n-- Lifecycle phase and open flag');
  for (const def of JOBS) {
    const j = byKey.get(def.key);
    if (!j) { check(`${def.key}: exists`, false); continue; }
    const info: any = computeJobPhase(j as any, new Date());
    const closeTimePassed = j.scheduleEvents.some((e) => e.kind === 'APPLICATION_CLOSE' && e.timeKnown && e.at && e.at.getTime() < Date.now());
    const open = info.phase === 'LIVE' && info.applicationOpen && !closeTimePassed;
    check(`${def.key}: phase ${def.phase}`, info.phase === def.phase, `got ${info.phase}`);
    if (def.phase === 'LIVE' && def.open !== undefined) check(`${def.key}: applications ${def.open ? 'open' : 'closed'}`, open === def.open, `got ${open}`);
  }
  check('draft job is not published', byKey.get('l-draft')?.published === false);

  console.log('\n-- Eligibility verdicts (real rule code, real data)');
  for (const [userKey, expectations] of Object.entries(E)) {
    const user = await prisma.user.findUnique({ where: { email: `${userKey}${DEMO_DOMAIN}` }, select: { id: true } });
    if (!user) { check(`${userKey}: exists`, false); continue; }
    const ctx = await loadFitContext(user.id);
    for (const [jobKey, expected] of Object.entries(expectations)) {
      const j = byKey.get(jobKey);
      if (!j) { check(`${userKey} x ${jobKey}: job exists`, false); continue; }
      const fit = bestFitForJob(ctx, j.posts as any[]);
      const got = fit?.evaluation.verdict ?? 'no-posts';
      check(`${userKey} x ${jobKey}: ${expected}`, got === expected, `got ${got}${fit ? ` (${fit.evaluation.checks.map((c) => c.text).join(' | ')})` : ''}`);
    }
  }

  console.log('\n-- Profiles and no-posts job');
  const noEdu = await loadFitContext((await prisma.user.findUniqueOrThrow({ where: { email: `no-education${DEMO_DOMAIN}` } })).id);
  check('no-education: profile is incomplete', noEdu.profileComplete === false);
  const noDob = await loadFitContext((await prisma.user.findUniqueOrThrow({ where: { email: `no-dob${DEMO_DOMAIN}` } })).id);
  check('no-dob: profile is incomplete', noDob.profileComplete === false);
  const grad = await loadFitContext((await prisma.user.findUniqueOrThrow({ where: { email: `grad-cs${DEMO_DOMAIN}` } })).id);
  check('grad-cs: profile is complete', grad.profileComplete === true);
  check('no-posts job gets no verdict', bestFitForJob(grad, byKey.get('e-no-posts')!.posts as any[]) === null);

  console.log('\n-- Schedule, postponements and times');
  const postponedTwice = await getJobSchedule(byKey.get('s-postponed-twice')!.id);
  const prelims = postponedTwice.events.find((e) => e.label === 'Prelims exam');
  check('postponed twice: history has 3 rows', prelims?.history.length === 3, `got ${prelims?.history.length}`);
  check('postponed twice: shown as recently postponed', postponedTwice.recentlyChanged === true);
  check('postponed twice: latest change names the reason', !!prelims?.lastChange?.includes('Server issues'), prelims?.lastChange ?? 'none');
  check('postponed twice: final date has no time', prelims?.timeKnown === false);

  const tba = await getJobSchedule(byKey.get('s-date-tba')!.id);
  const tbaEvent = tba.events.find((e) => e.label === 'Prelims exam');
  check('date withdrawn: event has no date', tbaEvent?.at === null);
  check('date withdrawn: change reads "new date to be announced"', !!tbaEvent?.lastChange?.includes('New date to be announced'), tbaEvent?.lastChange ?? 'none');

  const timeAdded = await getJobSchedule(byKey.get('s-time-added')!.id);
  const closing = timeAdded.events.find((e) => e.kind === 'APPLICATION_CLOSE');
  check('time added later: close now has a time', closing?.timeKnown === true);
  check('time added later: not counted as a postponement', timeAdded.recentlyChanged === false);

  const postponedIds = await getRecentlyPostponedJobIds();
  check('Postponed tag: postponed jobs are tagged', postponedIds.has(byKey.get('s-postponed-twice')!.id) && postponedIds.has(byKey.get('s-date-tba')!.id));
  check('Postponed tag: a time-added job is not', !postponedIds.has(byKey.get('s-time-added')!.id));
  check('Postponed tag: ordinary jobs are not', !postponedIds.has(byKey.get('e-tenth')!.id));

  console.log('\n-- Schedule notices on the dashboard');
  const premium = await prisma.user.findUniqueOrThrow({ where: { email: `premium${DEMO_DOMAIN}` }, include: { subscription: true } });
  const notices = await getScheduleNoticesForUser(premium.id, 20);
  const noticeJobs = new Set(notices.map((n) => n.jobSlug));
  check('premium sees notices for postponed jobs they saved', noticeJobs.has('demo-s-postponed-twice'));
  check('premium sees notices for jobs they applied to', noticeJobs.has('demo-s-date-tba'));
  check('premium sees the time-added notice', noticeJobs.has('demo-s-time-added'));
  check('no notice for unchanged jobs', !noticeJobs.has('demo-e-tenth'));
  const freeSaver = await prisma.user.findUniqueOrThrow({ where: { email: `free-saver${DEMO_DOMAIN}` } });
  const freeNotices = await getScheduleNoticesForUser(freeSaver.id, 20);
  check('free user still gets notices for saved jobs', freeNotices.some((n) => n.jobSlug === 'demo-s-time-added'));

  console.log('\n-- Plans and accounts');
  const expired = await prisma.user.findUniqueOrThrow({ where: { email: `premium-expired${DEMO_DOMAIN}` }, include: { subscription: true } });
  const free = await prisma.user.findUniqueOrThrow({ where: { email: `free-saver${DEMO_DOMAIN}` }, include: { subscription: true } });
  check('premium: counts as Premium', isPremiumSubscription(premium.subscription));
  check('expired premium: counts as Free', !isPremiumSubscription(expired.subscription));
  check('free: counts as Free', !isPremiumSubscription(free.subscription));
  const deactivated = await prisma.user.findUniqueOrThrow({ where: { email: `deactivated${DEMO_DOMAIN}` } });
  check('deactivated account is inactive', deactivated.isActive === false);

  console.log('\n-- Lists and panels');
  const admit = byKey.get('x-admit-card')!;
  check('admit card job has an admit card with a future exam day', admit.admitCards.some((a) => a.examDate && a.examDate.getTime() > today.getTime()));
  check('answer key has an open objection window', byKey.get('x-answer-key')!.answerKeys.some((k) => k.objectionEndDate && k.objectionEndDate.getTime() >= today.getTime()));
  check('closed-by-final-result job has a FINAL result', byKey.get('l-closed-final')!.results.some((r) => r.resultType === 'FINAL'));
  const closeToday = byKey.get('l-closes-today')!;
  check('last-date-today job closes on today', closeToday.applicationEndDate?.getTime() === today.getTime());

  console.log(`\n${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
