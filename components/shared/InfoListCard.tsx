import { ArrowRight, type LucideIcon } from "lucide-react";
import Link from "next/link";

import Card from "@/components/ui/Card";
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
    <Card padding="md">
      <section className="min-w-0">
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-neutral-100 pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <h3
            title={title}
            className="min-w-0 break-words text-lg font-bold leading-snug tracking-tight text-neutral-900 sm:text-xl"
          >
            {title}
          </h3>

          <Link
            href={viewAllHref}
            className="inline-flex min-h-9 w-fit shrink-0 items-center gap-1 rounded-md text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            View All
            <ArrowRight
              size={16}
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        {/* List */}
        <div className="min-w-0 divide-y divide-neutral-100">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-8 text-center sm:py-10">
              <p className="text-sm font-medium text-neutral-500">
                {emptyMessage ?? "Nothing here yet"}
              </p>
            </div>
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
      </section>
    </Card>
  );
}
