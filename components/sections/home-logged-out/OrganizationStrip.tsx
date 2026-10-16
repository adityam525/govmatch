import BrowseSection from "@/components/ui/browse/BrowseSection";
import { organizationIconMap } from "@/components/ui/browse/icon-maps";
import { getOrganizations } from "@/data/organizations";
import { prisma } from "@/lib/prisma";

export default async function OrganizationStrip() {
  const organizations = await getOrganizations();

  // Logos come from the database, so adding one needs no code change.
  const logos = new Map<string, { shortName: string; logoUrl: string | null }>();
  try {
    const rows = await prisma.organization.findMany({
      select: { slug: true, shortName: true, logoUrl: true },
    });
    for (const row of rows) logos.set(row.slug, { shortName: row.shortName, logoUrl: row.logoUrl });
  } catch (error) {
    console.error("OrganizationStrip: could not load logos", error);
  }

  const items = organizations.map((o) => ({
    ...o,
    logo: {
      name: o.title,
      shortName: logos.get(o.slug)?.shortName ?? null,
      logoUrl: logos.get(o.slug)?.logoUrl ?? null,
    },
  }));

  return (
    <BrowseSection
      title="Browse Jobs by Organization"
      description="Recruitment boards and government departments"
      items={items}
      iconMap={organizationIconMap}
      getHref={(o) => `/jobs?organizations=${encodeURIComponent(o.slug)}`}
    />
  );
}
