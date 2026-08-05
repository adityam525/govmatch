"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

interface HorizontalScrollerProps {
  children: ReactNode;
  className?: string;
}

export default function HorizontalScroller({
  children,
  className = "",
}: HorizontalScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateButtons = () => {
    const container = scrollRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);

    setCanScrollRight(
      container.scrollLeft + container.clientWidth < container.scrollWidth - 1,
    );
  };

  const scroll = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;

    container.scrollBy({
      left:
        direction === "left" ? -container.clientWidth : container.clientWidth,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const container = scrollRef.current;

    if (!container) return;

    updateButtons();

    container.addEventListener("scroll", updateButtons);
    window.addEventListener("resize", updateButtons);

    return () => {
      container.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, []);

  return (
    <div className="relative">
      {/* Left Arrow */}
      <button
        type="button"
        onClick={() => scroll("left")}
        disabled={!canScrollLeft}
        className={clsx(
          "absolute left-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border bg-white p-2 shadow-md transition md:flex",
          canScrollLeft
            ? "opacity-100 hover:bg-neutral-100"
            : "pointer-events-none opacity-0",
        )}
      >
        <ChevronLeft size={20} />
      </button>

      {/* Scroll Content */}
      <div
        ref={scrollRef}
        className={clsx(
          "flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide",
          className,
        )}
      >
        {children}
      </div>

      {/* Right Arrow */}
      <button
        type="button"
        onClick={() => scroll("right")}
        disabled={!canScrollRight}
        className={clsx(
          "absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border bg-white p-2 shadow-md transition md:flex",
          canScrollRight
            ? "opacity-100 hover:bg-neutral-100"
            : "pointer-events-none opacity-0",
        )}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
