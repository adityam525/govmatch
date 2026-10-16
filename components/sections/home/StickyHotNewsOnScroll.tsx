'use client';

import { useEffect, useRef, useState } from 'react';

// Wraps the inline banner. Once the inline copy scrolls above the header, a
// pinned copy slides in under the header, so the news stays in view on the homepage.
export default function StickyHotNewsOnScroll({
  inline,
  pinned,
}: {
  inline: React.ReactNode;
  pinned: React.ReactNode;
}) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [showPinned, setShowPinned] = useState(false);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const HEADER_HEIGHT = 64;
    const check = () => {
      const rect = anchor.getBoundingClientRect();
      setShowPinned(rect.bottom < HEADER_HEIGHT);
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, []);

  return (
    <>
      <div ref={anchorRef}>{inline}</div>
      {showPinned && <div className="fixed inset-x-0 top-16 z-30">{pinned}</div>}
    </>
  );
}
