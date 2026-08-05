import "dotenv/config";
import { prisma } from "../lib/prisma";

const categories = [
  { name: "SSC", slug: "ssc" },
  { name: "Railway", slug: "railway" },
  { name: "Banking", slug: "banking" },
  { name: "UPSC", slug: "upsc" },
  { name: "State Government", slug: "state-government" },
  { name: "Defence", slug: "defence" },
  { name: "PSU", slug: "psu" },
  { name: "Police & Security", slug: "police-security" },
  { name: "Teaching", slug: "teaching" },
  { name: "Healthcare", slug: "healthcare" },
  { name: "Judiciary & Law", slug: "judiciary-law" },
  { name: "Agriculture", slug: "agriculture" },
  { name: "Postal", slug: "postal" },
  { name: "Anganwadi & ICDS", slug: "anganwadi-icds" },
  { name: "Power & Energy", slug: "power-energy" },
  { name: "Forest Department", slug: "forest" },
];

async function main() {
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: cat,
    });
  }
  console.log(`Upserted ${categories.length} categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
