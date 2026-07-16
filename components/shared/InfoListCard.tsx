import { LucideIcon } from "lucide-react";
import Card from "@/components/ui/Card";
import SectionHeader from "@/components/ui/SectionHeader";
import InfoListItem from "./InfoListItem";

interface InfoListCardItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  href: string;
}

interface InfoListCardProps {
  title: string;
  icon: LucideIcon;
  items: InfoListCardItem[];
  viewAllHref: string;
  emptyMessage?: string;
}

export default function InfoListCard({
  title,
  icon,
  items,
  viewAllHref,
  emptyMessage,
}: InfoListCardProps) {
  return (
    <Card padding="lg">
      <SectionHeader
        title={title}
        viewAllHref={viewAllHref}
        viewAllLabel="View All"
      />
      <div>
        {items.length === 0 ? (
          <p className="text-xs text-neutral-400 py-6 text-center">
            {emptyMessage ?? "Nothing here yet"}
          </p>
        ) : (
          items.map((item) => (
            <InfoListItem
              key={item.id}
              icon={icon}
              title={item.title}
              subtitle={item.subtitle}
              date={item.date}
              href={item.href}
            />
          ))
        )}
      </div>
    </Card>
  );
}
