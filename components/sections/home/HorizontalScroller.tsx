'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

interface HorizontalScrollerProps {
  children: React.ReactNode;
  label: string;
  autoPlay?: boolean;
  intervalMs?: number;
}

// A snap-scrolling row that also advances by itself. It never fights the user:
// hover, touch, wheel, arrow clicks and keyboard focus all hold it for a while.
export default function HorizontalScroller({
  children,
  label,
  autoPlay = true,
  intervalMs = 3500,
}: HorizontalScrollerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const hovering = useRef(false);
  const holding = useRef(false);
  const visible = useRef(true);
  const releaseTimer = useRef<number | null>(null);

  const holdFor = useCallback((ms: number) => {
    holding.current = true;
    if (releaseTimer.current) window.clearTimeout(releaseTimer.current);
    releaseTimer.current = window.setTimeout(() => {
      holding.current = false;
    }, ms);
  }, []);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    setOverflowing(el.scrollWidth > el.clientWidth + 4);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    resizeObserver?.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      resizeObserver?.disconnect();
    };
  }, [update]);

  // Only scroll while the row is actually on screen.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    return () => {
      if (releaseTimer.current) window.clearTimeout(releaseTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!autoPlay || userPaused || reducedMotion) return;
    const el = ref.current;
    if (!el) return;

    const tick = () => {
      if (hovering.current || holding.current || !visible.current || document.hidden) return;
      if (el.scrollWidth <= el.clientWidth + 4) return;

      const active = document.activeElement;
      if (active && el.contains(active) && active.matches(':focus-visible')) return;

      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
        return;
      }
      const box = el.getBoundingClientRect();
      for (const child of Array.from(el.children)) {
        const offset = child.getBoundingClientRect().left - box.left;
        if (offset > 8) {
          el.scrollBy({ left: offset, behavior: 'smooth' });
          return;
        }
      }
    };

    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [autoPlay, userPaused, reducedMotion, intervalMs]);

  const scrollByPage = (direction: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    holdFor(5000);
    el.scrollBy({ left: direction * Math.max(el.clientWidth * 0.8, 240), behavior: 'smooth' });
  };

  const arrow =
    'absolute top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-md hover:bg-neutral-50 md:flex';

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        hovering.current = true;
      }}
      onMouseLeave={() => {
        hovering.current = false;
      }}
    >
      <div
        ref={ref}
        role="region"
        aria-label={label}
        tabIndex={0}
        onPointerDown={() => {
          holding.current = true;
          if (releaseTimer.current) window.clearTimeout(releaseTimer.current);
        }}
        onPointerUp={() => holdFor(5000)}
        onPointerCancel={() => holdFor(5000)}
        onWheel={() => holdFor(5000)}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {canLeft && (
        <button type="button" aria-label="Scroll left" onClick={() => scrollByPage(-1)} className={`${arrow} -left-3`}>
          <ChevronLeft size={18} />
        </button>
      )}
      {canRight && (
        <button type="button" aria-label="Scroll right" onClick={() => scrollByPage(1)} className={`${arrow} -right-3`}>
          <ChevronRight size={18} />
        </button>
      )}

      {autoPlay && overflowing && !reducedMotion && (
        <div className="mt-1 flex justify-end">
          <button
            type="button"
            aria-pressed={userPaused}
            onClick={() => setUserPaused((paused) => !paused)}
            className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] text-neutral-500 hover:bg-neutral-100"
          >
            {userPaused ? <Play size={12} /> : <Pause size={12} />}
            {userPaused ? 'Play' : 'Pause'} auto-scroll
          </button>
        </div>
      )}
    </div>
  );
}
