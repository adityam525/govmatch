import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function upsertCategory(name: string, slug: string) {
  return prisma.category.upsert({
    where: { slug },
    update: {},
    create: { name, slug },
  });
}

async function upsertBranch(name: string, slug: string, qualificationGroup: string) {
  return prisma.branch.upsert({
    where: { slug },
    update: {},
    create: { name, slug, qualificationGroup },
  });
}

async function upsertRole(name: string, slug: string) {
  return prisma.role.upsert({
    where: { slug },
    update: {},
    create: { name, slug },
  });
}

async function main() {
  // ---------------- Categories (Sectors) ----------------
  const categoryData: [string, string][] = [
    ['SSC', 'ssc'],
    ['Railway', 'railway'],
    ['Banking', 'banking'],
    ['UPSC', 'upsc'],
    ['State Government', 'state-government'],
    ['Defence', 'defence'],
    ['PSU', 'psu'],
    ['Police & Security', 'police-security'],
    ['Teaching', 'teaching'],
    ['Healthcare', 'healthcare'],
    ['Judiciary & Law', 'judiciary-law'],
    ['Agriculture', 'agriculture'],
  ];
  for (const [name, slug] of categoryData) {
    await upsertCategory(name, slug);
  }
  console.log('Categories done');

  // ---------------- Branches ----------------
  const branchData: [string, string, string][] = [
    ['Computer Science', 'computer-science', 'Engineering'],
    ['Civil Engineering', 'civil-engineering', 'Engineering'],
    ['Mechanical Engineering', 'mechanical-engineering', 'Engineering'],
    ['Electrical Engineering', 'electrical-engineering', 'Engineering'],
    ['Electronics Engineering', 'electronics-engineering', 'Engineering'],
    ['Chemical Engineering', 'chemical-engineering', 'Engineering'],
    ['Automobile Engineering', 'automobile-engineering', 'Engineering'],
    ['MBBS', 'mbbs', 'Medical'],
    ['Nursing', 'nursing', 'Medical'],
    ['Pharmacy', 'pharmacy', 'Medical'],
    ['Dental', 'dental', 'Medical'],
    ['Allied Health', 'allied-health', 'Medical'],
    ['BA', 'ba', 'Graduate'],
    ['B.Com', 'bcom', 'Graduate'],
    ['B.Sc', 'bsc', 'Graduate'],
    ['BCA', 'bca', 'Graduate'],
    ['BBA', 'bba', 'Graduate'],
    ['MBA', 'mba', 'Post Graduate'],
    ['MCA', 'mca', 'Post Graduate'],
    ['M.Sc', 'msc', 'Post Graduate'],
    ['MA', 'ma', 'Post Graduate'],
    ['M.Com', 'mcom', 'Post Graduate'],
  ];
  for (const [name, slug, group] of branchData) {
    await upsertBranch(name, slug, group);
  }
  console.log('Branches done');

  // ---------------- Roles ----------------
  const roleData: [string, string][] = [
    ['Clerk', 'clerk'],
    ['Officer', 'officer'],
    ['Engineer', 'engineer'],
    ['Teacher', 'teacher'],
    ['Doctor', 'doctor'],
    ['Technician', 'technician'],
    ['Manager', 'manager'],
    ['Assistant', 'assistant'],
    ['Analyst', 'analyst'],
    ['Scientist', 'scientist'],
    ['Inspector', 'inspector'],
    ['Programmer', 'programmer'],
    ['Accountant', 'accountant'],
    ['Nurse', 'nurse'],
    ['Soldier', 'soldier'],
  ];
  for (const [name, slug] of roleData) {
    await upsertRole(name, slug);
  }
  console.log('Roles done');

  // ---------------- Backfill Organizations with categoryId ----------------
  const categories = await prisma.category.findMany();
  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  const orgCategoryMap: Record<string, string> = {
    SSC: 'ssc',
    RRB: 'railway',
    IBPS: 'banking',
    UPSC: 'upsc',
    IAF: 'defence',
    NAVY: 'defence',
    DSSSB: 'state-government',
    ISRO: 'psu',
    IOCL: 'psu',
  };

  for (const [shortName, catSlug] of Object.entries(orgCategoryMap)) {
    const categoryId = catMap[catSlug];
    if (!categoryId) continue;
    await prisma.organization.updateMany({
      where: { shortName },
      data: { categoryId },
    });
  }
  console.log('Organization category backfill done');

  // ---------------- Backfill Post roles ----------------
  const technicianRole = await prisma.role.findUnique({ where: { slug: 'technician' } });
  const officerRole = await prisma.role.findUnique({ where: { slug: 'officer' } });
  const engineerRole = await prisma.role.findUnique({ where: { slug: 'engineer' } });

  const iaf = await prisma.notification.findUnique({ where: { slug: 'iaf-agniveervayu-2026' }, include: { posts: true } });
  if (iaf?.posts[0] && technicianRole) {
    await prisma.post.update({
      where: { id: iaf.posts[0].id },
      data: { roles: { connect: [{ id: technicianRole.id }] } },
    });
  }

  const ibps = await prisma.notification.findUnique({ where: { slug: 'ibps-po-2026' }, include: { posts: true } });
  if (ibps?.posts[0] && officerRole) {
    await prisma.post.update({
      where: { id: ibps.posts[0].id },
      data: { roles: { connect: [{ id: officerRole.id }] } },
    });
  }

  const upsc = await prisma.notification.findUnique({ where: { slug: 'upsc-various-posts-2026' }, include: { posts: true } });
  if (upsc?.posts[1] && engineerRole) {
    await prisma.post.update({
      where: { id: upsc.posts[1].id },
      data: { roles: { connect: [{ id: engineerRole.id }] } },
    });
  }
  console.log('Post role backfill done');

  console.log('Taxonomy seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
