'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// A snap-scrolling row. Touch and trackpad scroll it natively; on desktop,
// arrow buttons appear only when there is more to scroll in that direction.
export default function HorizontalScroller({ children, label }: { children: React.ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    observer?.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      observer?.disconnect();
    };
  }, [update]);

  const scrollByPage = (direction: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.max(el.clientWidth * 0.8, 240), behavior: 'smooth' });
  };

  const arrow =
    'absolute top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-md hover:bg-neutral-50 md:flex';

  return (
    <div className="relative">
      <div
        ref={ref}
        role="region"
        aria-label={label}
        tabIndex={0}
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
    </div>
  );
}
