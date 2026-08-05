import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export interface StateItem {
  id: string;
  title: string;
  code: string;
  description: string;

  iconName:
    | "landmark"
    | "mountain"
    | "waves"
    | "trees"
    | "building"
    | "castle"
    | "temple"
    | "heritage"
    | "nature"
    | "coast";

  colorKey: "amber" | "red" | "sky" | "purple" | "green" | "orange";
}

type StateMeta = Pick<StateItem, "description" | "iconName" | "colorKey">;

const DEFAULT_META: StateMeta = {
  description: "State government job opportunities",
  iconName: "building",
  colorKey: "purple",
};

const STATE_META: Record<string, StateMeta> = {
  "andhra pradesh": {
    description: "APPSC & state government jobs",
    iconName: "temple",
    colorKey: "sky",
  },

  "arunachal pradesh": {
    description: "North East government jobs",
    iconName: "mountain",
    colorKey: "green",
  },

  assam: {
    description: "Tea gardens & government jobs",
    iconName: "trees",
    colorKey: "green",
  },

  bihar: {
    description: "BPSC & state recruitment",
    iconName: "heritage",
    colorKey: "amber",
  },

  chhattisgarh: {
    description: "CGPSC & forest department jobs",
    iconName: "nature",
    colorKey: "green",
  },

  goa: {
    description: "Coastal government jobs",
    iconName: "coast",
    colorKey: "sky",
  },

  gujarat: {
    description: "GPSC & state recruitment",
    iconName: "heritage",
    colorKey: "orange",
  },

  haryana: {
    description: "HPSC & state jobs",
    iconName: "building",
    colorKey: "amber",
  },

  "himachal pradesh": {
    description: "Hill state government jobs",
    iconName: "mountain",
    colorKey: "green",
  },

  "jammu and kashmir": {
    description: "JK government recruitment",
    iconName: "mountain",
    colorKey: "green",
  },

  jharkhand: {
    description: "JPSC & state recruitment",
    iconName: "trees",
    colorKey: "green",
  },

  karnataka: {
    description: "KPSC & Karnataka jobs",
    iconName: "temple",
    colorKey: "orange",
  },

  kerala: {
    description: "Kerala PSC recruitment",
    iconName: "nature",
    colorKey: "green",
  },

  "madhya pradesh": {
    description: "MPPSC & state jobs",
    iconName: "heritage",
    colorKey: "purple",
  },

  maharashtra: {
    description: "MPSC & government jobs",
    iconName: "castle",
    colorKey: "orange",
  },

  manipur: {
    description: "North East recruitment",
    iconName: "mountain",
    colorKey: "green",
  },

  meghalaya: {
    description: "Hill state government jobs",
    iconName: "mountain",
    colorKey: "green",
  },

  mizoram: {
    description: "State government jobs",
    iconName: "mountain",
    colorKey: "green",
  },

  nagaland: {
    description: "State government jobs",
    iconName: "mountain",
    colorKey: "green",
  },

  odisha: {
    description: "OSSC & state recruitment",
    iconName: "temple",
    colorKey: "sky",
  },

  punjab: {
    description: "Punjab government jobs",
    iconName: "heritage",
    colorKey: "amber",
  },

  rajasthan: {
    description: "RPSC & state recruitment",
    iconName: "castle",
    colorKey: "orange",
  },

  sikkim: {
    description: "Mountain state jobs",
    iconName: "mountain",
    colorKey: "green",
  },

  "tamil nadu": {
    description: "TNPSC & government jobs",
    iconName: "temple",
    colorKey: "red",
  },

  telangana: {
    description: "TSPSC & state recruitment",
    iconName: "heritage",
    colorKey: "purple",
  },

  tripura: {
    description: "State government jobs",
    iconName: "trees",
    colorKey: "green",
  },

  "uttar pradesh": {
    description: "UPPSC & state recruitment",
    iconName: "heritage",
    colorKey: "amber",
  },

  uttarakhand: {
    description: "Hill state government jobs",
    iconName: "mountain",
    colorKey: "green",
  },

  "west bengal": {
    description: "WBPSC & state recruitment",
    iconName: "heritage",
    colorKey: "red",
  },

  delhi: {
    description: "Delhi government jobs",
    iconName: "building",
    colorKey: "purple",
  },

  chandigarh: {
    description: "Union Territory jobs",
    iconName: "building",
    colorKey: "amber",
  },

  ladakh: {
    description: "High-altitude government jobs",
    iconName: "mountain",
    colorKey: "green",
  },

  puducherry: {
    description: "Union Territory jobs",
    iconName: "coast",
    colorKey: "sky",
  },

  lakshadweep: {
    description: "Island administration jobs",
    iconName: "coast",
    colorKey: "sky",
  },

  "andaman and nicobar islands": {
    description: "Island government jobs",
    iconName: "coast",
    colorKey: "sky",
  },

  "dadra and nagar haveli": {
    description: "Union Territory jobs",
    iconName: "nature",
    colorKey: "green",
  },

  "daman and diu": {
    description: "Coastal administration jobs",
    iconName: "coast",
    colorKey: "sky",
  },
};

const getCachedStates = unstable_cache(
  async () => {
    return prisma.state.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        code: true,
      },
    });
  },
  ["states"],
  {
    revalidate: 3600,
    tags: ["states"],
  },
);

export async function getStates(): Promise<StateItem[]> {
  const states = await getCachedStates();

  return states.map((state) => {
    const key = state.name.trim().toLowerCase();

    const meta = STATE_META[key] ?? DEFAULT_META;

    return {
      id: state.id,
      title: state.name,
      code: state.code,
      description: meta.description,
      iconName: meta.iconName,
      colorKey: meta.colorKey,
    };
  });
}
