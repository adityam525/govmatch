"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import * as Icons from "lucide-react";

interface BrowseTableItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  iconBg?: string;
  href: string;
}

interface BrowseTableProps {
  title: string;
  description: string;
  items: BrowseTableItem[];
  initialRows?: number;
  stickyOffset?: string;
}

export default function BrowseTable({
  title,
  description,
  items,
  initialRows = 150,
  stickyOffset = "64px",
}: BrowseTableProps) {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filteredItems = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return items;

    return items.filter((item) =>
      `${item.title} ${item.description}`.toLowerCase().includes(value),
    );
  }, [items, search]);

  const visibleItems =
    showAll || search.trim()
      ? filteredItems
      : filteredItems.slice(0, initialRows);

  const canExpand = filteredItems.length > initialRows;

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      {/* Header */}
      <div
        className="z-30 bg-white"
        style={showAll ? { position: "sticky", top: stickyOffset } : undefined}
      >
        {/* Title and controls */}
        <div className="border-b border-neutral-100 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-neutral-900 sm:text-xl">
                {title}
              </h2>

              <p className="mt-1 text-sm leading-6 text-neutral-600">
                {description}
              </p>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto lg:shrink-0">
              {/* Search */}
              <div className="relative min-w-0 flex-1 lg:w-64 lg:flex-none">
                <Search
                  size={17}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setShowAll(false);
                  }}
                  placeholder="Search categories..."
                  aria-label="Search categories"
                  className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {canExpand && (
                <button
                  type="button"
                  onClick={() => setShowAll((prev) => !prev)}
                  aria-expanded={showAll}
                  className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:border-transparent"
                >
                  {showAll ? "Show Less" : `View All (${filteredItems.length})`}

                  {showAll ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop/tablet column headings */}
        <div className="hidden border-b border-neutral-100 bg-neutral-50/70 md:block">
          <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_110px] items-center gap-4 px-6 py-3 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_140px]">
            <span className="text-sm font-semibold text-neutral-700">
              Category
            </span>

            <span className="text-sm font-semibold text-neutral-700">
              Description
            </span>

            <span className="text-sm font-semibold text-neutral-700">
              Action
            </span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div
        className={
          showAll
            ? "min-w-0"
            : "max-h-[432px] min-w-0 overflow-y-auto overscroll-contain"
        }
      >
        {visibleItems.length > 0 ? (
          <div className="divide-y divide-neutral-100">
            {visibleItems.map((item) => {
              const Icon = getIcon(item.iconName);

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    window.location.href = item.href;
                  }}
                  onKeyDown={(e) => {
                    if (
                      e.target === e.currentTarget &&
                      (e.key === "Enter" || e.key === " ")
                    ) {
                      e.preventDefault();
                      window.location.href = item.href;
                    }
                  }}
                  role="link"
                  tabIndex={0}
                  aria-label={`View jobs in ${item.title}`}
                  className="group grid cursor-pointer grid-cols-1 gap-3 px-4 py-4 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_110px] md:items-center md:gap-4 md:px-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_140px]"
                >
                  {/* Category */}
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: item.iconBg ?? "#64748b",
                      }}
                    >
                      <Icon
                        size={20}
                        aria-hidden="true"
                        className="text-white"
                      />
                    </div>

                    <span
                      title={item.title}
                      className="min-w-0 break-words font-medium text-neutral-900 group-hover:text-blue-700"
                    >
                      {item.title}
                    </span>
                  </div>

                  {/* Description */}
                  <p
                    title={item.description}
                    className="min-w-0 break-words text-sm leading-6 text-neutral-600 md:line-clamp-2"
                  >
                    <span className="font-medium text-neutral-500 md:hidden">
                      Description:{" "}
                    </span>
                    {item.description}
                  </p>

                  {/* Action */}
                  <div className="flex items-center justify-between gap-3 md:justify-start">
                    <a
                      href={item.href}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex min-h-9 items-center gap-1 rounded-md text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                    >
                      View Jobs
                      <span aria-hidden="true">→</span>
                    </a>

                    <span className="text-xs text-neutral-400 md:hidden">
                      Open category
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-4 py-12 text-center sm:px-6">
            <Search
              size={24}
              aria-hidden="true"
              className="mx-auto mb-3 text-neutral-300"
            />

            <p className="font-medium text-neutral-700">No categories found</p>

            <p className="mt-1 text-sm text-neutral-500">
              Try a different search term.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {/* {filteredItems.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 bg-neutral-50/50 px-4 py-3 sm:px-6">
          <p className="text-xs text-neutral-500 sm:text-sm">
            Showing {visibleItems.length} of {filteredItems.length} categories
          </p>

          {canExpand && (
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              {showAll ? "Show fewer" : "Show all"}
            </button>
          )}
        </div>
      )} */}
    </section>
  );
}

function getIcon(name: string) {
  const formattedName = name.charAt(0).toUpperCase() + name.slice(1);

  return (
    (Icons[formattedName as keyof typeof Icons] as React.ElementType) ??
    Icons.Briefcase
  );
}
