import BrowseSection from "@/components/ui/browse/BrowseSection";
import { accentColorMap } from "@/components/ui/browse/color-map";
import { categoryIconMap } from "@/components/ui/browse/icon-maps";
import { getCategories } from "@/data/categories";

export default async function CategoryStrip() {
  const categories = await getCategories();

  return (
    <BrowseSection
      title="Browse Jobs by Category"
      description="Explore openings across every government sector"
      items={categories}
      iconMap={categoryIconMap}
      colorMap={accentColorMap}
      getHref={(c) => `/jobs?category=${c.slug}`}
    />
  );
}
