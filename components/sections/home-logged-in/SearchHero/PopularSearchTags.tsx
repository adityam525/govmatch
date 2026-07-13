import Link from "next/link";

const popularSearches = [
  { label: "SSC CGL", href: "/jobs?search=SSC%20CGL" },
  { label: "ISRO", href: "/jobs?search=ISRO" },
  { label: "Bank PO", href: "/jobs?search=Bank%20PO" },
  { label: "UPSC", href: "/jobs?search=UPSC" },
  { label: "RRB NTPC", href: "/jobs?search=RRB%20NTPC" },
];

export default function PopularSearchTags() {
  return (
    <div className="flex flex-wrap items-center gap-2 mt-3">
      <span className="text-sm text-neutral-600">Popular Searches:</span>
      {popularSearches.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-xs font-medium text-neutral-600 bg-white border border-neutral-200 rounded-full px-3 py-1.5 hover:border-primary-300 hover:text-primary-600 transition-colors"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
