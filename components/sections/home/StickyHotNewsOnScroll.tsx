'use client';

import { useEffect, useRef, useState } from 'react';

// Wraps the inline banner. Once the inline copy scrolls above the header, a pinned copy
// sits directly under the header. The header's real bottom edge is measured, not assumed.
export default function StickyHotNewsOnScroll({
  inline,
  pinned,
}: {
  inline: React.ReactNode;
  pinned: React.ReactNode;
}) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [showPinned, setShowPinned] = useState(false);
  const [top, setTop] = useState(64);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const header = document.querySelector('header');
    const measure = () => {
      const bottom = header ? Math.max(0, Math.round(header.getBoundingClientRect().bottom)) : 64;
      setTop(bottom);
      setShowPinned(anchor.getBoundingClientRect().bottom < bottom);
    };
    measure();
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    const observer = typeof ResizeObserver !== 'undefined' && header ? new ResizeObserver(measure) : null;
    if (observer && header) observer.observe(header);
    return () => {
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
      observer?.disconnect();
    };
  }, []);

  return (
    <>
      <div ref={anchorRef}>{inline}</div>
      {showPinned && (
        <div className="fixed inset-x-0 z-30" style={{ top }}>
          {pinned}
        </div>
      )}
    </>
  );
}
