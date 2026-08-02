import "dotenv/config";
import { prisma } from "../lib/prisma";

const organizations = [
  // ---------- SSC ----------
  { name: "Staff Selection Commission", shortName: "SSC", website: "https://ssc.nic.in", categorySlug: "ssc" },

  // ---------- Railway ----------
  { name: "Railway Recruitment Board", shortName: "RRB", website: "https://www.indianrailways.gov.in", categorySlug: "railway" },
  { name: "Railway Recruitment Cell", shortName: "RRC", website: null, categorySlug: "railway" },
  { name: "Konkan Railway Corporation Limited", shortName: "KRCL", website: "https://konkanrailway.com", categorySlug: "railway" },
  { name: "RailTel Corporation of India", shortName: "RAILTEL", website: "https://www.railtel.in", categorySlug: "railway" },
  { name: "Indian Railway Catering and Tourism Corporation", shortName: "IRCTC", website: "https://www.irctc.co.in", categorySlug: "railway" },
  { name: "Dedicated Freight Corridor Corporation of India", shortName: "DFCCIL", website: "https://dfccil.com", categorySlug: "railway" },
  { name: "Rail Vikas Nigam Limited", shortName: "RVNL", website: "https://rvnl.org", categorySlug: "railway" },

  // ---------- Banking ----------
  { name: "Institute of Banking Personnel Selection", shortName: "IBPS", website: "https://www.ibps.in", categorySlug: "banking" },
  { name: "State Bank of India", shortName: "SBI", website: "https://sbi.co.in", categorySlug: "banking" },
  { name: "Reserve Bank of India", shortName: "RBI", website: "https://www.rbi.org.in", categorySlug: "banking" },
  { name: "Punjab National Bank", shortName: "PNB", website: "https://www.pnbindia.in", categorySlug: "banking" },
  { name: "Union Bank of India", shortName: "UBI", website: "https://www.unionbankofindia.co.in", categorySlug: "banking" },
  { name: "Bank of Baroda", shortName: "BOB", website: "https://www.bankofbaroda.in", categorySlug: "banking" },
  { name: "Canara Bank", shortName: "CANARA", website: "https://canarabank.com", categorySlug: "banking" },
  { name: "Indian Overseas Bank", shortName: "IOB", website: "https://www.iob.in", categorySlug: "banking" },
  { name: "National Bank for Agriculture and Rural Development", shortName: "NABARD", website: "https://www.nabard.org", categorySlug: "banking" },
  { name: "Export-Import Bank of India", shortName: "EXIM", website: "https://www.eximbankindia.in", categorySlug: "banking" },
  { name: "Small Industries Development Bank of India", shortName: "SIDBI", website: "https://www.sidbi.in", categorySlug: "banking" },
  { name: "National Insurance Company Limited", shortName: "NICL", website: "https://nationalinsurance.nic.co.in", categorySlug: "banking" },
  { name: "Life Insurance Corporation of India", shortName: "LIC", website: "https://licindia.in", categorySlug: "banking" },
  { name: "New India Assurance Company Limited", shortName: "NIACL", website: "https://www.newindia.co.in", categorySlug: "banking" },
  { name: "Oriental Insurance Company Limited", shortName: "OICL", website: "https://orientalinsurance.org.in", categorySlug: "banking" },
  { name: "United India Insurance Company Limited", shortName: "UIIC", website: "https://uiic.co.in", categorySlug: "banking" },

  // ---------- UPSC ----------
  { name: "Union Public Service Commission", shortName: "UPSC", website: "https://upsc.gov.in", categorySlug: "upsc" },
  { name: "National Testing Agency", shortName: "NTA", website: "https://nta.ac.in", categorySlug: "upsc" },
  { name: "Institute of Company Secretaries of India", shortName: "ICSI", website: "https://www.icsi.edu", categorySlug: "upsc" },

  // ---------- State Government (State PSCs) ----------
  { name: "Andhra Pradesh Public Service Commission", shortName: "APPSC", website: "https://psc.ap.gov.in", categorySlug: "state-government" },
  { name: "Assam Public Service Commission", shortName: "APSC", website: "https://apsc.nic.in", categorySlug: "state-government" },
  { name: "Bihar Public Service Commission", shortName: "BPSC", website: "https://www.bpsc.bih.nic.in", categorySlug: "state-government" },
  { name: "Chhattisgarh Public Service Commission", shortName: "CGPSC", website: "https://psc.cg.gov.in", categorySlug: "state-government" },
  { name: "Goa Public Service Commission", shortName: "GPSC-Goa", website: "https://gpsc.goa.gov.in", categorySlug: "state-government" },
  { name: "Gujarat Public Service Commission", shortName: "GPSC", website: "https://gpsc.gujarat.gov.in", categorySlug: "state-government" },
  { name: "Haryana Public Service Commission", shortName: "HPSC", website: "https://hpsc.gov.in", categorySlug: "state-government" },
  { name: "Himachal Pradesh Public Service Commission", shortName: "HPPSC", website: "https://hppsc.hp.gov.in", categorySlug: "state-government" },
  { name: "Jammu & Kashmir Services Selection Board", shortName: "JKSSB", website: "https://jkssb.nic.in", categorySlug: "state-government" },
  { name: "Jharkhand Public Service Commission", shortName: "JPSC", website: "https://www.jpsc.gov.in", categorySlug: "state-government" },
  { name: "Karnataka Public Service Commission", shortName: "KPSC", website: "https://kpsc.kar.nic.in", categorySlug: "state-government" },
  { name: "Kerala Public Service Commission", shortName: "KeralaPSC", website: "https://www.keralapsc.gov.in", categorySlug: "state-government" },
  { name: "Madhya Pradesh Public Service Commission", shortName: "MPPSC", website: "https://mppsc.mp.gov.in", categorySlug: "state-government" },
  { name: "Maharashtra Public Service Commission", shortName: "MPSC", website: "https://mpsc.gov.in", categorySlug: "state-government" },
  { name: "Manipur Public Service Commission", shortName: "ManipurPSC", website: "https://mpscmanipur.gov.in", categorySlug: "state-government" },
  { name: "Odisha Staff Selection Commission", shortName: "OSSC", website: "https://ossc.gov.in", categorySlug: "state-government" },
  { name: "Odisha Subordinate Staff Selection Commission", shortName: "OSSSC", website: "https://osssc.gov.in", categorySlug: "state-government" },
  { name: "Punjab Public Service Commission", shortName: "PPSC", website: "https://ppsc.gov.in", categorySlug: "state-government" },
  { name: "Punjab Subordinate Services Selection Board", shortName: "PSSSB", website: "https://sssb.punjab.gov.in", categorySlug: "state-government" },
  { name: "Rajasthan Public Service Commission", shortName: "RPSC", website: "https://rpsc.rajasthan.gov.in", categorySlug: "state-government" },
  { name: "Rajasthan Staff Selection Board", shortName: "RSMSSB", website: "https://rsmssb.rajasthan.gov.in", categorySlug: "state-government" },
  { name: "Tamil Nadu Public Service Commission", shortName: "TNPSC", website: "https://www.tnpsc.gov.in", categorySlug: "state-government" },
  { name: "Telangana State Public Service Commission", shortName: "TSPSC", website: "https://tspsc.gov.in", categorySlug: "state-government" },
  { name: "Uttar Pradesh Public Service Commission", shortName: "UPPSC", website: "https://uppsc.up.nic.in", categorySlug: "state-government" },
  { name: "Uttar Pradesh Subordinate Services Selection Commission", shortName: "UPSSSC", website: "https://upsssc.gov.in", categorySlug: "state-government" },
  { name: "West Bengal Public Service Commission", shortName: "WBPSC", website: "https://wbpsc.gov.in", categorySlug: "state-government" },
  { name: "Delhi Subordinate Services Selection Board", shortName: "DSSSB", website: "https://dsssb.delhi.gov.in", categorySlug: "state-government" },

  // ---------- Defence ----------
  { name: "Indian Army", shortName: "ARMY", website: "https://joinindianarmy.nic.in", categorySlug: "defence" },
  { name: "Indian Navy", shortName: "NAVY", website: "https://www.joinindiannavy.gov.in", categorySlug: "defence" },
  { name: "Indian Air Force", shortName: "IAF", website: "https://indianairforce.nic.in", categorySlug: "defence" },
  { name: "Defence Research and Development Organisation", shortName: "DRDO", website: "https://www.drdo.gov.in", categorySlug: "defence" },
  { name: "Bharat Dynamics Limited", shortName: "BDL", website: "https://bdl-india.in", categorySlug: "defence" },
  { name: "Border Roads Organisation", shortName: "BRO", website: "https://bro.gov.in", categorySlug: "defence" },

  // ---------- Police & Security ----------
  { name: "Central Reserve Police Force", shortName: "CRPF", website: "https://crpf.gov.in", categorySlug: "police-security" },
  { name: "Border Security Force", shortName: "BSF", website: "https://rectt.bsf.gov.in", categorySlug: "police-security" },
  { name: "Central Industrial Security Force", shortName: "CISF", website: "https://cisfrectt.cisf.gov.in", categorySlug: "police-security" },
  { name: "Indo-Tibetan Border Police", shortName: "ITBP", website: "https://recruitment.itbpolice.nic.in", categorySlug: "police-security" },
  { name: "Sashastra Seema Bal", shortName: "SSB", website: "https://ssbrectt.gov.in", categorySlug: "police-security" },
  { name: "Assam Rifles", shortName: "ASSAMRIFLES", website: "https://assamrifles.gov.in", categorySlug: "police-security" },
  { name: "Central Bureau of Investigation", shortName: "CBI", website: "https://cbi.gov.in", categorySlug: "police-security" },
  { name: "Telangana State Level Police Recruitment Board", shortName: "TSLPRB", website: "https://www.tslprb.in", categorySlug: "police-security" },
  { name: "Uttar Pradesh Police Recruitment and Promotion Board", shortName: "UPPOLICE", website: "https://uppbpb.gov.in", categorySlug: "police-security" },
  { name: "Karnataka State Police", shortName: "KSP", website: "https://ksp.karnataka.gov.in", categorySlug: "police-security" },
  { name: "Central Selection Board of Constable (Bihar Police)", shortName: "CSBC", website: "https://csbc.bih.nic.in", categorySlug: "police-security" },

  // ---------- PSU ----------
  { name: "Indian Space Research Organisation", shortName: "ISRO", website: "https://www.isro.gov.in", categorySlug: "psu" },
  { name: "Indian Oil Corporation Limited", shortName: "IOCL", website: "https://iocl.com", categorySlug: "psu" },
  { name: "Bharat Heavy Electricals Limited", shortName: "BHEL", website: "https://www.bhel.com", categorySlug: "psu" },
  { name: "Bharat Petroleum Corporation Limited", shortName: "BPCL", website: "https://www.bharatpetroleum.in", categorySlug: "psu" },
  { name: "Hindustan Petroleum Corporation Limited", shortName: "HPCL", website: "https://www.hindustanpetroleum.com", categorySlug: "psu" },
  { name: "Oil and Natural Gas Corporation", shortName: "ONGC", website: "https://www.ongcindia.com", categorySlug: "psu" },
  { name: "National Thermal Power Corporation", shortName: "NTPC", website: "https://www.ntpc.co.in", categorySlug: "psu" },
  { name: "Coal India Limited", shortName: "CIL", website: "https://www.coalindia.in", categorySlug: "psu" },
  { name: "Steel Authority of India Limited", shortName: "SAIL", website: "https://sail.co.in", categorySlug: "psu" },
  { name: "Airports Authority of India", shortName: "AAI", website: "https://www.aai.aero", categorySlug: "psu" },
  { name: "Hindustan Aeronautics Limited", shortName: "HAL", website: "https://hal-india.co.in", categorySlug: "psu" },
  { name: "Bharat Electronics Limited", shortName: "BEL", website: "https://bel-india.in", categorySlug: "psu" },
  { name: "Mazagon Dock Shipbuilders Limited", shortName: "MDL", website: "https://www.mazagondock.in", categorySlug: "psu" },
  { name: "Cochin Shipyard Limited", shortName: "CSL", website: "https://www.cochinshipyard.in", categorySlug: "psu" },
  { name: "Container Corporation of India", shortName: "CONCOR", website: "https://www.concorindia.co.in", categorySlug: "psu" },
  { name: "NMDC Steel Limited", shortName: "NMDCSTEEL", website: "https://www.nmdcsteel.co.in", categorySlug: "psu" },
  { name: "National Aluminium Company Limited", shortName: "NALCO", website: "https://www.nalcoindia.com", categorySlug: "psu" },
  { name: "Bharat Sanchar Nigam Limited", shortName: "BSNL", website: "https://www.bsnl.co.in", categorySlug: "psu" },
  { name: "NLC India Limited", shortName: "NLC", website: "https://www.nlcindia.in", categorySlug: "psu" },
  { name: "RITES Limited", shortName: "RITES", website: "https://www.rites.com", categorySlug: "psu" },
  { name: "Indian Rare Earths Limited", shortName: "IREL", website: "https://www.irelindia.com", categorySlug: "psu" },

  // ---------- Teaching ----------
  { name: "Kendriya Vidyalaya Sangathan", shortName: "KVS", website: "https://kvsangathan.nic.in", categorySlug: "teaching" },
  { name: "Navodaya Vidyalaya Samiti", shortName: "NVS", website: "https://navodaya.gov.in", categorySlug: "teaching" },
  { name: "Central Teacher Eligibility Test Board", shortName: "CTET", website: "https://ctet.nic.in", categorySlug: "teaching" },

  // ---------- Healthcare ----------
  { name: "All India Institute of Medical Sciences", shortName: "AIIMS", website: "https://www.aiims.edu", categorySlug: "healthcare" },
  { name: "Employees' State Insurance Corporation", shortName: "ESIC", website: "https://www.esic.gov.in", categorySlug: "healthcare" },
  { name: "Indian Council of Medical Research", shortName: "ICMR", website: "https://www.icmr.gov.in", categorySlug: "healthcare" },
  { name: "National Health Mission", shortName: "NHM", website: "https://nhm.gov.in", categorySlug: "healthcare" },

  // ---------- Judiciary & Law ----------
  { name: "Delhi High Court", shortName: "DELHC", website: "https://delhihighcourt.nic.in", categorySlug: "judiciary-law" },
  { name: "Calcutta High Court", shortName: "CALHC", website: "https://www.calcuttahighcourt.gov.in", categorySlug: "judiciary-law" },
  { name: "Gauhati High Court", shortName: "GAUHC", website: "https://ghconline.gov.in", categorySlug: "judiciary-law" },
  { name: "Patna High Court", shortName: "PATNAHC", website: "https://patnahighcourt.gov.in", categorySlug: "judiciary-law" },

  // ---------- Agriculture ----------
  { name: "Indian Council of Agricultural Research", shortName: "ICAR", website: "https://icar.org.in", categorySlug: "agriculture" },

  // ---------- Postal ----------
  { name: "Department of Posts (India Post)", shortName: "INDIAPOST", website: "https://www.indiapost.gov.in", categorySlug: "postal" },
  { name: "India Post Payments Bank", shortName: "IPPB", website: "https://www.ippbonline.com", categorySlug: "postal" },

  // ---------- Anganwadi & ICDS ----------
  { name: "Ministry of Women and Child Development (ICDS)", shortName: "WCD", website: "https://wcd.nic.in", categorySlug: "anganwadi-icds" },

  // ---------- Power & Energy ----------
  { name: "Punjab State Power Corporation Limited", shortName: "PSPCL", website: "https://pspcl.in", categorySlug: "power-energy" },
  { name: "Uttar Pradesh Power Corporation Limited", shortName: "UPPCL", website: "https://uppcl.org", categorySlug: "power-energy" },
  { name: "NHPC Limited", shortName: "NHPC", website: "https://www.nhpcindia.com", categorySlug: "power-energy" },
  { name: "Power Grid Corporation of India", shortName: "PGCIL", website: "https://www.powergrid.in", categorySlug: "power-energy" },
  { name: "GAIL (India) Limited", shortName: "GAIL", website: "https://gailonline.com", categorySlug: "power-energy" },
  { name: "SJVN Limited", shortName: "SJVN", website: "https://www.sjvn.nic.in", categorySlug: "power-energy" },

  // ---------- Forest Department ----------
  { name: "Ministry of Environment, Forest and Climate Change", shortName: "MOEFCC", website: "https://moef.gov.in", categorySlug: "forest" },
];

async function main() {
  // Look up existing category IDs by slug (does NOT create categories —
  // run seed-categories.ts first)
  const dbCategories = await prisma.category.findMany();
  const categoryMap = new Map(dbCategories.map((c) => [c.slug, c.id]));

  const missingSlugs = new Set(
    organizations
      .map((o) => o.categorySlug)
      .filter((slug) => !categoryMap.has(slug))
  );
  if (missingSlugs.size > 0) {
    throw new Error(
      `Missing categories in DB: ${[...missingSlugs].join(", ")}. Run seed-categories.ts first.`
    );
  }

  for (const org of organizations) {
    const categoryId = categoryMap.get(org.categorySlug)!;
    await prisma.organization.upsert({
      where: { shortName: org.shortName },
      update: {
        name: org.name,
        website: org.website,
        categoryId,
      },
      create: {
        name: org.name,
        shortName: org.shortName,
        website: org.website,
        categoryId,
      },
    });
  }

  console.log(`Upserted ${organizations.length} organizations.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
