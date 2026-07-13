"use client";

import { useState } from "react";
import clsx from "clsx";

const tabs = [
  { id: "all", label: "All Jobs" },
  { id: "central", label: "Central Govt." },
  { id: "state", label: "State Govt." },
  { id: "psu", label: "PSU" },
  { id: "banking", label: "Banking" },
  { id: "defence", label: "Defence" },
  { id: "teaching", label: "Teaching" },
];

interface TabFilterBarProps {
  activeTab: string;
  onChange: (tabId: string) => void;
}

export default function TabFilterBar({
  activeTab,
  onChange,
}: TabFilterBarProps) {
  return (
    <div className="flex gap-1 border-b border-neutral-200 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={clsx(
            "px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
            activeTab === tab.id
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-neutral-600 hover:text-neutral-900",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
