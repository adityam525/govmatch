'use client';

import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <AdminSidebar />
      <div className="flex-1">
        <div className="border-b border-neutral-200 bg-white px-6 py-4 flex items-center justify-between">
          <p className="text-lg font-bold text-neutral-900">GovMatch Admin</p>
          <button
            onClick={async () => {
              await fetch('/api/admin-auth', { method: 'DELETE' });
              window.location.href = '/admin/login';
            }}
            className="text-xs text-neutral-500 hover:text-danger"
          >
            Logout
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
