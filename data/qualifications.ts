// lib/qualificationCategories.ts

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export interface Qualification {
  id: string;
  slug: string;
  title: string;
  description: string;
  iconName:
    | "book"
    | "graduationCap"
    | "wrench"
    | "award"
    | "briefcase"
    | "heartPulse"
    | "scale"
    | "wallet"
    | "flaskConical"
    | "palette"
    | "monitor"
    | "leaf"
    | "pill"
    | "building2"
    | "hotel";
  colorKey:
    | "amber"
    | "red"
    | "sky"
    | "purple"
    | "green"
    | "orange"
    | "slate"
    | "indigo"
    | "pink"
    | "blue"
    | "emerald"
    | "cyan"
    | "rose"
    | "lime"
    | "teal"
    | "stone"
    | "violet";
  searchKeyword: string;
}

type QualificationMeta = Pick<
  Qualification,
  "description" | "iconName" | "colorKey"
>;

const DEFAULT_META: QualificationMeta = {
  description: "Government job opportunities",
  iconName: "book",
  colorKey: "slate",
};

const QUALIFICATION_META: Record<string, QualificationMeta> = {
  "8th": {
    description: "Middle school level jobs",
    iconName: "book",
    colorKey: "slate",
  },
  "10th": {
    description: "Matric level jobs",
    iconName: "book",
    colorKey: "amber",
  },
  "12th": {
    description: "Intermediate level jobs",
    iconName: "book",
    colorKey: "sky",
  },
  iti: {
    description: "Technical trade jobs",
    iconName: "wrench",
    colorKey: "orange",
  },
  apprentice: {
    description: "Government & PSU apprenticeships",
    iconName: "wrench",
    colorKey: "green",
  },
  diploma: {
    description: "Polytechnic & diploma jobs",
    iconName: "award",
    colorKey: "purple",
  },
  graduate: {
    description: "Bachelor's degree jobs",
    iconName: "graduationCap",
    colorKey: "green",
  },
  "post graduate": {
    description: "Master's degree jobs",
    iconName: "graduationCap",
    colorKey: "red",
  },
  postgraduate: {
    description: "Master's degree jobs",
    iconName: "graduationCap",
    colorKey: "red",
  },
  doctorate: {
    description: "PhD & doctoral level jobs",
    iconName: "graduationCap",
    colorKey: "indigo",
  },
  engineering: {
    description: "B.E./B.Tech engineering jobs",
    iconName: "briefcase",
    colorKey: "amber",
  },
  medical: {
    description: "MBBS & medical officer jobs",
    iconName: "heartPulse",
    colorKey: "red",
  },
  nursing: {
    description: "Nursing & paramedical jobs",
    iconName: "heartPulse",
    colorKey: "pink",
  },
  "nursing & paramedical": {
    description: "Nursing & paramedical jobs",
    iconName: "heartPulse",
    colorKey: "pink",
  },
  teaching: {
    description: "Teacher & education jobs",
    iconName: "graduationCap",
    colorKey: "purple",
  },
  "teaching & education": {
    description: "Teacher & education jobs",
    iconName: "graduationCap",
    colorKey: "purple",
  },
  law: {
    description: "LLB & legal officer jobs",
    iconName: "scale",
    colorKey: "violet",
  },
  management: {
    description: "MBA & management jobs",
    iconName: "briefcase",
    colorKey: "blue",
  },
  commerce: {
    description: "Commerce & accounts jobs",
    iconName: "wallet",
    colorKey: "emerald",
  },
  science: {
    description: "Science stream jobs",
    iconName: "flaskConical",
    colorKey: "cyan",
  },
  arts: {
    description: "Arts & humanities jobs",
    iconName: "palette",
    colorKey: "rose",
  },
  "arts & humanities": {
    description: "Arts & humanities jobs",
    iconName: "palette",
    colorKey: "rose",
  },
  computer: {
    description: "Computer & IT jobs",
    iconName: "monitor",
    colorKey: "blue",
  },
  "computer applications": {
    description: "Computer & IT jobs",
    iconName: "monitor",
    colorKey: "blue",
  },
  agriculture: {
    description: "Agriculture & farming jobs",
    iconName: "leaf",
    colorKey: "lime",
  },
  pharmacy: {
    description: "Pharmacist & pharmacy jobs",
    iconName: "pill",
    colorKey: "teal",
  },
  architecture: {
    description: "Architecture & design jobs",
    iconName: "building2",
    colorKey: "stone",
  },
  "architecture & design": {
    description: "Architecture & design jobs",
    iconName: "building2",
    colorKey: "stone",
  },
  hotel: {
    description: "Hospitality & hotel jobs",
    iconName: "hotel",
    colorKey: "orange",
  },
  "hotel management": {
    description: "Hospitality & hotel jobs",
    iconName: "hotel",
    colorKey: "orange",
  },
};

// Queries the DB directly instead of self-fetching /api/qualification-categories
// over HTTP. This is a server-only helper (used inside Server Components), so
// there's no need for a network round-trip to our own API, and it removes the
// NEXT_PUBLIC_APP_URL dependency entirely.
//
// Cached for 1 hour and tagged so it can be force-refreshed on demand (e.g.
// after an admin edits QualificationCategory rows) via:
//   revalidateTag("qualification-categories")
const getCachedQualificationCategories = unstable_cache(
  async () => {
    return prisma.qualificationCategory.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true, slug: true },
    });
  },
  ["qualification-categories"],
  { revalidate: 3600, tags: ["qualification-categories"] },
);

export async function getQualifications(): Promise<Qualification[]> {
  const categories = await getCachedQualificationCategories();

  return categories.map((category) => {
    const key = category.name.trim().toLowerCase();
    const meta = QUALIFICATION_META[key] ?? DEFAULT_META;

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
