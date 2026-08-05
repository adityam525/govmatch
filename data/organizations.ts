import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export interface OrganizationItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  iconName:
    | "building"
    | "landmark"
    | "train"
    | "shield"
    | "factory"
    | "ashoka"
    | "education"
    | "medical"
    | "judiciary"
    | "agriculture"
    | "energy";

  colorKey:
    | "amber"
    | "red"
    | "sky"
    | "purple"
    | "green"
    | "orange"
    | "blue"
    | "slate"
    | "violet";
}

type OrganizationMeta = Pick<
  OrganizationItem,
  "description" | "iconName" | "colorKey"
>;

const DEFAULT_META: OrganizationMeta = {
  description: "Government organization jobs",
  iconName: "building",
  colorKey: "slate" as any,
};

const ORGANIZATION_META: Record<string, OrganizationMeta> = {
  // Recruitment Boards
  "staff selection commission": {
    description: "SSC recruitment and government jobs",
    iconName: "building",
    colorKey: "amber",
  },

  "railway recruitment board": {
    description: "Railway recruitment jobs",
    iconName: "train",
    colorKey: "red",
  },

  "institute of banking personnel selection": {
    description: "Banking recruitment examinations",
    iconName: "landmark",
    colorKey: "sky",
  },

  "union public service commission": {
    description: "Civil services and central government jobs",
    iconName: "ashoka",
    colorKey: "amber",
  },

  "national testing agency": {
    description: "National level examination authority",
    iconName: "building",
    colorKey: "purple",
  },

  "institute of company secretaries of india": {
    description: "Professional education and certification jobs",
    iconName: "building",
    colorKey: "purple",
  },

  // Defence
  "indian army": {
    description: "Army defence recruitment",
    iconName: "shield",
    colorKey: "green",
  },

  "indian navy": {
    description: "Navy defence recruitment",
    iconName: "shield",
    colorKey: "green",
  },

  "indian air force": {
    description: "Air Force defence recruitment",
    iconName: "shield",
    colorKey: "green",
  },

  "defence research and development organisation": {
    description: "Defence research and technology jobs",
    iconName: "factory",
    colorKey: "green",
  },

  "bharat dynamics limited": {
    description: "Defence PSU recruitment",
    iconName: "factory",
    colorKey: "orange",
  },

  "border roads organisation": {
    description: "Defence infrastructure jobs",
    iconName: "factory",
    colorKey: "orange",
  },

  "central reserve police force": {
    description: "Central armed police force jobs",
    iconName: "shield",
    colorKey: "green",
  },

  "border security force": {
    description: "Border security recruitment",
    iconName: "shield",
    colorKey: "green",
  },

  "central industrial security force": {
    description: "Industrial security recruitment",
    iconName: "shield",
    colorKey: "green",
  },

  "indo-tibetan border police": {
    description: "Mountain border security jobs",
    iconName: "shield",
    colorKey: "green",
  },

  "sashastra seema bal": {
    description: "Border security force jobs",
    iconName: "shield",
    colorKey: "green",
  },

  "assam rifles": {
    description: "Paramilitary force recruitment",
    iconName: "shield",
    colorKey: "green",
  },

  // Space & Research
  "indian space research organisation": {
    description: "Space research and engineering jobs",
    iconName: "factory",
    colorKey: "purple",
  },

  // Railways
  "railway recruitment cell": {
    description: "Railway recruitment jobs",
    iconName: "train",
    colorKey: "red",
  },

  "konkan railway corporation limited": {
    description: "Railway infrastructure jobs",
    iconName: "train",
    colorKey: "red",
  },

  "railtel corporation of india": {
    description: "Railway communication PSU jobs",
    iconName: "factory",
    colorKey: "orange",
  },

  "indian railway catering and tourism corporation": {
    description: "Railway service sector jobs",
    iconName: "train",
    colorKey: "red",
  },

  "dedicated freight corridor corporation of india": {
    description: "Rail infrastructure jobs",
    iconName: "train",
    colorKey: "red",
  },

  "rail vikas nigam limited": {
    description: "Railway development PSU jobs",
    iconName: "factory",
    colorKey: "orange",
  },

  // Banking
  "state bank of india": {
    description: "Banking sector recruitment",
    iconName: "landmark",
    colorKey: "sky",
  },

  "reserve bank of india": {
    description: "Central banking jobs",
    iconName: "landmark",
    colorKey: "sky",
  },

  "punjab national bank": {
    description: "Banking recruitment",
    iconName: "landmark",
    colorKey: "sky",
  },

  "union bank of india": {
    description: "Banking recruitment",
    iconName: "landmark",
    colorKey: "sky",
  },

  "bank of baroda": {
    description: "Banking recruitment",
    iconName: "landmark",
    colorKey: "sky",
  },

  "canara bank": {
    description: "Banking recruitment",
    iconName: "landmark",
    colorKey: "sky",
  },

  "indian overseas bank": {
    description: "Banking recruitment",
    iconName: "landmark",
    colorKey: "sky",
  },

  "national bank for agriculture and rural development": {
    description: "Agriculture banking jobs",
    iconName: "agriculture",
    colorKey: "green",
  },

  "export-import bank of india": {
    description: "Export finance banking jobs",
    iconName: "landmark",
    colorKey: "sky",
  },

  "small industries development bank of india": {
    description: "Small business finance jobs",
    iconName: "landmark",
    colorKey: "sky",
  },

  // Insurance
  "life insurance corporation of india": {
    description: "Insurance sector jobs",
    iconName: "landmark",
    colorKey: "blue",
  },

  "national insurance company limited": {
    description: "Insurance sector jobs",
    iconName: "landmark",
    colorKey: "blue",
  },

  "new india assurance company limited": {
    description: "Insurance sector jobs",
    iconName: "landmark",
    colorKey: "blue",
  },

  "oriental insurance company limited": {
    description: "Insurance sector jobs",
    iconName: "landmark",
    colorKey: "blue",
  },

  "united india insurance company limited": {
    description: "Insurance sector jobs",
    iconName: "landmark",
    colorKey: "blue",
  },

  // PSU Energy & Manufacturing
  "bharat heavy electricals limited": {
    description: "Engineering PSU jobs",
    iconName: "factory",
    colorKey: "orange",
  },

  "bharat petroleum corporation limited": {
    description: "Oil and energy PSU jobs",
    iconName: "factory",
    colorKey: "orange",
  },

  "hindustan petroleum corporation limited": {
    description: "Oil and energy PSU jobs",
    iconName: "factory",
    colorKey: "orange",
  },

  "oil and natural gas corporation": {
    description: "Oil and gas PSU jobs",
    iconName: "factory",
    colorKey: "orange",
  },

  "national thermal power corporation": {
    description: "Power sector PSU jobs",
    iconName: "factory",
    colorKey: "orange",
  },

  "coal india limited": {
    description: "Mining PSU jobs",
    iconName: "factory",
    colorKey: "orange",
  },

  "steel authority of india limited": {
    description: "Steel PSU jobs",
    iconName: "factory",
    colorKey: "orange",
  },

  "airports authority of india": {
    description: "Airport and aviation jobs",
    iconName: "factory",
    colorKey: "orange",
  },

  "hindustan aeronautics limited": {
    description: "Aerospace PSU jobs",
    iconName: "factory",
    colorKey: "orange",
  },

  "bharat electronics limited": {
    description: "Electronics PSU jobs",
    iconName: "factory",
    colorKey: "orange",
  },

  "mazagon dock shipbuilders limited": {
    description: "Shipbuilding PSU jobs",
    iconName: "factory",
    colorKey: "orange",
  },

  "cochin shipyard limited": {
    description: "Shipbuilding PSU jobs",
    iconName: "factory",
    colorKey: "orange",
  },

  "gail (india) limited": {
    description: "Gas and energy PSU jobs",
    iconName: "factory",
    colorKey: "orange",
  },

  "power grid corporation of india": {
    description: "Power transmission PSU jobs",
    iconName: "factory",
    colorKey: "orange",
  },

  "nhpc limited": {
    description: "Hydropower PSU jobs",
    iconName: "factory",
    colorKey: "orange",
  },

  "container corporation of india": {
    description: "Logistics PSU jobs",
    iconName: "factory",
    colorKey: "orange",
  },

  "nmdc steel limited": {
    description: "Steel PSU jobs",
    iconName: "factory",
    colorKey: "orange",
  },

  "national aluminium company limited": {
    description: "Mining PSU jobs",
    iconName: "factory",
    colorKey: "orange",
  },

  "bharat sanchar nigam limited": {
    description: "Telecom PSU jobs",
    iconName: "factory",
    colorKey: "orange",
  },

  "sjvn limited": {
    description: "Power PSU jobs",
    iconName: "factory",
    colorKey: "orange",
  },

  "nlc india limited": {
    description: "Energy PSU jobs",
    iconName: "factory",
    colorKey: "orange",
  },

  "rites limited": {
    description: "Engineering consultancy PSU jobs",
    iconName: "factory",
    colorKey: "orange",
  },

  "indian rare earths limited": {
    description: "Mining and materials PSU jobs",
    iconName: "factory",
    colorKey: "orange",
  },

  // Education
  "kendriya vidyalaya sangathan": {
    description: "Central government teaching jobs",
    iconName: "education",
    colorKey: "purple",
  },

  "navodaya vidyalaya samiti": {
    description: "School education jobs",
    iconName: "education",
    colorKey: "purple",
  },

  "central teacher eligibility test board": {
    description: "Teaching eligibility jobs",
    iconName: "education",
    colorKey: "purple",
  },

  // Healthcare
  "all india institute of medical sciences": {
    description: "Medical and healthcare jobs",
    iconName: "medical",
    colorKey: "green",
  },

  "employees state insurance corporation": {
    description: "Healthcare insurance jobs",
    iconName: "medical",
    colorKey: "green",
  },

  "indian council of medical research": {
    description: "Medical research jobs",
    iconName: "medical",
    colorKey: "green",
  },

  "national health mission": {
    description: "Healthcare mission jobs",
    iconName: "medical",
    colorKey: "green",
  },

  // Judiciary
  "delhi high court": {
    description: "Judiciary recruitment jobs",
    iconName: "judiciary",
    colorKey: "violet",
  },

  "calcutta high court": {
    description: "Judiciary recruitment jobs",
    iconName: "judiciary",
    colorKey: "violet",
  },

  "gauhati high court": {
    description: "Judiciary recruitment jobs",
    iconName: "judiciary",
    colorKey: "violet",
  },

  "patna high court": {
    description: "Judiciary recruitment jobs",
    iconName: "judiciary",
    colorKey: "violet",
  },

  // Agriculture
  "indian council of agricultural research": {
    description: "Agriculture research jobs",
    iconName: "agriculture",
    colorKey: "green",
  },

  // Postal
  "department of posts (india post)": {
    description: "Postal department jobs",
    iconName: "building",
    colorKey: "sky",
  },

  "india post payments bank": {
    description: "Postal banking jobs",
    iconName: "landmark",
    colorKey: "sky",
  },

  // Women & Environment
  "ministry of women and child development (icds)": {
    description: "Women and child development jobs",
    iconName: "building",
    colorKey: "purple",
  },

  "ministry of environment, forest and climate change": {
    description: "Forest and environment jobs",
    iconName: "agriculture",
    colorKey: "green",
  },
};

// Organization now has a `slug` field (added via the
// add_organization_slug_nullable / make_organization_slug_required
// migrations + backfill script), used for human-readable, shareable jobs
// filter URLs instead of the raw id.
const getCachedOrganizations = unstable_cache(
  async () => {
    return prisma.organization.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        shortName: true,
        slug: true,
      },
    });
  },
  ["organizations"],
  {
    revalidate: 3600,
    tags: ["organizations"],
  },
);

export async function getOrganizations(): Promise<OrganizationItem[]> {
  const organizations = await getCachedOrganizations();

  return organizations.map((org) => {
    const key = org.name.trim().toLowerCase();

    const meta = ORGANIZATION_META[key] ?? DEFAULT_META;

    return {
      id: org.id,
      title: org.shortName,
      slug: org.slug,
      description: meta.description,
      iconName: meta.iconName,
      colorKey: meta.colorKey,
    };
  });
}
