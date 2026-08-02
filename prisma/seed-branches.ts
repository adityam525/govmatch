import "dotenv/config";
import { prisma } from "../lib/prisma";

const branches = [
  // ---------- Engineering (under B.Tech/B.E) ----------
  {
    name: "Computer Science Engineering",
    slug: "cs-engineering",
    group: "Engineering",
    qualSlug: "btech-be",
  },
  {
    name: "Information Technology",
    slug: "it-engineering",
    group: "Engineering",
    qualSlug: "btech-be",
  },
  {
    name: "Electronics & Communication Engineering",
    slug: "ece-engineering",
    group: "Engineering",
    qualSlug: "btech-be",
  },
  {
    name: "Electrical Engineering",
    slug: "electrical-engineering",
    group: "Engineering",
    qualSlug: "btech-be",
  },
  {
    name: "Electrical & Electronics Engineering",
    slug: "eee-engineering",
    group: "Engineering",
    qualSlug: "btech-be",
  },
  {
    name: "Mechanical Engineering",
    slug: "mechanical-engineering",
    group: "Engineering",
    qualSlug: "btech-be",
  },
  {
    name: "Civil Engineering",
    slug: "civil-engineering",
    group: "Engineering",
    qualSlug: "btech-be",
  },
  {
    name: "Chemical Engineering",
    slug: "chemical-engineering",
    group: "Engineering",
    qualSlug: "btech-be",
  },
  {
    name: "Automobile Engineering",
    slug: "automobile-engineering",
    group: "Engineering",
    qualSlug: "btech-be",
  },
  {
    name: "Aeronautical/Aerospace Engineering",
    slug: "aeronautical-engineering",
    group: "Engineering",
    qualSlug: "btech-be",
  },
  {
    name: "Biotechnology Engineering",
    slug: "biotech-engineering",
    group: "Engineering",
    qualSlug: "btech-be",
  },
  {
    name: "Industrial Engineering",
    slug: "industrial-engineering",
    group: "Engineering",
    qualSlug: "btech-be",
  },
  {
    name: "Instrumentation Engineering",
    slug: "instrumentation-engineering",
    group: "Engineering",
    qualSlug: "btech-be",
  },
  {
    name: "Metallurgical Engineering",
    slug: "metallurgical-engineering",
    group: "Engineering",
    qualSlug: "btech-be",
  },
  {
    name: "Mining Engineering",
    slug: "mining-engineering",
    group: "Engineering",
    qualSlug: "btech-be",
  },
  {
    name: "Production Engineering",
    slug: "production-engineering",
    group: "Engineering",
    qualSlug: "btech-be",
  },
  {
    name: "Textile Engineering",
    slug: "textile-engineering",
    group: "Engineering",
    qualSlug: "btech-be",
  },
  {
    name: "Agricultural Engineering",
    slug: "agri-engineering",
    group: "Engineering",
    qualSlug: "btech-be",
  },
  {
    name: "Marine Engineering",
    slug: "marine-engineering",
    group: "Engineering",
    qualSlug: "btech-be",
  },
  {
    name: "Petroleum Engineering",
    slug: "petroleum-engineering",
    group: "Engineering",
    qualSlug: "btech-be",
  },
  {
    name: "Environmental Engineering",
    slug: "environmental-engineering",
    group: "Engineering",
    qualSlug: "btech-be",
  },
  {
    name: "Robotics & AI Engineering",
    slug: "robotics-ai-engineering",
    group: "Engineering",
    qualSlug: "btech-be",
  },
  {
    name: "Data Science & AI/ML Engineering",
    slug: "data-science-engineering",
    group: "Engineering",
    qualSlug: "btech-be",
  },

  // ---------- Engineering (under M.Tech/M.E, mirrored) ----------
  {
    name: "M.Tech Computer Science",
    slug: "mtech-cs",
    group: "Engineering",
    qualSlug: "mtech-me",
  },
  {
    name: "M.Tech Mechanical",
    slug: "mtech-mechanical",
    group: "Engineering",
    qualSlug: "mtech-me",
  },
  {
    name: "M.Tech Civil",
    slug: "mtech-civil",
    group: "Engineering",
    qualSlug: "mtech-me",
  },
  {
    name: "M.Tech Electrical",
    slug: "mtech-electrical",
    group: "Engineering",
    qualSlug: "mtech-me",
  },
  {
    name: "M.Tech Electronics & Communication",
    slug: "mtech-ece",
    group: "Engineering",
    qualSlug: "mtech-me",
  },
  {
    name: "M.Tech Data Science & AI/ML",
    slug: "mtech-data-science",
    group: "Engineering",
    qualSlug: "mtech-me",
  },

  // ---------- Science (under B.Sc / M.Sc) ----------
  { name: "Physics", slug: "physics-bsc", group: "Science", qualSlug: "bsc" },
  {
    name: "Chemistry",
    slug: "chemistry-bsc",
    group: "Science",
    qualSlug: "bsc",
  },
  { name: "Mathematics", slug: "maths-bsc", group: "Science", qualSlug: "bsc" },
  { name: "Zoology", slug: "zoology-bsc", group: "Science", qualSlug: "bsc" },
  { name: "Botany", slug: "botany-bsc", group: "Science", qualSlug: "bsc" },
  {
    name: "Computer Science (B.Sc)",
    slug: "cs-bsc",
    group: "Science",
    qualSlug: "bsc",
  },
  {
    name: "Statistics",
    slug: "statistics-bsc",
    group: "Science",
    qualSlug: "bsc",
  },
  {
    name: "Biotechnology (B.Sc)",
    slug: "biotech-bsc",
    group: "Science",
    qualSlug: "bsc",
  },
  {
    name: "Microbiology",
    slug: "microbiology-bsc",
    group: "Science",
    qualSlug: "bsc",
  },
  {
    name: "Environmental Science",
    slug: "env-science-bsc",
    group: "Science",
    qualSlug: "bsc",
  },
  {
    name: "Physics (M.Sc)",
    slug: "physics-msc",
    group: "Science",
    qualSlug: "msc",
  },
  {
    name: "Chemistry (M.Sc)",
    slug: "chemistry-msc",
    group: "Science",
    qualSlug: "msc",
  },
  {
    name: "Mathematics (M.Sc)",
    slug: "maths-msc",
    group: "Science",
    qualSlug: "msc",
  },
  {
    name: "Biotechnology (M.Sc)",
    slug: "biotech-msc",
    group: "Science",
    qualSlug: "msc",
  },

  // ---------- Arts & Humanities (under B.A / M.A) ----------
  {
    name: "History",
    slug: "history-ba",
    group: "Arts & Humanities",
    qualSlug: "ba",
  },
  {
    name: "Political Science",
    slug: "polsci-ba",
    group: "Arts & Humanities",
    qualSlug: "ba",
  },
  {
    name: "Economics",
    slug: "economics-ba",
    group: "Arts & Humanities",
    qualSlug: "ba",
  },
  {
    name: "English Literature",
    slug: "english-ba",
    group: "Arts & Humanities",
    qualSlug: "ba",
  },
  {
    name: "Sociology",
    slug: "sociology-ba",
    group: "Arts & Humanities",
    qualSlug: "ba",
  },
  {
    name: "Psychology",
    slug: "psychology-ba",
    group: "Arts & Humanities",
    qualSlug: "ba",
  },
  {
    name: "Geography",
    slug: "geography-ba",
    group: "Arts & Humanities",
    qualSlug: "ba",
  },
  {
    name: "Philosophy",
    slug: "philosophy-ba",
    group: "Arts & Humanities",
    qualSlug: "ba",
  },
  {
    name: "Public Administration",
    slug: "public-admin-ba",
    group: "Arts & Humanities",
    qualSlug: "ba",
  },
  {
    name: "Hindi",
    slug: "hindi-ba",
    group: "Arts & Humanities",
    qualSlug: "ba",
  },
  {
    name: "History (M.A)",
    slug: "history-ma",
    group: "Arts & Humanities",
    qualSlug: "ma",
  },
  {
    name: "Political Science (M.A)",
    slug: "polsci-ma",
    group: "Arts & Humanities",
    qualSlug: "ma",
  },
  {
    name: "Economics (M.A)",
    slug: "economics-ma",
    group: "Arts & Humanities",
    qualSlug: "ma",
  },
  {
    name: "Psychology (M.A)",
    slug: "psychology-ma",
    group: "Arts & Humanities",
    qualSlug: "ma",
  },

  // ---------- Medical (under MBBS / MD-MS / BDS / BAMS / BHMS) ----------
  {
    name: "General Medicine",
    slug: "general-medicine",
    group: "Medical",
    qualSlug: "mbbs",
  },
  { name: "Surgery", slug: "surgery", group: "Medical", qualSlug: "mbbs" },
  {
    name: "Pediatrics",
    slug: "pediatrics",
    group: "Medical",
    qualSlug: "mbbs",
  },
  {
    name: "Gynaecology",
    slug: "gynaecology",
    group: "Medical",
    qualSlug: "mbbs",
  },
  {
    name: "Orthopedics",
    slug: "orthopedics",
    group: "Medical",
    qualSlug: "mbbs",
  },
  {
    name: "Dermatology",
    slug: "dermatology",
    group: "Medical",
    qualSlug: "mbbs",
  },
  { name: "Radiology", slug: "radiology", group: "Medical", qualSlug: "mbbs" },
  {
    name: "Anesthesiology",
    slug: "anesthesiology",
    group: "Medical",
    qualSlug: "mbbs",
  },
  {
    name: "Cardiology",
    slug: "cardiology",
    group: "Medical",
    qualSlug: "md-ms",
  },
  { name: "ENT", slug: "ent", group: "Medical", qualSlug: "mbbs" },
  {
    name: "Dental Surgery",
    slug: "dental-surgery",
    group: "Medical",
    qualSlug: "bds",
  },
  { name: "Ayurveda", slug: "ayurveda", group: "Medical", qualSlug: "bams" },
  {
    name: "Homeopathy",
    slug: "homeopathy",
    group: "Medical",
    qualSlug: "bhms",
  },

  // ---------- Nursing (under B.Sc Nursing / M.Sc Nursing) ----------
  {
    name: "General Nursing",
    slug: "general-nursing",
    group: "Nursing & Paramedical",
    qualSlug: "bsc-nursing",
  },
  {
    name: "Midwifery",
    slug: "midwifery",
    group: "Nursing & Paramedical",
    qualSlug: "bsc-nursing",
  },
  {
    name: "Community Health Nursing",
    slug: "community-health-nursing",
    group: "Nursing & Paramedical",
    qualSlug: "msc-nursing",
  },
  {
    name: "Psychiatric Nursing",
    slug: "psychiatric-nursing",
    group: "Nursing & Paramedical",
    qualSlug: "msc-nursing",
  },

  // ---------- Teaching (under B.Ed / M.Ed) ----------
  {
    name: "Elementary Education",
    slug: "elementary-education",
    group: "Teaching & Education",
    qualSlug: "bed",
  },
  {
    name: "Secondary Education",
    slug: "secondary-education",
    group: "Teaching & Education",
    qualSlug: "bed",
  },
  {
    name: "Special Education",
    slug: "special-education",
    group: "Teaching & Education",
    qualSlug: "bed",
  },
  {
    name: "Physical Education",
    slug: "physical-education",
    group: "Teaching & Education",
    qualSlug: "bed",
  },

  // ---------- Law (under LLB / LLM) ----------
  { name: "Criminal Law", slug: "criminal-law", group: "Law", qualSlug: "llb" },
  {
    name: "Corporate Law",
    slug: "corporate-law",
    group: "Law",
    qualSlug: "llb",
  },
  {
    name: "Constitutional Law",
    slug: "constitutional-law",
    group: "Law",
    qualSlug: "llb",
  },
  { name: "Civil Law", slug: "civil-law", group: "Law", qualSlug: "llb" },
  { name: "Cyber Law", slug: "cyber-law", group: "Law", qualSlug: "llm" },
  { name: "Labour Law", slug: "labour-law", group: "Law", qualSlug: "llm" },

  // ---------- Management (under BBA / MBA) ----------
  {
    name: "Finance",
    slug: "finance-mgmt",
    group: "Management",
    qualSlug: "mba",
  },
  {
    name: "Marketing",
    slug: "marketing-mgmt",
    group: "Management",
    qualSlug: "mba",
  },
  {
    name: "Human Resources",
    slug: "hr-mgmt",
    group: "Management",
    qualSlug: "mba",
  },
  {
    name: "Operations",
    slug: "operations-mgmt",
    group: "Management",
    qualSlug: "mba",
  },
  {
    name: "International Business",
    slug: "international-business",
    group: "Management",
    qualSlug: "mba",
  },
  {
    name: "Business Analytics",
    slug: "business-analytics",
    group: "Management",
    qualSlug: "mba",
  },

  // ---------- Computer Applications (under BCA / MCA) ----------
  {
    name: "Software Development",
    slug: "software-dev",
    group: "Computer Applications",
    qualSlug: "bca",
  },
  {
    name: "Data Science",
    slug: "data-science-bca",
    group: "Computer Applications",
    qualSlug: "bca",
  },
  {
    name: "Cyber Security",
    slug: "cyber-security",
    group: "Computer Applications",
    qualSlug: "mca",
  },
  {
    name: "Networking",
    slug: "networking",
    group: "Computer Applications",
    qualSlug: "bca",
  },
  {
    name: "AI & Machine Learning",
    slug: "ai-ml",
    group: "Computer Applications",
    qualSlug: "mca",
  },
  {
    name: "Web Development",
    slug: "web-dev",
    group: "Computer Applications",
    qualSlug: "bca",
  },

  // ---------- Agriculture (under B.Sc Agriculture) ----------
  {
    name: "Agronomy",
    slug: "agronomy",
    group: "Agriculture",
    qualSlug: "bsc-agriculture",
  },
  {
    name: "Horticulture",
    slug: "horticulture",
    group: "Agriculture",
    qualSlug: "bsc-agriculture",
  },
  {
    name: "Animal Husbandry / Veterinary Science",
    slug: "animal-husbandry",
    group: "Agriculture",
    qualSlug: "bsc-agriculture",
  },
  {
    name: "Soil Science",
    slug: "soil-science",
    group: "Agriculture",
    qualSlug: "bsc-agriculture",
  },
  {
    name: "Plant Pathology",
    slug: "plant-pathology",
    group: "Agriculture",
    qualSlug: "bsc-agriculture",
  },
  {
    name: "Agricultural Economics",
    slug: "agri-economics",
    group: "Agriculture",
    qualSlug: "bsc-agriculture",
  },

  // ---------- Pharmacy (under B.Pharm / M.Pharm) ----------
  {
    name: "Pharmaceutics",
    slug: "pharmaceutics",
    group: "Pharmacy",
    qualSlug: "bpharm",
  },
  {
    name: "Pharmacology",
    slug: "pharmacology",
    group: "Pharmacy",
    qualSlug: "bpharm",
  },
  {
    name: "Pharmaceutical Chemistry",
    slug: "pharma-chemistry",
    group: "Pharmacy",
    qualSlug: "mpharm",
  },

  // ---------- Architecture & Design (under B.Arch) ----------
  {
    name: "Urban Planning",
    slug: "urban-planning",
    group: "Architecture & Design",
    qualSlug: "barch",
  },
  {
    name: "Interior Design",
    slug: "interior-design",
    group: "Architecture & Design",
    qualSlug: "barch",
  },
  {
    name: "Landscape Architecture",
    slug: "landscape-architecture",
    group: "Architecture & Design",
    qualSlug: "barch",
  },

  // ---------- ITI Trades (under ITI) ----------
  { name: "Electrician", slug: "electrician", group: "ITI", qualSlug: "iti" },
  { name: "Fitter", slug: "fitter", group: "ITI", qualSlug: "iti" },
  { name: "Welder", slug: "welder", group: "ITI", qualSlug: "iti" },
  { name: "Turner", slug: "turner", group: "ITI", qualSlug: "iti" },
  { name: "Machinist", slug: "machinist", group: "ITI", qualSlug: "iti" },
  { name: "Plumber", slug: "plumber", group: "ITI", qualSlug: "iti" },
  { name: "Carpenter", slug: "carpenter", group: "ITI", qualSlug: "iti" },
  {
    name: "COPA (Computer Operator & Programming Assistant)",
    slug: "copa",
    group: "ITI",
    qualSlug: "iti",
  },
  {
    name: "Mechanic (Motor Vehicle)",
    slug: "mechanic-motor-vehicle",
    group: "ITI",
    qualSlug: "iti",
  },
  { name: "Wireman", slug: "wireman", group: "ITI", qualSlug: "iti" },
  {
    name: "Draughtsman (Civil)",
    slug: "draughtsman-civil",
    group: "ITI",
    qualSlug: "iti",
  },
  {
    name: "Draughtsman (Mechanical)",
    slug: "draughtsman-mechanical",
    group: "ITI",
    qualSlug: "iti",
  },
  {
    name: "Diesel Mechanic",
    slug: "diesel-mechanic",
    group: "ITI",
    qualSlug: "iti",
  },
  {
    name: "Instrument Mechanic",
    slug: "instrument-mechanic",
    group: "ITI",
    qualSlug: "iti",
  },
  {
    name: "Refrigeration & AC Mechanic",
    slug: "refrigeration-ac-mechanic",
    group: "ITI",
    qualSlug: "iti",
  },
  { name: "Surveyor", slug: "surveyor", group: "ITI", qualSlug: "iti" },
];

// Old branch rows from before this migration represented entire degrees
// (B.Com, MBBS, MBA...) as if they were specializations. That now conflicts
// with the same names existing as real Qualification rows, so they're removed.
const oldDuplicateSlugs = [
  "bcom",
  "bsc",
  "ba",
  "bba",
  "bca",
  "allied-health",
  "dental",
  "mbbs",
  "nursing",
  "pharmacy",
  "mcom",
  "msc",
  "ma",
  "mba",
  "mca",
];

// Old Engineering branch slugs that need renaming to match the new scheme.
// Only entries where old !== new actually need a rename.
const engineeringRename: Record<string, string> = {
  "computer-science": "cs-engineering",
  "electronics-engineering": "ece-engineering",
};

async function main() {
  const dbQualifications = await prisma.qualification.findMany();
  const qualMap = new Map(dbQualifications.map((q) => [q.slug, q.id]));

  const missing = new Set<string>();
  for (const b of branches) {
    if (!qualMap.has(b.qualSlug)) missing.add(b.qualSlug);
  }
  if (missing.size > 0) {
    throw new Error(`Missing qualifications: ${[...missing].join(", ")}`);
  }

  // 1. Delete old duplicate branches (degree-as-branch conflation)
  const deleted = await prisma.branch.deleteMany({
    where: { slug: { in: oldDuplicateSlugs } },
  });
  console.log(`Deleted ${deleted.count} old duplicate branches.`);

  // 2. Rename old Engineering branch slugs that changed, to avoid unique
  //    collisions when we upsert the new canonical list below.
  for (const [oldSlug, newSlug] of Object.entries(engineeringRename)) {
    const existing = await prisma.branch.findUnique({
      where: { slug: oldSlug },
    });
    if (existing) {
      await prisma.branch.update({
        where: { slug: oldSlug },
        data: { slug: newSlug },
      });
    }
  }

  // 3. Upsert full branch list (creates new ones, updates existing renamed ones)
  for (const b of branches) {
    const qualificationId = qualMap.get(b.qualSlug)!;
    await prisma.branch.upsert({
      where: { slug: b.slug },
      update: { name: b.name, qualificationGroup: b.group, qualificationId },
      create: {
        name: b.name,
        slug: b.slug,
        qualificationGroup: b.group,
        qualificationId,
      },
    });
  }

  console.log(`Upserted ${branches.length} branches.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
