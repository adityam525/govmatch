import BrowseSection from "@/components/ui/browse/BrowseSection";
import { accentColorMap } from "@/components/ui/browse/color-map";
import { qualificationIconMap } from "@/components/ui/browse/icon-maps";
import { getQualifications } from "@/data/qualifications";

export default async function QualificationStrip() {
  const qualifications = await getQualifications();

  return (
    <BrowseSection
      title="Browse Jobs by Qualification"
      description="Find jobs that match your education level"
      items={qualifications}
      iconMap={qualificationIconMap}
      colorMap={accentColorMap}
      getHref={(q) => `/jobs?qualificationCategories=${q.id}`}
    />
  );
}
