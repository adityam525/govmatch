import "dotenv/config";
import { prisma } from "../lib/prisma";

const qualifications = [
  { name: "8th Pass", slug: "8th-pass", level: 1, categorySlugs: ["8th-pass"] },
  { name: "10th Pass", slug: "10th-pass", level: 2, categorySlugs: ["10th-pass"] },
  { name: "12th Pass", slug: "12th-pass", level: 3, categorySlugs: ["12th-pass"] },
  { name: "ITI", slug: "iti", level: 4, categorySlugs: ["iti"] },
  { name: "Apprentice (ITI Trade)", slug: "apprentice-iti", level: 4, categorySlugs: ["apprentice"] },

  { name: "Diploma (Engineering)", slug: "diploma", level: 5, categorySlugs: ["diploma", "engineering"] },
  { name: "Diploma in Pharmacy", slug: "diploma-pharmacy", level: 5, categorySlugs: ["diploma", "pharmacy"] },
  { name: "Diploma in Education (D.El.Ed)", slug: "diploma-education", level: 5, categorySlugs: ["diploma", "teaching-education"] },
  { name: "Diploma in Nursing (GNM)", slug: "diploma-nursing", level: 5, categorySlugs: ["diploma", "nursing-paramedical"] },

  { name: "Any Graduate", slug: "any-graduate", level: 6, categorySlugs: ["graduate"] },
  { name: "B.Tech / B.E", slug: "btech-be", level: 6, categorySlugs: ["graduate", "engineering"] },
  { name: "B.Sc", slug: "bsc", level: 6, categorySlugs: ["graduate", "science"] },
  { name: "B.Com", slug: "bcom", level: 6, categorySlugs: ["graduate", "commerce"] },
  { name: "B.A", slug: "ba", level: 6, categorySlugs: ["graduate", "arts-humanities"] },
  { name: "BBA", slug: "bba", level: 6, categorySlugs: ["graduate", "management"] },
  { name: "BCA", slug: "bca", level: 6, categorySlugs: ["graduate", "computer-applications"] },
  { name: "B.Pharm", slug: "bpharm", level: 6, categorySlugs: ["graduate", "pharmacy"] },
  { name: "B.Arch", slug: "barch", level: 6, categorySlugs: ["graduate", "architecture-design"] },
  { name: "LLB", slug: "llb", level: 6, categorySlugs: ["graduate", "law"] },
  { name: "B.Ed", slug: "bed", level: 6, categorySlugs: ["graduate", "teaching-education"] },
  { name: "MBBS", slug: "mbbs", level: 6, categorySlugs: ["graduate", "medical"] },
  { name: "BDS", slug: "bds", level: 6, categorySlugs: ["graduate", "medical"] },
  { name: "BAMS", slug: "bams", level: 6, categorySlugs: ["graduate", "medical"] },
  { name: "BHMS", slug: "bhms", level: 6, categorySlugs: ["graduate", "medical"] },
  { name: "B.Sc Nursing", slug: "bsc-nursing", level: 6, categorySlugs: ["graduate", "nursing-paramedical"] },
  { name: "B.Sc Agriculture", slug: "bsc-agriculture", level: 6, categorySlugs: ["graduate", "agriculture-qual"] },
  { name: "BHM (Hotel Management)", slug: "bhm", level: 6, categorySlugs: ["graduate", "hotel-management"] },

  { name: "Any Post Graduate", slug: "any-postgraduate", level: 7, categorySlugs: ["post-graduate"] },
  { name: "M.Tech / M.E", slug: "mtech-me", level: 7, categorySlugs: ["post-graduate", "engineering"] },
  { name: "M.Sc", slug: "msc", level: 7, categorySlugs: ["post-graduate", "science"] },
  { name: "M.Com", slug: "mcom", level: 7, categorySlugs: ["post-graduate", "commerce"] },
  { name: "M.A", slug: "ma", level: 7, categorySlugs: ["post-graduate", "arts-humanities"] },
  { name: "MBA", slug: "mba", level: 7, categorySlugs: ["post-graduate", "management"] },
  { name: "MCA", slug: "mca", level: 7, categorySlugs: ["post-graduate", "computer-applications"] },
  { name: "LLM", slug: "llm", level: 7, categorySlugs: ["post-graduate", "law"] },
  { name: "M.Ed", slug: "med", level: 7, categorySlugs: ["post-graduate", "teaching-education"] },
  { name: "M.Pharm", slug: "mpharm", level: 7, categorySlugs: ["post-graduate", "pharmacy"] },
  { name: "MD / MS", slug: "md-ms", level: 7, categorySlugs: ["post-graduate", "medical"] },
  { name: "M.Sc Nursing", slug: "msc-nursing", level: 7, categorySlugs: ["post-graduate", "nursing-paramedical"] },

  { name: "PhD", slug: "phd", level: 8, categorySlugs: ["doctorate"] },
];

async function main() {
  const dbCategories = await prisma.qualificationCategory.findMany();
  const categoryMap = new Map(dbCategories.map((c) => [c.slug, c.id]));

  const missing = new Set<string>();
  for (const q of qualifications) {
    for (const slug of q.categorySlugs) {
      if (!categoryMap.has(slug)) missing.add(slug);
    }
  }
  if (missing.size > 0) {
    throw new Error(`Missing categories: ${[...missing].join(", ")}. Run seed-qualification-categories.ts first.`);
  }

  for (const q of qualifications) {
    await prisma.qualification.upsert({
      where: { slug: q.slug },
      update: {
        name: q.name,
        level: q.level,
        categories: {
          set: [],
          connect: q.categorySlugs.map((slug) => ({ id: categoryMap.get(slug)! })),
        },
      },
      create: {
        name: q.name,
        slug: q.slug,
        level: q.level,
        categories: {
          connect: q.categorySlugs.map((slug) => ({ id: categoryMap.get(slug)! })),
        },
      },
    });
  }

  console.log(`Upserted ${qualifications.length} qualifications.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
