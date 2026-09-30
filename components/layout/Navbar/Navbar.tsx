'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, Search, User, Menu, X, ChevronDown } from 'lucide-react';
import NavLink from './NavLink';
import NavDropdown from './NavDropdown';
import Button from '@/components/ui/Button';
import { useAuth } from '@/features/auth/hooks';

const MOBILE_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Jobs', href: '/jobs' },
  { label: 'Upcoming Exams', href: '/exams' },
  { label: 'Admit Cards', href: '/admit-cards' },
  { label: 'Results', href: '/results' },
];

const MOBILE_GROUPS = [
  {
    label: 'Study Zone',
    items: [
      { label: 'Mock Tests', href: '/study-zone/mock-tests' },
      { label: 'Study Material', href: '/study-zone' },
    ],
  },
  {
    label: 'Resources',
    items: [
      { label: 'GATE Calculator', href: '/resources/gate-calculator' },
      { label: 'All Resources', href: '/resources' },
    ],
  },
];

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const closeMobile = () => {
    setMobileOpen(false);
    setExpandedGroup(null);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0" onClick={closeMobile}>
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-600 text-white shrink-0">
            <Shield size={20} />
          </div>
          <div className="hidden xs:block">
            <p className="text-base md:text-lg font-bold text-neutral-900 leading-none">GovMatch</p>
            <p className="text-[10px] text-neutral-400 leading-none mt-0.5 hidden sm:block">Your Career. Our Mission</p>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/jobs">Jobs</NavLink>
          <NavLink href="/exams">Upcoming Exams</NavLink>
          <NavLink href="/admit-cards">Admit Cards</NavLink>
          <NavLink href="/results">Results</NavLink>
          <NavDropdown
            label="Study Zone"
            items={[
              { label: 'Mock Tests', href: '/study-zone/mock-tests' },
              { label: 'Study Material', href: '/study-zone' },
            ]}
          />
          <NavDropdown
            label="Resources"
            items={[
              { label: 'GATE Calculator', href: '/resources/gate-calculator' },
              { label: 'All Resources', href: '/resources' },
            ]}
          />
          <NavLink href="/blog">Blog</NavLink>
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <button className="hidden sm:block text-neutral-600 hover:text-neutral-900 p-2" aria-label="Search">
            <Search size={18} />
          </button>

          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <Link href="/profile" className="flex items-center gap-2 text-sm font-medium text-neutral-900">
                  <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                    <User size={14} />
                  </div>
                  {user?.name?.split(' ')[0] ?? 'Account'}
                </Link>
                <button onClick={logout} className="text-xs text-neutral-500 hover:text-danger">
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="secondary" size="sm">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" size="sm">Sign Up Free</Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="lg:hidden text-neutral-700 p-2 -mr-2"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-neutral-200 bg-white max-h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="px-4 py-3 space-y-1">
            {MOBILE_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobile}
                className="block px-2 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-md"
              >
                {link.label}
              </Link>
            ))}

            {MOBILE_GROUPS.map((group) => (
              <div key={group.label}>
                <button
                  onClick={() => setExpandedGroup((prev) => (prev === group.label ? null : group.label))}
                  className="w-full flex items-center justify-between px-2 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-md"
                >
                  {group.label}
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${expandedGroup === group.label ? 'rotate-180' : ''}`}
                  />
                </button>
                {expandedGroup === group.label && (
                  <div className="pl-4 space-y-1 pb-1">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMobile}
                        className="block px-2 py-2 text-sm text-neutral-600 hover:bg-neutral-50 rounded-md"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <Link
              href="/blog"
              onClick={closeMobile}
              className="block px-2 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-md"
            >
              Blog
            </Link>
          </nav>

          <div className="border-t border-neutral-100 px-4 py-3">
            {isLoggedIn ? (
              <div className="space-y-2">
                <Link
                  href="/profile"
                  onClick={closeMobile}
                  className="flex items-center gap-2 text-sm font-medium text-neutral-900 px-2 py-2"
                >
                  <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                    <User size={14} />
                  </div>
                  {user?.name?.split(' ')[0] ?? 'Account'}
                </Link>
                <button
                  onClick={() => { logout(); closeMobile(); }}
                  className="w-full text-left text-sm text-danger px-2 py-2"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link href="/login" onClick={closeMobile} className="flex-1">
                  <Button variant="secondary" size="sm" fullWidth>Login</Button>
                </Link>
                <Link href="/signup" onClick={closeMobile} className="flex-1">
                  <Button variant="primary" size="sm" fullWidth>Sign Up Free</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
