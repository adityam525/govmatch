import Link from "next/link";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";

// A page section: title, optional subtitle, optional action or "view all" link, then content.
// It sets no outer margin. Put sections inside <Stack sections> so spacing comes from one place.
export default function Section({ id, title, subtitle, action, viewAllHref, viewAllLabel = "View all", align = "left", className, children }: {
  id?: string; title?: string; subtitle?: string; action?: React.ReactNode; viewAllHref?: string; viewAllLabel?: string;
  align?: "left" | "center"; className?: string; children: React.ReactNode;
}) {
  return (
    <section id={id} className={clsx("min-w-0", className)} aria-labelledby={id && title ? id + "-title" : undefined}>
      {(title || subtitle || action || viewAllHref) && (
        <div className={clsx("section-head flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between", align === "center" && "items-center text-center sm:flex-col sm:items-center")}>
          <div className="min-w-0">
            {title && <h2 id={id ? id + "-title" : undefined} className="section-title text-neutral-900">{title}</h2>}
            {subtitle && <p className="mt-1 max-w-3xl text-sm text-neutral-600">{subtitle}</p>}
          </div>
          {action ?? (viewAllHref && (
            <Link href={viewAllHref} className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700">
              {viewAllLabel}<ArrowRight size={16} aria-hidden />
            </Link>
          ))}
        </div>
      )}
      {children}
    </section>
  );
}
