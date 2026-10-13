import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import { prisma } from '../lib/prisma';

const OUT = '/tmp/job-extraction-prompt.txt';

async function main() {
  const [orgs, states, quals, branches, roles] = await Promise.all([
    prisma.organization.findMany({ select: { shortName: true, name: true }, orderBy: { shortName: 'asc' } }),
    prisma.state.findMany({ select: { name: true }, orderBy: { name: 'asc' } }),
    prisma.qualification.findMany({ select: { slug: true }, orderBy: { level: 'asc' } }),
    prisma.branch.findMany({ select: { slug: true }, orderBy: { slug: 'asc' } }),
    prisma.role.findMany({ select: { name: true }, orderBy: { name: 'asc' } }),
  ]);

  const prompt = `You are converting ONE official Indian government recruitment notification into JSON for an import tool.

RULES
1. Use only facts stated in the notification text I paste after "NOTIFICATION TEXT:". If something is not stated, leave that field out. Never guess, estimate or invent dates, fees, vacancies, age limits, pay scales or links.
2. Reply with a single JSON object and nothing else: no explanation, no markdown fences.
3. Dates must be YYYY-MM-DD. If only a month or year is given, leave the date out.
4. organization, state, qualifications, branches and role must be copied exactly from the allowed lists below. If nothing fits, leave the field out and describe the problem in "_notes".
5. Put anything uncertain, ambiguous or unmatched in a "_notes" string on that job. The importer ignores it, but I will read it.
6. If the notification has no separate posts (for example a qualifying exam such as PET or CET), leave "posts" out and put the eligibility sentence in "directEligibility".
7. minAge and maxAge are whole numbers for the general category. Do not add age relaxation to them.
8. officialLink must be a URL that appears in the notification. If none appears, leave it out.
9. Leave "status" out. For states: leave "state" out for all-India notifications.

OUTPUT SHAPE (only title, organization and officialLink are required)
{
  "jobs": [
    {
      "title": "",
      "organization": "",
      "officialLink": "",
      "advertisementNo": "",
      "applicationMode": "ONLINE | OFFLINE | BOTH",
      "state": "",
      "notificationDate": "YYYY-MM-DD",
      "applicationStartDate": "YYYY-MM-DD",
      "applicationEndDate": "YYYY-MM-DD",
      "examDate": "YYYY-MM-DD",
      "howToApply": "",
      "directEligibility": "",
      "selectionProcess": ["step one", "step two"],
      "fees": [{ "category": "General/OBC/EWS", "amount": "Rs 100" }],
      "links": [{ "label": "", "url": "", "type": "APPLY_ONLINE | NOTIFICATION_PDF | OFFICIAL_WEBSITE | ADMIT_CARD | RESULT | SYLLABUS | SHORT_NOTICE | OTHER" }],
      "importantDates": [{ "label": "", "date": "YYYY-MM-DD" }],
      "faqs": [{ "question": "", "answer": "" }],
      "posts": [
        {
          "title": "",
          "vacancies": 0,
          "minAge": 18,
          "maxAge": 27,
          "payScale": "",
          "employmentType": "PERMANENT | CONTRACT | APPRENTICE | INTERNSHIP | TEMPORARY | DEPUTATION",
          "qualifications": ["slug-from-list"],
          "branches": ["slug-from-list"],
          "role": ""
        }
      ],
      "_notes": ""
    }
  ]
}

ALLOWED ORGANIZATIONS (use the short name before the dash)
${orgs.map((o) => `${o.shortName} - ${o.name}`).join('\n')}

ALLOWED STATES
${states.map((s) => s.name).join(', ')}

ALLOWED QUALIFICATION SLUGS
${quals.map((q) => q.slug).join(', ')}

ALLOWED BRANCH SLUGS
${branches.map((b) => b.slug).join(', ')}

ALLOWED ROLES
${roles.map((r) => r.name).join(', ')}

NOTIFICATION TEXT:
`;

  writeFileSync(OUT, prompt);
  console.log(`Wrote ${OUT} (${orgs.length} organizations, ${states.length} states, ${quals.length} qualifications, ${branches.length} branches, ${roles.length} roles).`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
