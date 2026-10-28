import 'dotenv/config';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { istToDate } from '../../lib/schedule';
import { fieldKey } from '../../lib/field-keys';
import { legacyRelaxationMap, parseRules } from '../../lib/special-categories';
import { DAY_MS, DEMO_DOMAIN, DEMO_LINK, DEMO_PASSWORD, dayOffset, dobForAge, type EventDef } from './shared';
import { JOBS } from './jobs';
import { USERS } from './users';

const args = process.argv.slice(2);
const CLEAN_ONLY = args.includes('--clean');
const CHECK_ONLY = args.includes('--check');

const utcDay = (offset: number) => new Date(`${dayOffset(offset)}T00:00:00.000Z`);
const momentOf = (day: number | null, time?: string) => (day === null ? null : istToDate(dayOffset(day), time ?? null));

async function clean() {
  // One record at a time: a single big delete with cascades can run past the database's
  // statement timeout, and a failed one is easy to retry.
  const users = await prisma.user.findMany({ where: { email: { endsWith: DEMO_DOMAIN } }, select: { id: true } });
  for (const u of users) await prisma.user.delete({ where: { id: u.id } });
  const jobs = await prisma.notification.findMany({ where: { slug: { startsWith: 'demo-' } }, select: { id: true } });
  for (const j of jobs) await prisma.notification.delete({ where: { id: j.id } });
  const branches = await prisma.branch.findMany({ where: { slug: { startsWith: 'demo-' } }, select: { id: true } });
  for (const b of branches) await prisma.branch.delete({ where: { id: b.id } });
  console.log(`Removed ${users.length} demo users, ${jobs.length} demo jobs, ${branches.length} demo branches.`);
}

function detectPasswordField(): string {
  return process.env.PASSWORD_FIELD ?? 'passwordHash'; // confirmed from lib/auth.ts
  // eslint-disable-next-line no-unreachable
  try {
    const model = Prisma.dmmf.datamodel.models.find((m) => m.name === 'User');
    const found = ['passwordHash', 'hashedPassword', 'password'].find((f) => model?.fields.some((x) => x.name === f));
    if (found) return found;
  } catch {
    // fall through
  }
  return 'password';
}

async function hashPassword(password: string): Promise<string> {
  for (const name of ['bcryptjs', 'bcrypt']) {
    try {
      const mod: any = await import(name);
      const lib = mod.default ?? mod;
      return await lib.hash(password, 10);
    } catch {
      // try the next one
    }
  }
  throw new Error('Neither bcryptjs nor bcrypt is installed, so demo passwords cannot be created.');
}

async function main() {
  if (CLEAN_ONLY) {
    await clean();
    return;
  }

  // ---- Look everything up first, and stop with a list if something is missing.
  const [orgRows, qualRows, stateRows] = await Promise.all([
    prisma.organization.findMany({ select: { id: true, shortName: true } }),
    prisma.qualification.findMany({ select: { id: true, name: true, level: true, categories: { select: { name: true } } } }),
    prisma.state.findMany({ select: { id: true, code: true } }),
  ]);
  const orgByShort = new Map(orgRows.map((o) => [o.shortName.toUpperCase(), o.id]));
  const qualByName = new Map(qualRows.map((q) => [q.name, q]));
  const stateByCode = new Map(stateRows.map((s) => [s.code, s.id]));

  const needOrgs = new Set(JOBS.map((j) => j.org));
  const needQuals = new Set<string>([
    ...JOBS.flatMap((j) => j.posts.flatMap((p) => p.quals)),
    ...USERS.flatMap((u) => u.education.map((e) => e.qual)),
  ]);
  const needStates = new Set<string>([
    ...JOBS.flatMap((j) => [j.stateCode, ...j.posts.map((p) => p.domicile)]),
    ...USERS.map((u) => u.domicile),
  ].filter((c): c is string => !!c));

  const missing: string[] = [];
  for (const o of needOrgs) if (!orgByShort.has(o.toUpperCase())) missing.push(`organization with short name "${o}"`);
  for (const q of needQuals) if (!qualByName.has(q)) missing.push(`qualification named "${q}"`);
  for (const s of needStates) if (!stateByCode.has(s)) missing.push(`state with code "${s}"`);
  if (missing.length > 0) {
    console.log('Cannot seed yet. These do not exist in your data:');
    missing.forEach((m) => console.log('  - ' + m));
    console.log('\nOrganizations that exist (short names):', [...orgByShort.keys()].sort().join(', '));
    console.log('Edit the names in prisma/demo/jobs.ts or users.ts to match, or add the missing record in Admin.');
    process.exit(1);
  }
  console.log('All organizations, qualifications and states were found.');
  if (CHECK_ONLY) return;

  await clean();

  // ---- Branches: use an existing one for the field, or add a demo one.
  const branchCache = new Map<string, string>();
  async function branchFor(qualName: string, field: string): Promise<string> {
    const cacheKey = `${qualName}|${fieldKey(field)}`;
    const cached = branchCache.get(cacheKey);
    if (cached) return cached;
    const qual = qualByName.get(qualName)!;
    const existing = await prisma.branch.findMany({ where: { qualificationId: qual.id }, select: { id: true, name: true } });
    const hit = existing.find((b) => fieldKey(b.name) === fieldKey(field));
    if (hit) {
      branchCache.set(cacheKey, hit.id);
      return hit.id;
    }
    const slugBase = `demo-${fieldKey(field)?.replace(/\s+/g, '-')}-${qual.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.replace(/-+$/g, '');
    const made = await prisma.branch.create({
      data: {
        name: `${field} (demo ${qual.name})`,
        slug: slugBase,
        qualificationGroup: 'Demo',
        qualification: { connect: { id: qual.id } },
      },
      select: { id: true },
    });
    branchCache.set(cacheKey, made.id);
    return made.id;
  }

  // ---- Jobs
  const jobIdByKey = new Map<string, string>();
  const now = Date.now();

  for (const def of JOBS) {
    const finalOf = (e: EventDef) => {
      const last = e.changes?.[e.changes.length - 1];
      return last ? { day: last.newDay, time: last.newTime } : { day: e.day, time: e.time };
    };
    const events = def.schedule.map((e, order) => {
      const end = finalOf(e);
      const at = momentOf(end.day, end.time);
      const history: Prisma.ScheduleChangeCreateWithoutEventInput[] = [
        {
          kind: 'ANNOUNCED',
          newAt: momentOf(e.day, e.time),
          newTimeKnown: !!e.time,
          createdAt: new Date(now - 30 * DAY_MS),
        },
        ...(e.changes ?? []).map((c) => ({
          kind: c.kind,
          oldAt: momentOf(c.oldDay, c.oldTime),
          oldTimeKnown: !!c.oldTime,
          newAt: momentOf(c.newDay, c.newTime),
          newTimeKnown: !!c.newTime,
          reason: c.reason ?? null,
          createdAt: new Date(now - c.daysAgo * DAY_MS),
        })),
      ];
      return { kind: e.kind, label: e.label, at, timeKnown: !!end.time, order, history: { create: history } };
    });

    const legacyDay = (kind: string): Date | undefined => {
      const hit = events.find((x) => x.kind === kind && x.at);
      return hit?.at ? new Date(`${istDayOf(hit.at)}T00:00:00.000Z`) : undefined;
    };

    const created = await prisma.notification.create({
      data: {
        title: def.title,
        slug: `demo-${def.key}`,
        organization: { connect: { id: orgByShort.get(def.org.toUpperCase())! } },
        officialLink: DEMO_LINK,
        status: (def.status ?? 'LIVE') as any,
        published: def.published ?? true,
        applicationMode: 'ONLINE' as any,
        totalVacancies: def.posts.reduce((sum, p) => sum + p.vacancies, 0),
        directEligibility: def.direct ?? null,
        notificationDate: legacyDay('NOTIFICATION') ?? legacyDay('APPLICATION_OPEN') ?? utcDay(0),
        applicationStartDate: legacyDay('APPLICATION_OPEN'),
        applicationEndDate: legacyDay('APPLICATION_CLOSE'),
        examDate: legacyDay('EXAM'),
        states: def.stateCode ? { connect: [{ id: stateByCode.get(def.stateCode)! }] } : undefined,
        scheduleEvents: { create: events },
      } as any,
      select: { id: true },
    });
    jobIdByKey.set(def.key, created.id);

    for (const p of def.posts) {
      const rules = parseRules((p.rules ?? []).map((r) => ({ years: null, maxAge: null, note: null, ...r }))).rules;
      const quals = p.quals.map((name) => qualByName.get(name)!);
      const branchIds = p.field ? await Promise.all(p.quals.map((name) => branchFor(name, p.field!))) : [];
      await prisma.post.create({
        data: {
          title: p.title,
          vacancies: p.vacancies,
          minAge: p.minAge,
          maxAge: p.maxAge,
          employmentType: p.type as any,
          genderRestriction: p.gender ?? null,
          minHeightCm: p.minHeight ?? null,
          minChestCm: p.minChest ?? null,
          domicileStateCode: p.domicile ?? null,
          minExperienceYears: p.minExperience ?? null,
          requiredCertifications: p.certs ?? [],
          pwdTypes: p.pwdTypes ?? [],
          relaxationRules: rules.length ? (rules as unknown as Prisma.InputJsonValue) : undefined,
          ageRelaxation: rules.length ? legacyRelaxationMap(rules) : undefined,
          notification: { connect: { id: created.id } },
          qualification: { connect: { id: quals[0].id } },
          qualifications: { connect: quals.map((q) => ({ id: q.id })) },
          branches: branchIds.length ? { connect: [...new Set(branchIds)].map((id) => ({ id })) } : undefined,
        } as any,
      });
    }

    for (const a of def.admitCards ?? []) {
      await prisma.admitCard.create({
        data: {
          notificationId: created.id,
          title: a.title,
          releaseDate: utcDay(a.releaseDay),
          examDate: a.examDay === null ? null : utcDay(a.examDay),
          downloadLink: DEMO_LINK,
        } as any,
      });
    }
    for (const r of def.results ?? []) {
      await prisma.result.create({
        data: { notificationId: created.id, title: r.title, resultType: r.type as any, releaseDate: utcDay(r.day), resultLink: DEMO_LINK } as any,
      });
    }
    for (const k of def.answerKeys ?? []) {
      await prisma.answerKey.create({
        data: {
          notificationId: created.id,
          title: k.title,
          keyType: 'PROVISIONAL' as any,
          releaseDate: utcDay(k.day),
          objectionEndDate: k.objectionDay === null ? null : utcDay(k.objectionDay),
          downloadLink: DEMO_LINK,
        } as any,
      });
    }
  }
  console.log(`Created ${JOBS.length} demo jobs.`);

  // ---- Users
  const passwordField = detectPasswordField();
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  for (const u of USERS) {
    const educations: { qualificationId: string; level: number; branchId: string | null }[] = [];
    for (const e of u.education) {
      const q = qualByName.get(e.qual)!;
      educations.push({ qualificationId: q.id, level: q.level, branchId: e.subject ? await branchFor(e.qual, e.subject) : null });
    }
    const top = [...educations].sort((a, b) => b.level - a.level)[0];

    const user = await prisma.user.create({
      data: {
        email: `${u.key}${DEMO_DOMAIN}`,
        name: u.name,
        isActive: u.active !== false,
        [passwordField]: passwordHash,
      } as any,
      select: { id: true },
    });

    await prisma.userProfile.create({
      data: {
        userId: user.id,
        dateOfBirth: u.age === null ? null : dobForAge(u.age),
        category: u.category,
        gender: u.gender,
        phoneNumber: '9876543210',
        qualificationId: top?.qualificationId ?? null,
        branchId: top?.branchId ?? null,
        disabilityTypes: u.disability?.types ?? [],
        disabilityPercent: u.disability?.percent ?? null,
        specialStatuses: u.statuses ?? [],
        domicileStateCode: u.domicile ?? null,
        experienceYears: u.experience ?? null,
        certifications: u.certs ?? [],
        heightCm: u.height ?? null,
        chestCm: u.chest ?? null,
        preferredEmploymentTypes: (u.prefTypes ?? []) as any,
      } as any,
    });

    for (const e of educations) {
      await prisma.userEducation.create({ data: { userId: user.id, qualificationId: e.qualificationId, branchId: e.branchId } });
    }

    if (u.plan) {
      const premium = u.plan !== 'FREE';
      await prisma.subscription.create({
        data: {
          userId: user.id,
          plan: (premium ? 'PREMIUM' : 'FREE') as any,
          status: 'ACTIVE' as any,
          expiresAt: u.plan === 'PREMIUM_60' ? new Date(now + 60 * DAY_MS) : u.plan === 'PREMIUM_EXPIRED' ? new Date(now - 5 * DAY_MS) : null,
        } as any,
      });
    }
    for (const key of u.saved ?? []) {
      await prisma.savedJob.create({ data: { userId: user.id, notificationId: jobIdByKey.get(key)! } as any });
    }
    for (const key of u.applied ?? []) {
      await prisma.application.create({ data: { userId: user.id, notificationId: jobIdByKey.get(key)!, status: 'APPLIED' } as any });
    }
  }
  console.log(`Created ${USERS.length} demo users (password ${DEMO_PASSWORD}, written to the "${passwordField}" column).`);
  console.log(`Log in as, for example, premium${DEMO_DOMAIN} or grad-cs${DEMO_DOMAIN}.`);
  console.log('Remove everything with: npx tsx prisma/demo/seed.ts --clean');
}

// The IST calendar day of a moment, as YYYY-MM-DD.
function istDayOf(d: Date): string {
  return new Date(d.getTime() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
