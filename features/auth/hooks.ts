'use client';

import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user ? { id: (session.user as any).id, name: session.user.name, email: session.user.email } : null,
    isLoggedIn: status === 'authenticated',
    loading: status === 'loading',
    logout: () => nextAuthSignOut({ callbackUrl: '/' }),
  };
}
