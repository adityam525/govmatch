'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  LayoutDashboard, Bell, Building2, MapPin, Tags, Users, GraduationCap, Mail, Upload,
} from 'lucide-react';

const navSections = [
  {
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { label: 'Jobs', href: '/admin/notifications', icon: Bell },
      { label: 'Import Jobs', href: '/admin/import', icon: Upload },
      { label: 'Users', href: '/admin/users', icon: Users },
      { label: 'Messages', href: '/admin/messages', icon: Mail },
    ],
  },
  {
    label: 'Lookup Data',
    items: [
      { label: 'Organizations', href: '/admin/organizations', icon: Building2 },
      { label: 'Categories', href: '/admin/categories', icon: Tags },
      { label: 'Qualifications', href: '/admin/qualifications', icon: GraduationCap },
      { label: 'States', href: '/admin/states', icon: MapPin },
    ],
  },
];

// A horizontally scrolling tab strip on phones; the vertical sidebar from md up.
export default function AdminSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/admin' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="w-full shrink-0 border-b border-neutral-200 bg-white md:min-h-screen md:w-56 md:border-b-0 md:border-r md:p-3">
      <nav className="flex gap-1 overflow-x-auto px-3 py-2 [scrollbar-width:none] md:block md:space-y-4 md:overflow-visible md:p-0 [&::-webkit-scrollbar]:hidden">
        {navSections.map((section, i) => (
          <div key={i} className="flex shrink-0 gap-1 md:block md:space-y-0.5">
            {section.label && (
              <p className="hidden px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-400 md:block">
                {section.label}
              </p>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive(item.href) ? 'bg-primary-50 text-primary-600' : 'text-neutral-600 hover:bg-neutral-50',
                  )}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
