'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  LayoutDashboard, Bell, Briefcase, Building2, MapPin, Tags,
  GraduationCap, FileCheck2, Trophy, KeyRound, FileText,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Jobs', href: '/admin/notifications', icon: Bell },
  { label: 'Posts', href: '/admin/posts', icon: Briefcase },
  { label: 'Organizations', href: '/admin/organizations', icon: Building2 },
  { label: 'States', href: '/admin/states', icon: MapPin },
  { label: 'Categories', href: '/admin/categories', icon: Tags },
  { label: 'Qualifications', href: '/admin/qualifications', icon: GraduationCap },
  { label: 'Admit Cards', href: '/admin/admit-cards', icon: FileCheck2 },
  { label: 'Results', href: '/admin/results', icon: Trophy },
  { label: 'Answer Keys', href: '/admin/answer-keys', icon: KeyRound },
  { label: 'Documents', href: '/admin/documents', icon: FileText },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-neutral-200 bg-white min-h-screen p-3">
      <nav className="space-y-0.5">
        {navItems.map((item) => {
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
      </nav>
    </aside>
  );
}
