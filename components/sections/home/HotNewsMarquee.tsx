"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Flame } from "lucide-react";
import "./hot-news-marquee.css";

export interface HotItemView {
  key: string;
  tone: "urgent" | "info";
  label: string;
  title: string;
  href: string;
}

const SECONDS_PER_ITEM = 7;

function Chip({ item, tabbable }: { item: HotItemView; tabbable: boolean }) {
  return (
    <Link
      href={item.href}
      tabIndex={tabbable ? 0 : -1}
      aria-hidden={!tabbable}
      className={`mr-2 flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ${
        item.tone === "urgent"
          ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
      }`}
    >
      <span className="font-semibold">{item.label}</span>
      <span className="opacity-40">·</span>
      <span className="max-w-[16rem] truncate">{item.title}</span>
    </Link>
  );
}

export default function HotNewsMarquee({
  items,
  sticky = false,
}: {
  items: HotItemView[];
  sticky?: boolean;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const firstSet = useRef<HTMLDivElement>(null);
  const [scrolling, setScrolling] = useState(false);

  // Only animate when the list is wider than the visible strip.
  useEffect(() => {
    const check = () => {
      if (viewport.current && firstSet.current) {
        setScrolling(
          firstSet.current.scrollWidth > viewport.current.clientWidth,
        );
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [items]);

  return (
    <div
      className={`border-b border-amber-200 bg-amber-50 ${sticky ? "sticky top-16 z-30" : ""}`}
      role="region"
      aria-label="Hot news"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 md:px-6">
        <span className="flex shrink-0 items-center gap-1 text-xs font-bold uppercase tracking-wide text-amber-700">
          <Flame size={14} /> Hot
        </span>
        <div
          ref={viewport}
          className="hot-news-marquee min-w-0 flex-1 overflow-hidden"
          style={{
            ["--hot-news-duration" as string]: `${Math.max(items.length * SECONDS_PER_ITEM, 20)}s`,
          }}
        >
          <div className={scrolling ? "hot-news-track" : "flex"}>
            <div ref={firstSet} className="flex shrink-0">
              {items.map((item) => (
                <Chip key={item.key} item={item} tabbable />
              ))}
            </div>
            {scrolling && (
              <div className="flex shrink-0" aria-hidden>
                {items.map((item) => (
                  <Chip key={`${item.key}-copy`} item={item} tabbable={false} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
