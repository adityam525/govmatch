'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  LayoutDashboard, Bell, Building2, MapPin, Tags, Users, GraduationCap,
} from 'lucide-react';

const navSections = [
  {
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { label: 'Jobs', href: '/admin/notifications', icon: Bell },
      { label: 'Users', href: '/admin/users', icon: Users },
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

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-neutral-200 bg-white min-h-screen p-3">
      <nav className="space-y-4">
        {navSections.map((section, i) => (
          <div key={i}>
            {section.label && (
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive ? 'bg-primary-50 text-primary-600' : 'text-neutral-600 hover:bg-neutral-50'
                    )}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
