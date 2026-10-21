'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Bookmark, ClipboardList, LayoutDashboard, User } from 'lucide-react';

const ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Profile', href: '/profile', icon: User },
  { label: 'Saved jobs', href: '/saved-jobs', icon: Bookmark },
  { label: 'Applications', href: '/applications', icon: ClipboardList },
];

// A swipeable tab strip on phones. From md up it pins just below the site header and the
// Hot News banner (when there is one), so it stays put while the content scrolls.
export default function DashboardNav() {
  const pathname = usePathname();
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

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside style={{ top }} className="w-full shrink-0 md:sticky md:w-60 md:self-start md:p-4 md:pr-0">
      <nav
        aria-label="Account"
        className="flex gap-1 overflow-x-auto border-b border-neutral-200 bg-white px-3 py-2 [scrollbar-width:none] md:block md:space-y-1 md:overflow-visible md:rounded-2xl md:border md:p-2 md:shadow-sm [&::-webkit-scrollbar]:hidden"
      >
        {ITEMS.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(href) ? 'page' : undefined}
            className={clsx(
              'flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive(href) ? 'bg-primary-50 text-primary-700' : 'text-neutral-600 hover:bg-neutral-50',
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
