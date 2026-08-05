import "dotenv/config";
import { prisma } from "./lib/prisma";

async function main() {
  const branches = await prisma.branch.findMany({
    orderBy: [{ qualificationGroup: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true, qualificationGroup: true },
  });
  console.table(branches);
}

main().finally(() => prisma.$disconnect());
