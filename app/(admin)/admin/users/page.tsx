'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  authProvider: string;
  createdAt: string;
  profile: { profileStrength: number } | null;
  subscription: { plan: string; status: string } | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin-users')
      .then((r) => r.json())
      .then((d) => setUsers(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleActive = async (id: string, current: boolean) => {
    setUpdating(id);
    try {
      await fetch(`/api/admin-users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !current }),
      });
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isActive: !current } : u)));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="p-6">
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-neutral-900">Users</h2>
          <p className="text-xs text-neutral-400">{users.length} total</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th className="text-left px-4 py-2.5 font-medium text-neutral-600">Name</th>
                <th className="text-left px-4 py-2.5 font-medium text-neutral-600">Email</th>
                <th className="text-left px-4 py-2.5 font-medium text-neutral-600">Role</th>
                <th className="text-left px-4 py-2.5 font-medium text-neutral-600">Profile</th>
                <th className="text-left px-4 py-2.5 font-medium text-neutral-600">Plan</th>
                <th className="text-left px-4 py-2.5 font-medium text-neutral-600">Status</th>
                <th className="text-right px-4 py-2.5 font-medium text-neutral-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-neutral-400">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-neutral-400">No users found.</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                    <td className="px-4 py-2.5 text-neutral-900">{u.name ?? '-'}</td>
                    <td className="px-4 py-2.5 text-neutral-600">{u.email}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">{u.role}</span>
                    </td>
                    <td className="px-4 py-2.5 text-neutral-600">{u.profile?.profileStrength ?? 0}%</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${u.subscription?.plan === 'PREMIUM' ? 'bg-primary-50 text-primary-600' : 'bg-neutral-100 text-neutral-500'}`}>
                        {u.subscription?.plan ?? 'FREE'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${u.isActive ? 'bg-green-50 text-success' : 'bg-red-50 text-danger'}`}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => toggleActive(u.id, u.isActive)}
                        disabled={updating === u.id}
                        className={`text-xs px-3 py-1.5 rounded-md border ${
                          u.isActive
                            ? 'border-red-200 text-danger hover:bg-red-50'
                            : 'border-green-200 text-success hover:bg-green-50'
                        }`}
                      >
                        {updating === u.id ? '...' : u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
