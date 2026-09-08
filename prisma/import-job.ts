import "dotenv/config";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { prisma } from "../lib/prisma";

type JobPayload = {
  newOrganization?: {
    name: string;
    shortName: string;
    website?: string | null;
    categorySlug: string;
  };
  notification: {
    title: string;
    slug: string;
    published?: boolean;
    organizationShortName: string;
    advertisementNo?: string | null;
    applicationMode?: string;
    officialLink: string;
    applicationFeeGeneral?: string | null;
    applicationFeeScSt?: string | null;
    selectionProcess?: string[];
    howToApply?: string | null;
    notificationDate?: string | null;
    applicationStartDate?: string | null;
    applicationEndDate?: string | null;
    examDate?: string | null;
    status?: string;
    isFeatured?: boolean;
    categorySlugs?: string[];
    stateCodes?: string[];
    totalVacancies?: number;
  };
  posts?: any[];
  links?: any[];
  importantDates?: any[];
  faqs?: any[];
  examLevels?: any[];
  applicationFees?: any[];
  admitCards?: any[];
  results?: any[];
  answerKeys?: any[];
};

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanUrl(value: string | null | undefined): string {
  if (!value) return "";
  const match = value.match(/https?:\/\/[^\s\])">]+/);
  return match ? match[0] : value;
}

function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  return new Date(value);
}

function compactJson(value: unknown): object | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const entries = Object.entries(value as Record<string, unknown>).filter(
    ([, v]) => v !== null && v !== undefined && v !== "",
  );
  if (entries.length === 0) return null;
  return Object.fromEntries(entries);
}

function requireMap<T extends { id: string }>(
  label: string,
  slug: string,
  map: Map<string, T>,
): T {
  const found = map.get(slug);
  if (!found) {
    throw new Error(`Unknown ${label} slug: ${slug}`);
  }
  return found;
}

async function main() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    throw new Error(
      "Usage: npx tsx prisma/import-job.ts data/jobs/<file>.json",
    );
  }

  const filePath = resolve(process.cwd(), fileArg);
  const payload = JSON.parse(readFileSync(filePath, "utf8")) as JobPayload;
  const n = payload.notification;
  if (!n?.slug || !n.title || !n.organizationShortName || !n.officialLink) {
    throw new Error(
      "notification.title, slug, organizationShortName, and officialLink are required",
    );
  }

  const posts = payload.posts ?? [];
  const postVacancySum = posts.reduce(
    (sum, p) => sum + (Number(p.vacancies) || 0),
    0,
  );
  const totalVacancies = n.totalVacancies ?? postVacancySum;

  let organization = await prisma.organization.findUnique({
    where: { shortName: n.organizationShortName },
  });

  if (!organization) {
    const proposal = payload.newOrganization;
    if (!proposal) {
      throw new Error(
        `Organization ${n.organizationShortName} not found. Add a newOrganization block to the JSON.`,
      );
    }
    const category = await prisma.category.findUnique({
      where: { slug: proposal.categorySlug },
    });
    if (!category) {
      throw new Error(`Unknown category slug: ${proposal.categorySlug}`);
    }
    organization = await prisma.organization.create({
      data: {
        name: proposal.name,
        shortName: proposal.shortName,
        slug: slugify(proposal.shortName),
        website: proposal.website ?? null,
        categoryId: category.id,
      },
    });
    console.log(`Created organization ${organization.shortName}`);
  }

  const categories = n.categorySlugs?.length
    ? await prisma.category.findMany({
        where: { slug: { in: n.categorySlugs } },
      })
    : [];
  if ((n.categorySlugs?.length ?? 0) !== categories.length) {
    const found = new Set(categories.map((c) => c.slug));
    const missing = (n.categorySlugs ?? []).filter((s) => !found.has(s));
    throw new Error(`Unknown category slug(s): ${missing.join(", ")}`);
  }

  const states = n.stateCodes?.length
    ? await prisma.state.findMany({ where: { code: { in: n.stateCodes } } })
    : [];
  if ((n.stateCodes?.length ?? 0) !== states.length) {
    const found = new Set(states.map((s) => s.code));
    const missing = (n.stateCodes ?? []).filter((s) => !found.has(s));
    throw new Error(`Unknown state code(s): ${missing.join(", ")}`);
  }

  const [allQuals, allBranches, allRoles] = await Promise.all([
    prisma.qualification.findMany(),
    prisma.branch.findMany(),
    prisma.role.findMany(),
  ]);
  const qualBySlug = new Map(allQuals.map((q) => [q.slug, q]));
  const branchBySlug = new Map(allBranches.map((b) => [b.slug, b]));
  const roleBySlug = new Map(allRoles.map((r) => [r.slug, r]));

  const existing = await prisma.notification.findUnique({
    where: { slug: n.slug },
  });

  const notificationData = {
    title: n.title,
    slug: n.slug,
    published: n.published ?? false,
    organizationId: organization.id,
    advertisementNo: n.advertisementNo ?? null,
    totalVacancies,
    applicationMode: (n.applicationMode as any) ?? "ONLINE",
    officialLink: cleanUrl(n.officialLink),
    applicationFeeGeneral: n.applicationFeeGeneral ?? null,
    applicationFeeScSt: n.applicationFeeScSt ?? null,
    selectionProcess: n.selectionProcess ?? [],
    howToApply: n.howToApply ?? null,
    notificationDate: toDate(n.notificationDate),
    applicationStartDate: toDate(n.applicationStartDate),
    applicationEndDate: toDate(n.applicationEndDate),
    examDate: toDate(n.examDate),
    status: (n.status as any) ?? "LIVE",
    isFeatured: n.isFeatured ?? false,
  };

  const notification = existing
    ? await prisma.notification.update({
        where: { id: existing.id },
        data: {
          ...notificationData,
          categories: { set: categories.map((c) => ({ id: c.id })) },
          states: { set: states.map((s) => ({ id: s.id })) },
        },
      })
    : await prisma.notification.create({
        data: {
          ...notificationData,
          categories: { connect: categories.map((c) => ({ id: c.id })) },
          states: { connect: states.map((s) => ({ id: s.id })) },
        },
      });

  await prisma.$transaction([
    prisma.notificationLink.deleteMany({
      where: { notificationId: notification.id },
    }),
    prisma.importantDate.deleteMany({
      where: { notificationId: notification.id },
    }),
    prisma.notificationFAQ.deleteMany({
      where: { notificationId: notification.id },
    }),
    prisma.applicationFee.deleteMany({
      where: { notificationId: notification.id },
    }),
    prisma.admitCard.deleteMany({
      where: { notificationId: notification.id },
    }),
    prisma.result.deleteMany({ where: { notificationId: notification.id } }),
    prisma.answerKey.deleteMany({
      where: { notificationId: notification.id },
    }),
    prisma.examLevel.deleteMany({
      where: { notificationId: notification.id },
    }),
    prisma.post.deleteMany({ where: { notificationId: notification.id } }),
  ]);

  for (const post of posts) {
    const qualificationSlugs: string[] = post.qualificationSlugs ?? [];
    if (qualificationSlugs.length === 0) {
      throw new Error(`Post "${post.title}" is missing qualificationSlugs`);
    }
    const qualifications = qualificationSlugs.map((slug) =>
      requireMap("qualification", slug, qualBySlug),
    );
    const branches = (post.branchSlugs ?? []).map((slug: string) =>
      requireMap("branch", slug, branchBySlug),
    );
    const roles = (post.roleSlugs ?? []).map((slug: string) =>
      requireMap("role", slug, roleBySlug),
    );

    await prisma.post.create({
      data: {
        notificationId: notification.id,
        title: post.title,
        vacancies: Number(post.vacancies) || 0,
        qualificationId: qualifications[0].id,
        minAge: post.minAge != null ? Number(post.minAge) : null,
        maxAge: post.maxAge != null ? Number(post.maxAge) : null,
        ageRelaxationNotes: post.ageRelaxationNotes ?? null,
        ageRelaxation: compactJson(post.ageRelaxation),
        physicalCriteria: compactJson(post.physicalCriteria),
        educationDetails: post.educationDetails ?? null,
        payScale: post.payScale ?? null,
        payScaleMin: post.payScaleMin != null ? Number(post.payScaleMin) : null,
        payScaleMax: post.payScaleMax != null ? Number(post.payScaleMax) : null,
        categoryWiseVacancies: compactJson(post.categoryWiseVacancies),
        employmentType: post.employmentType ?? "PERMANENT",
        qualifications: {
          connect: qualifications.map((q) => ({ id: q.id })),
        },
        branches: { connect: branches.map((b: { id: string }) => ({ id: b.id })) },
        roles: { connect: roles.map((r: { id: string }) => ({ id: r.id })) },
      },
    });
  }

  const links = (payload.links ?? []).filter((l) => l.url);
  if (links.length) {
    await prisma.notificationLink.createMany({
      data: links.map((l, i) => ({
        notificationId: notification.id,
        label: l.label,
        url: cleanUrl(l.url),
        linkType: l.linkType || "OTHER",
        order: l.order ?? i,
      })),
    });
  }

  const dates = (payload.importantDates ?? []).filter((d) => d.label && d.date);
  if (dates.length) {
    await prisma.importantDate.createMany({
      data: dates.map((d, i) => ({
        notificationId: notification.id,
        label: d.label,
        date: new Date(d.date),
        order: d.order ?? i,
      })),
    });
  }

  const faqs = (payload.faqs ?? []).filter((f) => f.question && f.answer);
  if (faqs.length) {
    await prisma.notificationFAQ.createMany({
      data: faqs.map((f, i) => ({
        notificationId: notification.id,
        question: f.question,
        answer: f.answer,
        order: f.order ?? i,
      })),
    });
  }

  const examLevels = payload.examLevels ?? [];
  const createdLevels = [];
  for (const [i, level] of examLevels.entries()) {
    if (!level.name) continue;
    createdLevels.push(
      await prisma.examLevel.create({
        data: {
          notificationId: notification.id,
          name: level.name,
          order: level.order ?? i,
        },
      }),
    );
  }
  const levelByName = new Map(createdLevels.map((l) => [l.name, l]));

  const fees = (payload.applicationFees ?? []).filter(
    (f) => f.categoryLabel && f.amount,
  );
  if (fees.length) {
    await prisma.applicationFee.createMany({
      data: fees.map((f, i) => ({
        notificationId: notification.id,
        categoryLabel: f.categoryLabel,
        amount: f.amount,
        order: f.order ?? i,
      })),
    });
  }

  for (const card of payload.admitCards ?? []) {
    if (!card.title || !card.downloadLink) continue;
    await prisma.admitCard.create({
      data: {
        notificationId: notification.id,
        title: card.title,
        releaseDate: toDate(card.releaseDate),
        examDate: toDate(card.examDate),
        downloadLink: cleanUrl(card.downloadLink),
        examLevelId: card.examLevelName
          ? (levelByName.get(card.examLevelName)?.id ?? null)
          : null,
      },
    });
  }

  for (const result of payload.results ?? []) {
    if (!result.title || !result.resultLink) continue;
    await prisma.result.create({
      data: {
        notificationId: notification.id,
        title: result.title,
        resultType: result.resultType || "FINAL",
        releaseDate: toDate(result.releaseDate),
        resultLink: cleanUrl(result.resultLink),
        examLevelId: result.examLevelName
          ? (levelByName.get(result.examLevelName)?.id ?? null)
          : null,
      },
    });
  }

  for (const key of payload.answerKeys ?? []) {
    if (!key.title || !key.downloadLink) continue;
    await prisma.answerKey.create({
      data: {
        notificationId: notification.id,
        title: key.title,
        keyType: key.keyType || "PROVISIONAL",
        releaseDate: toDate(key.releaseDate),
        downloadLink: cleanUrl(key.downloadLink),
        objectionEndDate: toDate(key.objectionEndDate),
        examLevelId: key.examLevelName
          ? (levelByName.get(key.examLevelName)?.id ?? null)
          : null,
      },
    });
  }

  console.log(
    `Imported ${n.slug}: ${posts.length} posts, ${totalVacancies} vacancies, id=${notification.id}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
