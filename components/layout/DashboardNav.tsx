'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Bookmark, ClipboardList, FileText, LayoutDashboard, User } from 'lucide-react';

const ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Profile', href: '/profile', icon: User },
  { label: 'Saved jobs', href: '/saved-jobs', icon: Bookmark },
  { label: 'Applications', href: '/applications', icon: ClipboardList },
  { label: 'Mock tests', href: '/mock-tests', icon: FileText },
];

// A swipeable tab strip on phones; the full-height side nav from md up.
export default function DashboardNav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="w-full shrink-0 md:h-full md:w-60 md:overflow-y-auto md:border-r md:border-neutral-200 md:bg-white">
      <nav
        aria-label="Account"
        className="flex gap-1 overflow-x-auto border-b border-neutral-200 bg-white px-3 py-2 [scrollbar-width:none] md:block md:space-y-1 md:overflow-visible md:border-b-0 md:p-3 [&::-webkit-scrollbar]:hidden"
      >
        {ITEMS.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(href) ? 'page' : undefined}
            className={clsx(
              'flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
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
