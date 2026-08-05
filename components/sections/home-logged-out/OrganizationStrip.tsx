import BrowseSection from "@/components/ui/browse/BrowseSection";
import { organizationIconMap } from "@/components/ui/browse/icon-maps";
import { getOrganizations } from "@/data/organizations";

export default async function OrganizationStrip() {
  const organizations = await getOrganizations();
  return (
    <BrowseSection
      title="Browse Jobs by Organization"
      description="Recruitment boards and government departments"
      items={organizations}
      iconMap={organizationIconMap}
      getHref={(o) => `/jobs?organizations=${encodeURIComponent(o.slug)}`}
    />
  );
}
