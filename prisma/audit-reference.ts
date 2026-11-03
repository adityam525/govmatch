import 'dotenv/config';
import { prisma } from '../lib/prisma';

const db = prisma as any;
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const STATES = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'];

const ORGS = ['SSC', 'UPSC', 'IBPS', 'SBI', 'RBI', 'RRB', 'NABARD', 'LIC', 'EPFO', 'ESIC', 'DRDO', 'ISRO', 'BARC', 'AAI', 'FCI', 'IOCL', 'ONGC', 'NTPC', 'BHEL', 'SAIL', 'GAIL', 'Coal India', 'BSNL', 'India Post', 'CRPF', 'BSF', 'CISF', 'ITBP', 'SSB', 'Assam Rifles', 'NDA', 'Indian Army', 'Indian Navy', 'Indian Air Force', 'DSSSB', 'KVS', 'NVS', 'AIIMS', 'ICMR', 'NTA', 'CBSE', 'UGC', 'IRCTC', 'DMRC', 'HPCL', 'BPCL', 'PGCIL', 'NHPC', 'RITES', 'IRCON', 'BEL', 'HAL', 'MPESB', 'UPPSC', 'BPSC', 'RPSC', 'MPPSC', 'TNPSC', 'KPSC', 'MPSC', 'WBPSC', 'HPSC', 'PPSC', 'GPSC', 'OPSC', 'APPSC', 'TSPSC', 'UKPSC', 'JPSC', 'CGPSC', 'Kerala PSC', 'UPSSSC', 'UP Police', 'Bihar Police', 'Delhi Police', 'Rajasthan Police'];

const QUALS = ['8th Pass', '10th Pass', '12th Pass', 'ITI', 'Apprentice (ITI Trade)', 'Diploma', 'Diploma in Pharmacy', 'Diploma in Nursing (GNM)', 'Diploma in Education (D.El.Ed)', 'Any Graduate', 'B.A', 'B.Com', 'B.Sc', 'B.Tech / B.E', 'BBA', 'BCA', 'B.Ed', 'B.Pharm', 'B.Arch', 'LLB', 'MBBS', 'BDS', 'BAMS', 'BHMS', 'B.Sc Nursing', 'B.Sc Agriculture', 'BHM (Hotel Management)', 'Any Post Graduate', 'M.A', 'M.Com', 'M.Sc', 'M.Tech / M.E', 'MBA', 'MCA', 'M.Ed', 'M.Pharm', 'LLM', 'MD / MS', 'M.Sc Nursing', 'PhD', 'CA / CMA / CS', 'BPT', 'B.Lib', 'M.Lib', 'B.Voc', 'M.Phil', 'B.Sc (Forestry)', 'BVSc', 'DNB', 'PGDM'];

const ROLES_HINT = 6;

async function count(model: string) {
  try { return await db[model].count(); } catch { return -1; }
}

async function main() {
  for (const m of ['organization', 'state', 'category', 'qualification', 'qualificationCategory', 'branch', 'role', 'notification']) {
    const n = await count(m);
    console.log(`${m.padEnd(24)} ${n < 0 ? 'model not found' : n}`);
  }

  const states: any[] = await db.state.findMany();
  const haveStates = new Set(states.map((s) => norm(s.name)));
  const missingStates = STATES.filter((s) => !haveStates.has(norm(s)));
  console.log(`\nSTATES: ${states.length} in database. Missing from the 36: ${missingStates.length}`);
  missingStates.forEach((s) => console.log('  - ' + s));
  console.log('  Existing codes: ' + states.map((s) => s.code).sort().join(', '));

  const orgs: any[] = await db.organization.findMany();
  const haveOrg = new Set(orgs.flatMap((o) => [norm(o.name ?? ''), norm(o.shortName ?? '')]));
  const missingOrgs = ORGS.filter((o) => !haveOrg.has(norm(o)));
  console.log(`\nORGANIZATIONS: ${orgs.length} in database. Checklist entries not found: ${missingOrgs.length}`);
  console.log('  ' + missingOrgs.join(', '));
  const noCategory = orgs.filter((o) => !o.categoryId);
  const noWebsite = orgs.filter((o) => !o.website);
  const noLogo = orgs.filter((o) => !o.logoUrl);
  console.log(`  without a sector: ${noCategory.length} | without a website: ${noWebsite.length} | without a logo: ${noLogo.length}`);
  if (noCategory.length) console.log('  no sector: ' + noCategory.slice(0, 25).map((o) => o.shortName ?? o.name).join(', '));
  const suspicious = orgs.filter((o) => /example|test|dummy|replace/i.test(`${o.name} ${o.shortName}`));
  if (suspicious.length) console.log('  looks like test data: ' + suspicious.map((o) => o.name).join(', '));

  const cats: any[] = await db.category.findMany();
  console.log(`\nSECTORS: ${cats.map((c) => c.name).join(', ') || 'none'}`);

  const quals: any[] = await db.qualification.findMany({ include: { branches: { select: { id: true } }, categories: { select: { name: true } } } });
  const haveQual = new Set(quals.map((q) => norm(q.name)));
  const missingQuals = QUALS.filter((q) => !haveQual.has(norm(q)));
  console.log(`\nQUALIFICATIONS: ${quals.length} in database. Checklist entries not found: ${missingQuals.length}`);
  missingQuals.forEach((q) => console.log('  - ' + q));
  const noBranch = quals.filter((q) => q.branches.length === 0 && q.level >= 5 && !/^any\b/i.test(q.name));
  console.log(`  level 5+ qualifications with no branches: ${noBranch.length}`);
  console.log('  ' + noBranch.map((q) => q.name).join(', '));
  const noCat = quals.filter((q) => q.categories.length === 0);
  console.log(`  without an education type: ${noCat.length} ${noCat.map((q) => q.name).join(', ')}`);

  const roles = await count('role');
  if (roles >= 0) console.log(`\nROLES: ${roles} (expect at least ${ROLES_HINT})`);
  const posts = await count('post');
  console.log(`\nPosts without any qualification link are not checked here. Posts in total: ${posts}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
