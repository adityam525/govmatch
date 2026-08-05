import "dotenv/config";
import { prisma } from "../lib/prisma";

const categories = [
  { name: "8th Pass", slug: "8th-pass", order: 1 },
  { name: "10th Pass", slug: "10th-pass", order: 2 },
  { name: "12th Pass", slug: "12th-pass", order: 3 },
  { name: "ITI", slug: "iti", order: 4 },
  { name: "Apprentice", slug: "apprentice", order: 5 },
  { name: "Diploma", slug: "diploma", order: 6 },
  { name: "Graduate", slug: "graduate", order: 7 },
  { name: "Post Graduate", slug: "post-graduate", order: 8 },
  { name: "Doctorate", slug: "doctorate", order: 9 },
  { name: "Engineering", slug: "engineering", order: 10 },
  { name: "Medical", slug: "medical", order: 11 },
  { name: "Nursing & Paramedical", slug: "nursing-paramedical", order: 12 },
  { name: "Teaching & Education", slug: "teaching-education", order: 13 },
  { name: "Law", slug: "law", order: 14 },
  { name: "Management", slug: "management", order: 15 },
  { name: "Commerce", slug: "commerce", order: 16 },
  { name: "Science", slug: "science", order: 17 },
  { name: "Arts & Humanities", slug: "arts-humanities", order: 18 },
  { name: "Computer Applications", slug: "computer-applications", order: 19 },
  { name: "Agriculture", slug: "agriculture-qual", order: 20 },
  { name: "Pharmacy", slug: "pharmacy", order: 21 },
  { name: "Architecture & Design", slug: "architecture-design", order: 22 },
  { name: "Hotel Management", slug: "hotel-management", order: 23 },
];

async function main() {
  for (const cat of categories) {
    await prisma.qualificationCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, order: cat.order },
      create: cat,
    });
  }
  console.log(`Upserted ${categories.length} qualification categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
