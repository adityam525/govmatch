import type { Change, EventDef, JobDef, PostDef } from './shared';

const post = (title: string, quals: string[], o: Partial<PostDef> = {}): PostDef => ({
  title, quals, minAge: 18, maxAge: 40, type: 'PERMANENT', vacancies: 10, ...o,
});
const ev = (kind: string, label: string, day: number | null, time?: string, changes?: Change[]): EventDef => ({ kind, label, day, time, changes });
const notified = (day: number) => ev('NOTIFICATION', 'Notification published', day);
const opens = (day: number) => ev('APPLICATION_OPEN', 'Applications open', day);
const closes = (day: number, time?: string, changes?: Change[]) => ev('APPLICATION_CLOSE', 'Applications close', day, time, changes);
const exam = (day: number, changes?: Change[], label = 'Exam') => ev('EXAM', label, day, undefined, changes);

const job = (key: string, title: string, org: string, schedule: EventDef[], extra: Partial<JobDef> & { phase: JobDef['phase'] }): JobDef => ({
  key, title: `[DEMO] ${title}`, org, schedule, posts: [post('Post', ['10th Pass'])], ...extra,
});

// Opened 10 days ago, closes in 20 days.
const live = (key: string, title: string, org: string, posts: PostDef[], extra: Partial<JobDef> = {}): JobDef =>
  job(key, title, org, [notified(-12), opens(-10), closes(20)], { phase: 'LIVE', open: true, posts, ...extra });

export const JOBS: JobDef[] = [
  // ---- Qualification, field and level
  live('e-tenth', 'Clerk, 10th pass', 'SSC', [post('Clerk', ['10th Pass'], { maxAge: 30 })]),
  live('e-twelfth', 'Assistant, 12th pass', 'SSC', [post('Assistant', ['12th Pass'], { maxAge: 27 })]),
  live('e-twelfth-obc', 'Assistant, 12th pass, OBC relaxation', 'SSC', [
    post('Assistant', ['12th Pass'], { maxAge: 27, rules: [{ category: 'OBC', status: 'NONE', years: 3 }] }),
  ]),
  live('e-graduate', 'Officer, any graduate', 'UPSC', [post('Officer', ['Any Graduate'], { maxAge: 35 })]),
  live('e-postgraduate', 'Lecturer, any post graduate', 'UPSC', [post('Lecturer', ['Any Post Graduate'])]),
  live('e-btech-cs', 'Engineer, B.Tech Computer Science', 'ISRO', [
    post('Engineer (CS)', ['B.Tech / B.E'], { field: 'Computer Science', maxAge: 32 }),
  ]),
  live('e-btech-mech', 'Engineer, B.Tech Mechanical', 'ISRO', [
    post('Engineer (Mechanical)', ['B.Tech / B.E'], { field: 'Mechanical', maxAge: 32 }),
  ]),
  live('e-diploma-civil', 'Junior Engineer, Diploma Civil', 'DSSSB', [
    post('Junior Engineer (Civil)', ['Diploma (Engineering)'], { field: 'Civil', maxAge: 30 }),
  ]),
  live('e-ma-economics', 'Economist, M.A Economics', 'UPSC', [post('Economist', ['M.A'], { field: 'Economics' })]),
  live('e-multi-post', 'Two posts with different requirements', 'DSSSB', [
    post('Junior Engineer (Civil)', ['Diploma (Engineering)'], { field: 'Civil', maxAge: 30 }),
    post('Assistant', ['Any Graduate'], { maxAge: 30 }),
  ]),
  live('e-no-posts', 'Qualifying exam with no posts', 'UPSC', [], { direct: 'Class 10th pass or equivalent from a recognised board.' }),

  // ---- Age relaxation: category, disability (by group), ex-serviceman, widow
  live('a-relaxation-all', 'Age relaxation for every group', 'SSC', [
    post('Constable', ['10th Pass'], {
      maxAge: 27,
      pwdTypes: ['LOCOMOTOR', 'VISUAL'],
      rules: [
        { category: 'OBC', status: 'NONE', years: 3 },
        { category: 'ANY', status: 'PWD', years: 10 },
        { category: 'ANY', status: 'EX_SERVICEMAN', maxAge: 50 },
        { category: 'ANY', status: 'WIDOW', maxAge: 35 },
      ],
    }),
  ]),

  // ---- Gender, home state, experience, certificates, physical standards, job type
  live('r-men-only', 'Men only', 'SSC', [post('Guard', ['10th Pass'], { gender: 'MALE' })]),
  live('r-women-only', 'Women only', 'SSC', [post('Matron', ['10th Pass'], { gender: 'FEMALE' })]),
  live('r-bihar-only', 'Residents of Bihar only', 'DSSSB', [post('Clerk', ['10th Pass'], { domicile: 'BR' })], { stateCode: 'BR' }),
  live('r-experience-certs', 'Needs 2 years and CTET', 'DSSSB', [post('Teacher', ['Any Graduate'], { minExperience: 2, certs: ['CTET'] })]),
  live('r-experience-only', 'Needs 2 years of experience', 'DSSSB', [post('Officer', ['Any Graduate'], { minExperience: 2 })]),
  live('r-police', 'Police constable (height and chest)', 'IAF', [
    post('Constable', ['12th Pass'], { gender: 'MALE', minHeight: 170, minChest: 80, maxAge: 28 }),
  ]),
  live('r-contract', 'Contract post', 'IOCL', [post('Operator', ['10th Pass'], { type: 'CONTRACT' })]),

  // ---- Lifecycle: status follows the dates
  job('l-upcoming', 'Upcoming, applications open in 10 days', 'RRB', [notified(-1), opens(10), closes(40)], { phase: 'UPCOMING' }),
  job('l-upcoming-tba', 'Announced, dates awaited', 'RRB', [notified(-2)], { status: 'UPCOMING', phase: 'UPCOMING' }),
  job('l-closes-today', 'Last date is today', 'IBPS', [notified(-22), opens(-20), closes(0)], { phase: 'LIVE', open: true }),
  job('l-closes-in-2', 'Closes in 2 days', 'IBPS', [notified(-12), opens(-10), closes(2)], { phase: 'LIVE', open: true }),
  job('l-in-progress', 'Applications closed, exam pending', 'IBPS', [opens(-60), closes(-30), exam(20)], { phase: 'LIVE', open: false }),
  job('l-closed-final', 'Closed by a final result', 'MPESB', [opens(-90), closes(-60), exam(-30)], {
    phase: 'CLOSED',
    results: [{ title: 'Final Result', type: 'FINAL', day: -5 }],
  }),
  job('l-closed-by-hand', 'Closed by an admin', 'MPESB', [opens(-40), closes(10)], { status: 'CLOSED', phase: 'CLOSED' }),
  job('l-cancelled', 'Cancelled', 'MPESB', [opens(-5), closes(25)], { status: 'CANCELLED', phase: 'CANCELLED' }),
  job('l-draft', 'Draft, not published', 'SSC', [opens(-5), closes(30)], { published: false, phase: 'LIVE', open: true }),
  // Closes at 00:01 IST today, so it has always passed unless you run this in the first minute after midnight IST.
  job('l-time-passed', 'Closing time earlier today has passed', 'SSC', [opens(-10), closes(0, '00:01')], { phase: 'LIVE', open: false }),

  // ---- Schedule changes: postponements with and without times
  job('s-postponed-twice', 'Exam postponed twice', 'UPSC', [
    notified(-12),
    opens(-10),
    closes(10),
    exam(14, [
      { kind: 'POSTPONED', daysAgo: 10, oldDay: 14, newDay: 30, newTime: '10:00', reason: 'Due to elections' },
      { kind: 'POSTPONED', daysAgo: 2, oldDay: 30, oldTime: '10:00', newDay: 45, reason: 'Server issues' },
    ], 'Prelims exam'),
  ], { phase: 'LIVE', open: true }),
  job('s-date-tba', 'Exam date withdrawn, new date awaited', 'UPSC', [
    notified(-12),
    opens(-10),
    closes(10),
    exam(20, [{ kind: 'POSTPONED', daysAgo: 1, oldDay: 20, newDay: null, reason: 'Pending court order' }], 'Prelims exam'),
  ], { phase: 'LIVE', open: true }),
  job('s-time-added', 'Closing time announced later', 'UPSC', [
    notified(-12),
    opens(-10),
    closes(7, undefined, [{ kind: 'TIME_ADDED', daysAgo: 3, oldDay: 7, newDay: 7, newTime: '17:00' }]),
  ], { phase: 'LIVE', open: true }),

  // ---- Admit cards, answer keys and results
  job('x-admit-card', 'Admit card out, exam in 5 days', 'IBPS', [opens(-30), closes(-20), exam(5)], {
    phase: 'LIVE', open: false, admitCards: [{ title: 'Admit Card', releaseDay: -1, examDay: 5 }],
  }),
  job('x-answer-key', 'Answer key with an open objection window', 'IBPS', [opens(-40), closes(-30), exam(-10)], {
    phase: 'LIVE', open: false, answerKeys: [{ title: 'Provisional Answer Key', day: -3, objectionDay: 4 }],
  }),
  job('x-result', 'Prelims result declared, job still running', 'IBPS', [opens(-50), closes(-40), exam(-20)], {
    phase: 'LIVE', open: false, results: [{ title: 'Prelims Result', type: 'PRELIMS', day: -1 }],
  }),
];
