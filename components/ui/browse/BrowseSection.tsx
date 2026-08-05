import { LucideIcon } from "lucide-react";

import { accentColorMap } from "@/components/ui/browse/color-map";
import BrowseTable from "./BrowseTable";

export interface BrowseItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  colorKey: string;
}

interface BrowseSectionProps<T extends BrowseItem> {
  title: string;
  description: string;
  items: T[];

  iconMap: Record<string, LucideIcon>;
  colorMap?: Record<string, string>;

  getHref: (item: T) => string;

  viewAllHref?: string;
  viewAllLabel?: string;
}

export default function BrowseSection<T extends BrowseItem>({
  title,
  description,
  items,
  colorMap = accentColorMap,
  getHref,
  viewAllHref = "/jobs",
  viewAllLabel = "View All",
}: BrowseSectionProps<T>) {
  const tableItems = items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    iconName: item.iconName,
    iconBg: colorMap[item.colorKey],
    href: getHref(item),
  }));

  return (
    <section>
      {/* <h2 className="mb-1 text-xl font-bold text-neutral-900">{title}</h2>

      <p className="mb-4 text-sm text-neutral-600">{description}</p> */}

      <section>
        <BrowseTable
          title={title}
          description={description}
          items={tableItems}
          viewAllHref={viewAllHref}
          viewAllLabel={viewAllLabel}
        />
      </section>
    </section>
  );
}
