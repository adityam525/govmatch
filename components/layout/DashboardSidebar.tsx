'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User, ClipboardList, Bookmark, FileText } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Profile', href: '/profile', icon: User },
  { label: 'Applications', href: '/applications', icon: ClipboardList },
  { label: 'Saved Jobs', href: '/saved-jobs', icon: Bookmark },
  { label: 'Mock Tests', href: '/mock-tests', icon: FileText },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-neutral-200 bg-white p-4">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                isActive ? 'bg-primary-50 text-primary-600' : 'text-neutral-600 hover:bg-neutral-50'
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
