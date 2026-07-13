'use client';

import Link from 'next/link';
import { Shield, Search, User } from 'lucide-react';
import NavLink from './NavLink';
import NavDropdown from './NavDropdown';
import Button from '@/components/ui/Button';
import { useAuth } from '@/features/auth/hooks';

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-600 text-white">
            <Shield size={20} />
          </div>
          <div>
            <p className="text-lg font-bold text-neutral-900 leading-none">GovMatch</p>
            <p className="text-[10px] text-neutral-400 leading-none mt-0.5">Your Career. Our Mission</p>
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

        <div className="flex items-center gap-3">
          <button className="text-neutral-600 hover:text-neutral-900 p-2" aria-label="Search">
            <Search size={18} />
          </button>

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
      </div>
    </header>
  );
}
