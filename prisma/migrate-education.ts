import 'dotenv/config';
import { prisma } from '../lib/prisma';

const apply = process.argv.includes('--apply');

// Copies each profile's single qualification into the new education list. Safe to re-run:
// a user who already has education rows is skipped.
async function main() {
  const profiles = await prisma.userProfile.findMany({
    where: { qualificationId: { not: null } },
    select: { userId: true, qualificationId: true, branchId: true, yearOfPassing: true, percentage: true },
  });

  let created = 0;
  let skipped = 0;
  for (const profile of profiles) {
    const existing = await prisma.userEducation.count({ where: { userId: profile.userId } });
    if (existing > 0) { skipped++; continue; }
    console.log(`${apply ? 'creating' : 'would create'}: user ${profile.userId}`);
    if (apply) {
      await prisma.userEducation.create({
        data: {
          userId: profile.userId,
          qualificationId: profile.qualificationId as string,
          branchId: profile.branchId,
          yearOfPassing: profile.yearOfPassing,
          percentage: profile.percentage,
        },
      });
    }
    created++;
  }
  console.log(`\n${profiles.length} profiles with a qualification | ${apply ? 'created' : 'to create'}: ${created} | already migrated: ${skipped}`);
  if (!apply && created > 0) console.log('Preview only. Re-run with --apply.');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
