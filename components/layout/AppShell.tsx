'use client';

import { useEffect, useState } from 'react';

// A full-height side nav next to a content pane that scrolls on its own, sized to the screen
// below the site header (and the Hot News banner, when there is one). Phones get the nav as a
// strip on top and the normal page scroll.
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
    <div className="flex-1 bg-neutral-50">
      <div
        style={{ ['--shell-h' as string]: `calc(100dvh - ${top}px)` }}
        className={`mx-auto flex w-full ${maxWidth} flex-col md:h-[var(--shell-h)] md:min-h-[30rem] md:flex-row md:overflow-hidden`}
      >
        {nav}
        <main className="min-w-0 flex-1 md:overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
