import { Prisma } from "@prisma/client";

export const CATEGORY_OPTIONS = [
  { slug: "all-india-govt", label: "All India Govt Jobs" }, // rule: not state-government
  {
    slug: "state-govt",
    label: "State Govt Jobs",
    real: ["state-government"],
  },
  {
    slug: "police-defence",
    label: "Police & Defence",
    real: ["police-security", "defence"],
  },
  { slug: "engineering", label: "Engineering Jobs" }, // rule: post.qualification.categories
  { slug: "ssc", label: "SSC", real: ["ssc"] },
  { slug: "railway", label: "Railway Jobs", real: ["railway"] },
  { slug: "banking", label: "Banking Jobs", real: ["banking"] },
  { slug: "upsc", label: "UPSC", real: ["upsc"] },
  {
    slug: "state-government",
    label: "State Government Jobs",
    real: ["state-government"],
  },
  { slug: "defence", label: "Defence", real: ["defence"] },
  { slug: "psu", label: "PSU", real: ["psu"] },
  {
    slug: "police-security",
    label: "Police & Security",
    real: ["police-security"],
  },
  { slug: "teaching", label: "Teaching Jobs", real: ["teaching"] },
  { slug: "healthcare", label: "Healthcare", real: ["healthcare"] },
  { slug: "judiciary-law", label: "Judiciary & Law", real: ["judiciary-law"] },
  { slug: "agriculture", label: "Agriculture", real: ["agriculture"] },
  { slug: "postal", label: "Postal", real: ["postal"] },
  {
    slug: "anganwadi-icds",
    label: "Anganwadi & ICDS",
    real: ["anganwadi-icds"],
  },
  { slug: "power-energy", label: "Power & Energy", real: ["power-energy"] },
  {
    slug: "forest",
    label: "Forest Department",
    real: ["forest-department"],
  },
] as const;

interface ResolvedCategoryFilter {
  organization?: Prisma.OrganizationWhereInput;
  post?: Prisma.PostWhereInput;
}

export function resolveCategoryFilter(
  slug: string | null | undefined,
): ResolvedCategoryFilter {
  if (!slug || slug === "all") return {};

  if (slug === "all-india-govt") {
    return {
      organization: { category: { isNot: { slug: "state-government" } } },
    };
  }

  if (slug === "engineering") {
    // Engineering isn't a Branch (Branch rows are specific streams like
    // "Computer Science Engineering", "Mechanical Engineering" -- there's
    // no Branch literally named "Engineering"). It's a QualificationCategory
    // that a post's Qualification belongs to, same relation the jobs filter
    // bar's Qualification Category dropdown already cascades off of.
    return {
      post: {
        qualification: {
          categories: { some: { slug: "engineering" } },
        },
      },
    };
  }

  const option = CATEGORY_OPTIONS.find((o) => o.slug === slug);

  if (!option || !("real" in option)) return {};

  return {
    organization: {
      category: {
        slug: { in: [...option.real] },
      },
    },
  };
}
