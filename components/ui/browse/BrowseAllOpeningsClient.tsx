"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import * as Icons from "lucide-react";

import OrgLogo from "@/components/shared/OrgLogo";

interface BrowseItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  iconBg?: string;
  logo?: {
    name: string;
    shortName?: string | null;
    logoUrl?: string | null;
  };
  href: string;
}

interface BrowseTab {
  id: string;
  label: string;
  items: BrowseItem[];
}

interface BrowseAllOpeningsProps {
  title: string;
  description: string;
  tabs: BrowseTab[];
}

export default function BrowseAllOpeningsClient({
  title,
  description,
  tabs,
}: BrowseAllOpeningsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "");
  const [search, setSearch] = useState("");

  const currentTab = tabs.find((tab) => tab.id === activeTab);

  const filteredItems = useMemo(() => {
    const items = currentTab?.items ?? [];
    const value = search.trim().toLowerCase();

    if (!value) return items;

    return items.filter((item) =>
      `${item.title} ${item.description}`.toLowerCase().includes(value),
    );
  }, [currentTab, search]);

  return (
    <section className="min-w-0">
      {/* Section heading */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          {title}
        </h2>

        <p className="mt-2 text-sm text-neutral-600 sm:text-base">
          {description}
        </p>
      </div>

      {/* Main container */}
      <div className="min-w-0 rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {/* Sticky Tabs and Search Header */}
        <div className="sticky top-16 z-30 rounded-t-2xl border-b border-neutral-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Tabs */}
            <div className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-neutral-200 bg-neutral-50 p-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSearch("");
                    }}
                    aria-pressed={isActive}
                    className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                      isActive
                        ? "bg-white text-blue-700 shadow-sm ring-1 ring-neutral-200"
                        : "text-neutral-600 hover:bg-white hover:text-neutral-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-64 lg:shrink-0">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                aria-hidden="true"
              />

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search in this list"
                aria-label="Search in this list"
                className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Rows */}
        <div className="max-h-[432px] min-w-0 overflow-y-auto overscroll-contain">
          {filteredItems.length > 0 ? (
            <div className="divide-y divide-neutral-100">
              {filteredItems.map((item) => {
                const Icon = getIcon(item.iconName);

                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 gap-3 px-4 py-4 transition-colors hover:bg-neutral-50/70 sm:px-5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_100px] md:items-center md:gap-5"
                  >
                    {/* Icon and Title */}
                    <a
                      href={item.href}
                      className="flex min-w-0 items-center gap-3"
                    >
                      {item.logo ? (
                        <OrgLogo
                          name={item.logo.name}
                          shortName={item.logo.shortName}
                          logoUrl={item.logo.logoUrl}
                          size={36}
                        />
                      ) : (
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                          style={{
                            backgroundColor: item.iconBg ?? "#64748b",
                          }}
                        >
                          <Icon
                            size={18}
                            className="text-white"
                            aria-hidden="true"
                          />
                        </div>
                      )}

                      <span className="min-w-0 break-words text-sm font-semibold text-neutral-900 transition-colors hover:text-blue-700">
                        {item.title}
                      </span>
                    </a>

                    {/* Description */}
                    <p className="min-w-0 break-words text-sm leading-5 text-neutral-500 md:line-clamp-2">
                      {item.description}
                    </p>

                    {/* Action */}
                    <div className="flex items-center md:justify-end">
                      <a
                        href={item.href}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-800 hover:underline"
                      >
                        View jobs
                        <span aria-hidden="true">→</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Search size={25} className="mx-auto mb-3 text-neutral-300" />

              <p className="font-semibold text-neutral-700">No results found</p>

              <p className="mt-1 text-sm text-neutral-500">
                Try searching with a different keyword.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="rounded-b-2xl border-t border-neutral-100 bg-neutral-50/50 px-4 py-3 sm:px-5">
          <p className="text-xs text-neutral-500">
            Showing {filteredItems.length} of {currentTab?.items.length ?? 0}{" "}
            openings
          </p>
        </div>
      </div>
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
