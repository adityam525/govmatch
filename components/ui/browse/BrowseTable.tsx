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

  // Navbar height
  stickyOffset?: string;
}

export default function BrowseTable({
  title,
  description,
  items,
  initialRows = 8,
  stickyOffset = "64px",
}: BrowseTableProps) {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filteredItems = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return items;

    return items.filter((item) =>
      `${item.title} ${item.description}`.toLowerCase().includes(value),
    );
  }, [items, search]);

  const visibleItems = filteredItems;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white">
      {/* Sticky Complete Header */}
      <div
        className={showAll ? "sticky z-30 bg-white" : "bg-white"}
        style={
          showAll
            ? {
                top: stickyOffset,
              }
            : undefined
        }
      >
        {/* Section Header */}
        <div
          className="
            border-b
            border-neutral-100
            px-6
            py-5
          "
        >
          <div className="flex items-start justify-between gap-6">
            {/* Title */}
            <div>
              <h2 className="text-xl font-bold text-neutral-900">{title}</h2>

              <p className="mt-1 text-sm text-neutral-600">{description}</p>
            </div>

            {/* Search + View */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search
                  size={17}
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-neutral-400
                  "
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search categories..."
                  className="
                    h-10
                    w-64
                    rounded-lg
                    border
                    border-neutral-200
                    pl-9
                    pr-3
                    text-sm
                    outline-none
                    focus:border-blue-400
                  "
                />
              </div>

              {filteredItems.length > initialRows && (
                <button
                  type="button"
                  onClick={() => setShowAll((prev) => !prev)}
                  className="
                    flex
                    w-48
                    items-center
                    justify-center
                    gap-1
                    rounded-lg
                    px-3
                    py-2
                    text-sm
                    font-medium
                    text-blue-600
                    hover:bg-blue-50
                  "
                >
                  {showAll
                    ? `Show Less (${filteredItems.length})`
                    : `View All (${filteredItems.length})`}

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

        {/* Column Header */}
        <table className="w-full text-left bg-white">
          <thead>
            <tr className="border-b border-neutral-100">
              <th className="w-[45%] px-6 py-3 text-sm font-semibold  text-neutral-700">
                Category
              </th>

              <th className="w-[35%] px-6 py-3 text-sm font-semibold  text-neutral-700">
                Description
              </th>

              <th className="w-[20%] px-6 py-3 text-sm font-semibold  text-neutral-700">
                Action
              </th>
            </tr>
          </thead>
        </table>
      </div>

      {/* Body Scroll Area */}
      <div className={showAll ? "" : "max-h-105 overflow-y-auto"}>
        <table className="w-full table-fixed text-left">
          <tbody>
            {visibleItems.map((item) => {
              const Icon = getIcon(item.iconName);

              return (
                <tr
                  key={item.id}
                  className="
                    h-16
                    border-b
                  border-neutral-100
                  hover:bg-neutral-50
                  "
                >
                  {/* Category */}

                  <td className=" w-[45%] px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="
                          flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-xl
                        "
                        style={{
                          backgroundColor: item.iconBg ?? "#e5e7eb",
                        }}
                      >
                        {Icon && <Icon size={20} className="text-white" />}
                      </div>

                      <span
                        title={item.title}
                        className="font-medium block max-w-65 truncate text-neutral-900"
                      >
                        {truncate(item.title, 30)}
                      </span>
                    </div>
                  </td>

                  {/* Description */}

                  <td
                    title={item.description}
                    className=" w-[35%] px-6 py-4 text-sm text-neutral-600 max-w-60 truncate"
                  >
                    {truncate(item.description, 70)}
                  </td>

                  {/* Action */}

                  <td className="w-[20%] px-6 py-4">
                    <a
                      href={item.href}
                      className="
                        text-sm
                        font-medium
                        text-blue-600
                        hover:underline
                      "
                    >
                      View Jobs
                    </a>
                  </td>
                </tr>
              );
            })}

            {visibleItems.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="
                    px-6
                    py-10
                    text-center
                    text-sm
                    text-neutral-500
                  "
                >
                  No categories found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getIcon(name: string) {
  const formattedName = name.charAt(0).toUpperCase() + name.slice(1);

  return (
    (Icons[formattedName as keyof typeof Icons] as React.ElementType) ??
    Icons.Briefcase
  );
}

function truncate(text: string, max = 45) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}...`;
}
