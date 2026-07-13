import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  await prisma.organization.createMany({
    data: [
      {
        name: "Staff Selection Commission",
        shortName: "SSC",
        type: "CENTRAL_GOVT",
      },
      { name: "Railway Recruitment Board", shortName: "RRB", type: "RAILWAY" },
      {
        name: "Institute of Banking Personnel Selection",
        shortName: "IBPS",
        type: "BANKING",
      },
      {
        name: "Union Public Service Commission",
        shortName: "UPSC",
        type: "CENTRAL_GOVT",
      },
      { name: "Indian Air Force", shortName: "IAF", type: "DEFENCE_POLICE" },
      { name: "Indian Navy", shortName: "NAVY", type: "DEFENCE_POLICE" },
      {
        name: "Delhi Subordinate Services Selection Board",
        shortName: "DSSSB",
        type: "STATE_GOVT",
      },
      {
        name: "Indian Space Research Organisation",
        shortName: "ISRO",
        type: "PSU",
      },
      {
        name: "Indian Oil Corporation Limited",
        shortName: "IOCL",
        type: "PSU",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.state.createMany({
    data: [
      { name: "Uttar Pradesh", code: "UP" },
      { name: "Maharashtra", code: "MH" },
      { name: "Bihar", code: "BR" },
      { name: "Delhi", code: "DL" },
      { name: "Karnataka", code: "KA" },
    ],
    skipDuplicates: true,
  });

  await prisma.category.createMany({
    data: [
      { name: "All India Govt Jobs", slug: "all-india-govt" },
      { name: "State Govt Jobs", slug: "state-govt" },
      { name: "Bank Jobs", slug: "bank-jobs" },
      { name: "Railway Jobs", slug: "railway-jobs" },
      { name: "Teaching Jobs", slug: "teaching-jobs" },
      { name: "Police / Defence Jobs", slug: "police-defence" },
      { name: "Engineering Jobs", slug: "engineering-jobs" },
    ],
    skipDuplicates: true,
  });

  await prisma.qualification.createMany({
    data: [
      { name: "8th Pass", slug: "8th-pass", level: 1 },
      { name: "10th Pass", slug: "10th-pass", level: 2 },
      { name: "12th Pass", slug: "12th-pass", level: 3 },
      { name: "ITI", slug: "iti", level: 4 },
      { name: "Diploma", slug: "diploma", level: 5 },
      { name: "Any Graduate", slug: "any-graduate", level: 6 },
      { name: "B.Tech / B.E", slug: "btech-be", level: 6 },
      { name: "B.Com", slug: "bcom", level: 6 },
      { name: "Any Post Graduate", slug: "any-postgraduate", level: 7 },
    ],
    skipDuplicates: true,
  });

  const orgList = await prisma.organization.findMany();
  const orgs: Record<string, (typeof orgList)[number]> = {};
  for (const o of orgList) {
    orgs[o.shortName] = o;
  }

  const qualList = await prisma.qualification.findMany();
  const quals: Record<string, (typeof qualList)[number]> = {};
  for (const q of qualList) {
    quals[q.slug] = q;
  }

  const rrbTechnician = await prisma.notification.upsert({
    where: { slug: "rrb-technician-2026" },
    update: {
      title: "RRB Technician Recruitment 2026",
      totalVacancies: 6557,
      applicationEndDate: new Date("2026-08-15"),
    },
    create: {
      title: "RRB Technician Recruitment 2026",
      slug: "rrb-technician-2026",
      organizationId: orgs.RRB.id,
      advertisementNo: "CEN 02/2026",
      officialLink: "https://www.rrbapply.gov.in",
      status: "LIVE",
      applicationEndDate: new Date("2026-08-15"),
      totalVacancies: 6557,
      posts: {
        create: [
          {
            title: "Technician Grade III",
            vacancies: 6557,
            qualificationId: quals["10th-pass"].id,
            minAge: 18,
            maxAge: 33,
            payScale: "Level 2 (Rs 19900-63200)",
          },
        ],
      },
    },
  });

  const ibpsPo = await prisma.notification.upsert({
    where: { slug: "ibps-po-2026" },
    update: {
      title: "IBPS PO/MT Recruitment 2026",
      totalVacancies: 6715,
      applicationEndDate: new Date("2026-08-10"),
    },
    create: {
      title: "IBPS PO/MT Recruitment 2026",
      slug: "ibps-po-2026",
      organizationId: orgs.IBPS.id,
      officialLink: "https://www.ibps.in",
      status: "LIVE",
      applicationEndDate: new Date("2026-08-10"),
      totalVacancies: 6715,
      posts: {
        create: [
          {
            title: "Probationary Officer / Management Trainee",
            vacancies: 6715,
            qualificationId: quals["any-graduate"].id,
            minAge: 20,
            maxAge: 30,
            payScale: "Rs 52000-56000 (approx)",
          },
        ],
      },
    },
  });

  const sscAso = await prisma.notification.upsert({
    where: { slug: "ssc-aso-2026" },
    update: {
      title: "SSC Assistant Section Officer Recruitment 2026",
      totalVacancies: 341,
      applicationEndDate: new Date("2026-07-28"),
    },
    create: {
      title: "SSC Assistant Section Officer Recruitment 2026",
      slug: "ssc-aso-2026",
      organizationId: orgs.SSC.id,
      officialLink: "https://ssc.nic.in",
      status: "LIVE",
      applicationEndDate: new Date("2026-07-28"),
      totalVacancies: 341,
      posts: {
        create: [
          {
            title: "Assistant Section Officer / Assistant",
            vacancies: 341,
            qualificationId: quals["any-graduate"].id,
            minAge: 18,
            maxAge: 30,
            payScale: "Level 7 (Rs 44900-142400)",
          },
        ],
      },
    },
  });

  const navyOfficer = await prisma.notification.upsert({
    where: { slug: "indian-navy-ssc-officer-2026" },
    update: {
      title: "Indian Navy SSC Officer Recruitment 2026",
      totalVacancies: 257,
      applicationEndDate: new Date("2026-08-05"),
    },
    create: {
      title: "Indian Navy SSC Officer Recruitment 2026",
      slug: "indian-navy-ssc-officer-2026",
      organizationId: orgs.NAVY.id,
      officialLink: "https://www.joinindiannavy.gov.in",
      status: "LIVE",
      applicationEndDate: new Date("2026-08-05"),
      totalVacancies: 257,
      posts: {
        create: [
          {
            title: "Short Service Commission Officer",
            vacancies: 257,
            qualificationId: quals["btech-be"].id,
            minAge: 19,
            maxAge: 25,
            payScale: "Level 10 (Rs 56100-177500)",
          },
        ],
      },
    },
  });

  const dsssb = await prisma.notification.upsert({
    where: { slug: "dsssb-recruitment-2026" },
    update: {
      title: "DSSSB Various Vacancies Recruitment 2026",
      totalVacancies: 1979,
      applicationEndDate: new Date("2026-08-20"),
    },
    create: {
      title: "DSSSB Various Vacancies Recruitment 2026",
      slug: "dsssb-recruitment-2026",
      organizationId: orgs.DSSSB.id,
      officialLink: "https://dsssb.delhi.gov.in",
      status: "LIVE",
      applicationEndDate: new Date("2026-08-20"),
      totalVacancies: 1979,
      posts: {
        create: [
          {
            title: "Trained Graduate Teacher",
            vacancies: 1200,
            qualificationId: quals["any-graduate"].id,
            minAge: 21,
            maxAge: 30,
            payScale: "Level 7",
          },
          {
            title: "Assistant Teacher",
            vacancies: 779,
            qualificationId: quals["12th-pass"].id,
            minAge: 18,
            maxAge: 30,
            payScale: "Level 6",
          },
        ],
      },
    },
  });

  const iaf = await prisma.notification.upsert({
    where: { slug: "iaf-agniveervayu-2026" },
    update: {
      title: "IAF Agniveervayu and Airmen Group Y Recruitment 2026",
      totalVacancies: 3500,
      applicationEndDate: new Date("2026-08-01"),
    },
    create: {
      title: "IAF Agniveervayu and Airmen Group Y Recruitment 2026",
      slug: "iaf-agniveervayu-2026",
      organizationId: orgs.IAF.id,
      officialLink: "https://agnipathvayu.cdac.in",
      status: "LIVE",
      applicationEndDate: new Date("2026-08-01"),
      totalVacancies: 3500,
      posts: {
        create: [
          {
            title: "Agniveervayu",
            vacancies: 3500,
            qualificationId: quals["12th-pass"].id,
            minAge: 17,
            maxAge: 21,
            payScale: "Rs 30000 (approx)",
          },
        ],
      },
    },
  });

  const isro = await prisma.notification.upsert({
    where: { slug: "isro-istrac-2026" },
    update: {
      title: "ISRO ISTRAC Recruitment 2026",
      totalVacancies: 26,
      applicationEndDate: new Date("2026-07-25"),
    },
    create: {
      title: "ISRO ISTRAC Recruitment 2026",
      slug: "isro-istrac-2026",
      organizationId: orgs.ISRO.id,
      officialLink: "https://www.isro.gov.in",
      status: "LIVE",
      applicationEndDate: new Date("2026-07-25"),
      totalVacancies: 26,
      posts: {
        create: [
          {
            title: "Technician / Technical Assistant",
            vacancies: 26,
            qualificationId: quals.iti.id,
            minAge: 18,
            maxAge: 35,
            payScale: "Level 3-5",
          },
        ],
      },
    },
  });

  const iocl = await prisma.notification.upsert({
    where: { slug: "iocl-apprentice-2026" },
    update: {
      title: "IOCL Trade and Technician Apprentice Recruitment 2026",
      totalVacancies: 1524,
      applicationEndDate: new Date("2026-08-12"),
    },
    create: {
      title: "IOCL Trade and Technician Apprentice Recruitment 2026",
      slug: "iocl-apprentice-2026",
      organizationId: orgs.IOCL.id,
      officialLink: "https://www.iocl.com",
      status: "LIVE",
      applicationEndDate: new Date("2026-08-12"),
      totalVacancies: 1524,
      posts: {
        create: [
          {
            title: "Trade Apprentice",
            vacancies: 1000,
            qualificationId: quals.iti.id,
            minAge: 18,
            maxAge: 24,
          },
          {
            title: "Technician Apprentice",
            vacancies: 524,
            qualificationId: quals.diploma.id,
            minAge: 18,
            maxAge: 24,
          },
        ],
      },
    },
  });

  const upsc = await prisma.notification.upsert({
    where: { slug: "upsc-various-posts-2026" },
    update: {
      title: "UPSC Various Posts Recruitment 2026",
      totalVacancies: 450,
      applicationEndDate: new Date("2026-08-18"),
    },
    create: {
      title: "UPSC Various Posts Recruitment 2026",
      slug: "upsc-various-posts-2026",
      organizationId: orgs.UPSC.id,
      officialLink: "https://upsc.gov.in",
      status: "LIVE",
      applicationEndDate: new Date("2026-08-18"),
      totalVacancies: 450,
      posts: {
        create: [
          {
            title: "Drug Inspector",
            vacancies: 186,
            qualificationId: quals["any-postgraduate"].id,
            minAge: 21,
            maxAge: 35,
          },
          {
            title: "Assistant Engineer",
            vacancies: 264,
            qualificationId: quals["btech-be"].id,
            minAge: 21,
            maxAge: 30,
          },
        ],
      },
    },
  });

  await prisma.admitCard.createMany({
    data: [
      {
        notificationId: rrbTechnician.id,
        title: "RRB Technician CBT 1 Admit Card 2026",
        releaseDate: new Date("2026-07-20"),
        examDate: new Date("2026-08-05"),
        downloadLink: "https://www.rrbapply.gov.in",
      },
      {
        notificationId: sscAso.id,
        title: "SSC ASO Tier 1 Admit Card 2026",
        releaseDate: new Date("2026-07-15"),
        examDate: new Date("2026-07-30"),
        downloadLink: "https://ssc.nic.in",
      },
    ],
  });

  await prisma.result.createMany({
    data: [
      {
        notificationId: rrbTechnician.id,
        title: "RRB Group D Result 2026",
        resultType: "FINAL",
        releaseDate: new Date("2026-07-01"),
        resultLink: "https://www.rrbapply.gov.in",
      },
    ],
  });

  await prisma.answerKey.createMany({
    data: [
      {
        notificationId: sscAso.id,
        title: "SSC ASO Provisional Answer Key 2026",
        keyType: "PROVISIONAL",
        releaseDate: new Date("2026-07-22"),
        downloadLink: "https://ssc.nic.in",
      },
    ],
  });

  const graduateQual = quals["any-graduate"];
  const testUser = await prisma.user.upsert({
    where: { email: "test@govmatch.in" },
    update: {},
    create: {
      email: "test@govmatch.in",
      name: "Aditya",
      profile: {
        create: {
          dateOfBirth: new Date("2002-05-15"),
          category: "General",
          qualificationId: graduateQual ? graduateQual.id : undefined,
          degreeName: "B.E. Computer Science",
        },
      },
    },
  });

  console.log("Seed complete. Test user id:", testUser.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
