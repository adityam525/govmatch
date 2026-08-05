import { ArrowRight, LucideIcon } from "lucide-react";
import Card from "@/components/ui/Card";
import InfoListItem from "./InfoListItem";
import Link from "next/link";

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
    <Card padding="md">
      <div className={`flex flex-col gap-4 md:flex-row md:justify-between`}>
        <h3
          title={title}
          className="text-xl font-bold tracking-tight text-neutral-900"
        >
          {title}
        </h3>

        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          View All
          <ArrowRight size={16} />
        </Link>
      </div>
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
