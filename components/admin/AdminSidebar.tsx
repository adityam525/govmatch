'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  LayoutDashboard, Bell, Building2, MapPin, Tags, Users, GraduationCap, Mail, Upload, Layers,
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
      { label: 'Education types', href: '/admin/qualification-categories', icon: Layers },
      { label: 'States', href: '/admin/states', icon: MapPin },
    ],
  },
];

// A swipeable tab strip on phones; the full-height side nav from md up.
export default function AdminSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/admin' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="w-full shrink-0 border-b border-neutral-200 bg-white md:h-full md:w-56 md:overflow-y-auto md:border-b-0 md:border-r md:p-3">
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
                  aria-current={isActive(item.href) ? 'page' : undefined}
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
