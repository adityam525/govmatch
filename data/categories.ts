import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export interface Category {
  id: string;
  title: string;
  description: string;
  iconName:
    | "crown"
    | "train"
    | "landmark"
    | "ashoka"
    | "building"
    | "shield"
    | "factory";
  colorKey: "amber" | "red" | "sky" | "purple" | "green" | "orange";
  searchKeyword: string;
  slug: string;
}

type CategoryMeta = Pick<Category, "description" | "iconName" | "colorKey">;

const DEFAULT_META: CategoryMeta = {
  description: "Government job opportunities",
  iconName: "building",
  colorKey: "amber",
};

const CATEGORY_META: Record<string, CategoryMeta> = {
  ssc: {
    description: "Staff Selection Commission jobs",
    iconName: "crown",
    colorKey: "amber",
  },
  rrb: {
    description: "Railway Recruitment Board jobs",
    iconName: "train",
    colorKey: "red",
  },
  banking: {
    description: "IBPS, SBI, RBI & banking jobs",
    iconName: "landmark",
    colorKey: "sky",
  },
  upsc: {
    description: "Union Public Service Commission jobs",
    iconName: "ashoka",
    colorKey: "amber",
  },
  "state govt": {
    description: "State PSC & government jobs",
    iconName: "building",
    colorKey: "purple",
  },
  "state government": {
    description: "State PSC & government jobs",
    iconName: "building",
    colorKey: "purple",
  },
  defence: {
    description: "Army, Navy, Air Force & Defence jobs",
    iconName: "shield",
    colorKey: "green",
  },
  defense: {
    description: "Army, Navy, Air Force & Defence jobs",
    iconName: "shield",
    colorKey: "green",
  },
  psu: {
    description: "Public Sector Undertaking jobs",
    iconName: "factory",
    colorKey: "orange",
  },
  police: {
    description: "Police, CAPF & security jobs",
    iconName: "shield",
    colorKey: "red",
  },
  teaching: {
    description: "Teacher & education department jobs",
    iconName: "ashoka",
    colorKey: "purple",
  },
  medical: {
    description: "Doctor, Nursing & healthcare jobs",
    iconName: "building",
    colorKey: "green",
  },
  engineering: {
    description: "Technical & engineering jobs",
    iconName: "factory",
    colorKey: "orange",
  },
  insurance: {
    description: "LIC, NIACL & insurance jobs",
    iconName: "landmark",
    colorKey: "sky",
  },
  judiciary: {
    description: "Court & legal department jobs",
    iconName: "building",
    colorKey: "purple",
  },
  agriculture: {
    description: "Agriculture & rural development jobs",
    iconName: "factory",
    colorKey: "green",
  },
};

const getCachedCategories = unstable_cache(
  async () => {
    return prisma.category.findMany({
      orderBy: {
        name: "asc", // or slug: "asc"
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
  },
  ["categories"],
  {
    revalidate: 3600,
    tags: ["categories"],
  },
);

export async function getCategories(): Promise<Category[]> {
  const categories = await getCachedCategories();

  return categories.map((category) => {
    const key = category.name.trim().toLowerCase();
    const meta = CATEGORY_META[key] ?? DEFAULT_META;
    console.log(category);
    return {
      id: category.id,
      slug: category.slug,
      title: category.name,
      searchKeyword: category.name,
      description: meta.description,
      iconName: meta.iconName,
      colorKey: meta.colorKey,
    };
  });
}
