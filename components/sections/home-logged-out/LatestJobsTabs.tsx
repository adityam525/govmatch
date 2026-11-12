"use client";

import { useState } from "react";
import JobCard, { type JobCardData } from "@/components/jobs/JobCard";
import TabFilterBar from "./TabFilterBar";

export interface LatestJobItem {
  category: string;
  card: JobCardData;
}

const FIRST_ROWS = 6;

// Below lg the page scrolls normally (no scroll box to get trapped in) and shows the first
// few cards with "Show more". From lg up it is a scroll box again, as a mouse wheel handles that fine.
export default function LatestJobsTabs({ items }: { items: LatestJobItem[] }) {
  const [activeTab, setActiveTab] = useState("all");
  const [expanded, setExpanded] = useState(false);
  const visible = activeTab === "all" ? items : items.filter((item) => item.category === activeTab);
  const hiddenOnSmall = expanded ? 0 : Math.max(0, visible.length - FIRST_ROWS);

  return (
    <div className="@container">
      <TabFilterBar activeTab={activeTab} onChange={(t) => { setActiveTab(t); setExpanded(false); }} />
      <div className="mt-4 lg:max-h-[34.75rem] lg:overflow-y-auto">
        {visible.length === 0 ? (
          <p className="py-6 text-center text-sm text-neutral-500">No jobs are open for applications in this category right now.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 pb-1 @md:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-4">
            {visible.map(({ card }, i) => (
              <div key={card.id} className={i >= FIRST_ROWS && !expanded ? "hidden lg:block" : "block"}>
                <JobCard job={card} />
              </div>
            ))}
          </div>
        )}
      </div>
      {hiddenOnSmall > 0 && (
        <button type="button" onClick={() => setExpanded(true)} className="mt-4 w-full rounded-lg border border-neutral-200 bg-white py-3 text-sm font-semibold text-primary-700 hover:bg-neutral-50 lg:hidden">
          Show {hiddenOnSmall} more
        </button>
      )}
    </div>
  );
}
