'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';

interface Subscription {
  plan: string;
  status: string;
  expiresAt: string | null;
}

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  authProvider: string;
  createdAt: string;
  profile: { profileStrength: number } | null;
  subscription: Subscription | null;
}

const PLAN_CHOICES = [
  { value: '', label: 'Change plan...' },
  { value: 'FREE', label: 'Free' },
  { value: 'PREMIUM:30', label: 'Premium - 30 days' },
  { value: 'PREMIUM:365', label: 'Premium - 1 year' },
  { value: 'PREMIUM:0', label: 'Premium - no expiry' },
];

function planState(sub: Subscription | null): { premium: boolean; note: string } {
  if (!sub || sub.plan !== 'PREMIUM') return { premium: false, note: '' };
  const expired = sub.status !== 'ACTIVE' || (!!sub.expiresAt && new Date(sub.expiresAt) < new Date());
  if (expired) return { premium: false, note: 'expired' };
  return {
    premium: true,
    note: sub.expiresAt ? `until ${new Date(sub.expiresAt).toLocaleDateString('en-IN')}` : 'no expiry',
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin-users')
      .then((r) => r.json())
      .then((d) => setUsers(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const patchUser = async (id: string, body: Record<string, unknown>) => {
    setBusyId(id);
    setError('');
    try {
      const res = await fetch(`/api/admin-users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message ?? 'Could not update this user.');
        return;
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? { ...u, isActive: data.isActive ?? u.isActive, subscription: data.subscription ?? u.subscription }
            : u,
        ),
      );
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const changePlan = (id: string, choice: string) => {
    if (!choice) return;
    const [plan, days] = choice.split(':');
    patchUser(id, plan === 'FREE' ? { plan: 'FREE' } : { plan: 'PREMIUM', days: Number(days) });
  };

  return (
    <div className="p-4 sm:p-6">
      <Card padding="lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">Users</h2>
          <p className="text-xs text-neutral-400">{users.length} total</p>
        </div>

        {error && <p className="mb-3 text-sm text-danger">{error}</p>}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                {['Name', 'Email', 'Role', 'Profile', 'Plan', 'Status', 'Action'].map((heading, i) => (
                  <th
                    key={heading}
                    className={`px-4 py-2.5 font-medium text-neutral-600 ${i === 6 ? 'text-right' : 'text-left'}`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-8 text-center text-neutral-400">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-neutral-400">No users found.</td></tr>
              ) : (
                users.map((u) => {
                  const plan = planState(u.subscription);
                  return (
                    <tr key={u.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                      <td className="px-4 py-2.5 text-neutral-900">{u.name ?? '-'}</td>
                      <td className="px-4 py-2.5 text-neutral-600">{u.email}</td>
                      <td className="px-4 py-2.5">
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">{u.role}</span>
                      </td>
                      <td className="px-4 py-2.5 text-neutral-600">{u.profile?.profileStrength ?? 0}%</td>
                      <td className="px-4 py-2.5">
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                              plan.premium ? 'bg-primary-50 text-primary-600' : 'bg-neutral-100 text-neutral-500'
                            }`}
                          >
                            {plan.premium ? 'Premium' : 'Free'}
                            {plan.note ? ` · ${plan.note}` : ''}
                          </span>
                          <select
                            value=""
                            disabled={busyId === u.id}
                            onChange={(e) => changePlan(u.id, e.target.value)}
                            aria-label={`Change plan for ${u.email}`}
                            className="rounded-md border border-neutral-200 bg-white px-1.5 py-1 text-xs text-neutral-600 disabled:opacity-50"
                          >
                            {PLAN_CHOICES.map((c) => (
                              <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                           u.isActive ? 'bg-green-50 text-success' : 'bg-red-50 text-danger'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={() => patchUser(u.id, { isActive: !u.isActive })}
                          disabled={busyId === u.id}
                          className={`rounded-md border px-3 py-1.5 text-xs disabled:opacity-50 ${
                            u.isActive
                              ? 'border-red-200 text-danger hover:bg-red-50'
                              : 'border-green-200 text-success hover:bg-green-50'
                          }`}
                        >
                          {busyId === u.id ? '...' : u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
