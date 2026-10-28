'use client';

import { useEffect, useState } from 'react';

// A side nav pinned below the site header (and the Hot News banner, when there is one) next
// to the page content. Only the page scrolls, so there is a single scrollbar. The pinned
// height is also published as --shell-top so sticky elements inside the content can sit below it.
export default function AppShell({
  nav,
  children,
  maxWidth = 'max-w-7xl',
}: {
  nav: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  const [top, setTop] = useState(64);

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

  return (
    <div className="flex-1 bg-neutral-50" style={{ ['--shell-top' as string]: `${top}px` }}>
      <div className={`mx-auto flex w-full ${maxWidth} flex-col md:flex-row`}>
        <div className="md:sticky md:top-[var(--shell-top)] md:h-[calc(100dvh_-_var(--shell-top))] md:shrink-0 md:self-start">
          {nav}
        </div>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
