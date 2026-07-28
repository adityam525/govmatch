import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  await prisma.organization.createMany({
    data: [
      { name: "Staff Selection Commission", shortName: "SSC" },
      { name: "Railway Recruitment Board", shortName: "RRB" },
      { name: "Institute of Banking Personnel Selection", shortName: "IBPS" },
      { name: "Union Public Service Commission", shortName: "UPSC" },
      { name: "Indian Air Force", shortName: "IAF" },
      { name: "Indian Navy", shortName: "NAVY" },
      { name: "Delhi Subordinate Services Selection Board", shortName: "DSSSB" },
      { name: "Indian Space Research Organisation", shortName: "ISRO" },
      { name: "Indian Oil Corporation Limited", shortName: "IOCL" },
    ],
    skipDuplicates: true,
  });

  console.log("Organizations seeded. Run seed-taxonomy.ts to assign categories.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
