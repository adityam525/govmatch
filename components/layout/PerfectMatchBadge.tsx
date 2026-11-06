'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/hooks';

// A small count that sits on the corner of the user icon. Place it inside a "relative" wrapper.
export default function PerfectMatchBadge() {
  const { user, isLoggedIn } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isLoggedIn || !user?.id) { setCount(0); return; }
    let cancelled = false;
    fetch('/api/users/' + user.id + '/perfect-matches')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!cancelled) setCount(d && d.profileComplete ? Number(d.count) || 0 : 0); })
      .catch(() => { if (!cancelled) setCount(0); });
    return () => { cancelled = true; };
  }, [isLoggedIn, user?.id]);

  if (count <= 0) return null;
  const message = count === 1 ? '1 open job matches your profile 100%' : count + ' open jobs match your profile 100%';

  return (
    <span className="group/badge absolute -right-1.5 -top-1.5 z-10">
      <span
        tabIndex={0}
        role="status"
        aria-label={message}
        className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white outline-none focus-visible:ring-primary-400"
      >
        {count > 99 ? '99+' : count}
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute right-0 top-full mt-2 hidden w-max max-w-[14rem] rounded-lg bg-neutral-900 px-3 py-2 text-xs font-medium text-white shadow-lg group-hover/badge:block group-focus-within/badge:block"
      >
        {message}
      </span>
    </span>
  );
}
