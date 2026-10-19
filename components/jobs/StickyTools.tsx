'use client';

import { useEffect, useRef, useState } from 'react';

// Pins its children just below the site header (and the Hot News banner, when
// there is one). On phones it hides while scrolling down and returns on scroll up,
// so it never eats the screen.
export default function StickyTools({ children }: { children: React.ReactNode }) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState(64);
  const [stuck, setStuck] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Header + banner heights decide where the bar sticks.
  useEffect(() => {
    const measure = () => {
      const header = document.querySelector('header');
      const banner = document.querySelector('[aria-label="Hot news"]');
      const headerHeight = header instanceof HTMLElement ? header.offsetHeight : 64;
      const bannerHeight = banner instanceof HTMLElement ? banner.offsetHeight : 0;
      setTop(headerHeight + bannerHeight);
    };
    measure();
    const later = window.setTimeout(measure, 400);
    window.addEventListener('resize', measure);
    return () => {
      window.clearTimeout(later);
      window.removeEventListener('resize', measure);
    };
  }, []);

  // "Stuck" = the marker above the bar has scrolled past the sticky offset.
  useEffect(() => {
    const marker = sentinelRef.current;
    if (!marker || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting && entry.boundingClientRect.top < top),
      { rootMargin: `-${top}px 0px 0px 0px`, threshold: 0 },
    );
    observer.observe(marker);
    return () => observer.disconnect();
  }, [top]);

  // Phones only: hide on scroll down, show on scroll up.
  useEffect(() => {
    const phone = window.matchMedia('(max-width: 767px)');
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (!phone.matches) {
        setHidden(false);
        last = y;
        return;
      }
      const delta = y - last;
      if (Math.abs(delta) < 8) return;
      setHidden(delta > 0 && y > 160);
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div ref={sentinelRef} aria-hidden className="h-px" />
      <div
        style={{
          top,
          transform: hidden ? 'translateY(-120%)' : undefined,
          visibility: hidden ? 'hidden' : 'visible',
          transition: `transform 200ms ease, visibility 0s linear ${hidden ? '200ms' : '0s'}`,
        }}
        className={`sticky z-20 -mx-6 px-6 pb-1 pt-2 transition-colors ${
          stuck ? 'border-b border-neutral-200 bg-white/95 shadow-sm backdrop-blur' : ''
        }`}
      >
        {children}
      </div>
    </>
  );
}
