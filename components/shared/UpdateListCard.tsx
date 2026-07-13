import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Card from "@/components/ui/Card";
import type { UpdateType } from "@/data/mockUpdates";

interface UpdateListCardProps {
  update: UpdateType;
}

export default function UpdateListCard({ update }: UpdateListCardProps) {
  return (
    <Card padding="md" className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-neutral-900">
            {update.title}
          </p>
          <p className="text-xs text-neutral-400">{update.description}</p>
        </div>
      </div>

      <div className="flex-1 space-y-2.5">
        {update.items.map((item) => (
          <Link
            key={item.id}
            href={`${update.href}/${item.slug}`}
            className="block hover:bg-neutral-50 -mx-2 px-2 py-1 rounded-md transition-colors"
          >
            <p className="text-xs font-medium text-neutral-900 truncate">
              {item.title}
            </p>
            <p className="text-[11px] text-neutral-400">
              {item.org} · {item.date}
            </p>
          </Link>
        ))}
      </div>

      <Link
        href={update.href}
        className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 mt-3"
      >
        View All {update.title}
        <ArrowRight size={12} />
      </Link>
    </Card>
  );
}
