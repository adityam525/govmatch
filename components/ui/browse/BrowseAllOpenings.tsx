import { accentColorMap } from "@/components/ui/browse/color-map";
import {
  categoryIconMap,
  organizationIconMap,
  qualificationIconMap,
} from "@/components/ui/browse/icon-maps";

import { getCategories } from "@/data/categories";
import { getOrganizations } from "@/data/organizations";
import { getQualifications } from "@/data/qualifications";
import { getStates } from "@/data/states";

import { prisma } from "@/lib/prisma";
import BrowseAllOpeningsClient from "./BrowseAllOpeningsClient";

export default async function BrowseAllOpenings() {
  const [categories, organizations, qualifications, states] = await Promise.all(
    [getCategories(), getOrganizations(), getQualifications(), getStates()],
  );

  // Fetch organization logos
  const organizationLogos = new Map<
    string,
    { shortName: string | null; logoUrl: string | null }
  >();

  try {
    const rows = await prisma.organization.findMany({
      select: {
        slug: true,
        shortName: true,
        logoUrl: true,
      },
    });

    for (const row of rows) {
      organizationLogos.set(row.slug, {
        shortName: row.shortName,
        logoUrl: row.logoUrl,
      });
    }
  } catch (error) {
    console.error("Could not load organization logos", error);
  }

  // Fetch state logos
  const stateLogos = new Map<string, string>();

  try {
    const rows = await prisma.state.findMany({
      select: {
        code: true,
        logoUrl: true,
      },
    });

    for (const row of rows) {
      if (row.logoUrl) {
        stateLogos.set(row.code, row.logoUrl);
      }
    }
  } catch (error) {
    console.error("Could not load state logos", error);
  }

  // Normalize all datasets into a common structure
  const tabs = [
    {
      id: "category",
      label: "By Category",
      items: categories.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        iconName: item.iconName,
        iconBg: accentColorMap[item.colorKey],
        href: `/jobs?category=${item.slug}`,
      })),
    },
    {
      id: "organization",
      label: "By Organisation",
      items: organizations.map((item) => {
        const logo = organizationLogos.get(item.slug);

        return {
          id: item.id,
          title: item.title,
          description: item.description,
          iconName: item.iconName,
          iconBg: accentColorMap[item.colorKey],
          logo: {
            name: item.title,
            shortName: logo?.shortName,
            logoUrl: logo?.logoUrl,
          },
          href: `/jobs?organizations=${encodeURIComponent(item.slug)}`,
        };
      }),
    },
    {
      id: "qualification",
      label: "By Qualification",
      items: qualifications.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        iconName: item.iconName,
        iconBg: accentColorMap[item.colorKey],
        href: `/jobs?qualificationCategories=${item.slug}`,
      })),
    },
    {
      id: "state",
      label: "By State",
      items: states.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        iconName: item.iconName,
        iconBg: accentColorMap[item.colorKey],
        logo: stateLogos.has(item.code)
          ? {
              name: item.title,
              shortName: item.code,
              logoUrl: stateLogos.get(item.code),
            }
          : undefined,
        href: `/jobs?states=${item.code}`,
      })),
    },
  ];

  return (
    <BrowseAllOpeningsClient
      title="Browse all openings"
      description="Explore by category, organisation, qualification or state."
      tabs={tabs}
    />
  );
}
