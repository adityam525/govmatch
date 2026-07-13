'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks';
import Card from '@/components/ui/Card';

interface ApplicationRow {
  id: string;
  status: string;
  appliedAt: string;
  notification?: { title: string; organization?: { name: string } };
}

const columns = [
  { key: 'APPLIED', label: 'Applied' },
  { key: 'EXAM_SCHEDULED', label: 'Exam Scheduled' },
  { key: 'RESULT_AWAITED', label: 'Result Awaited' },
  { key: 'SELECTED', label: 'Selected' },
];

export default function ApplicationsPage() {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/users/${user.id}/applications`)
      .then((r) => r.json())
      .then((data) => setApplications(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const updateStatus = async (id: string, status: string) => {
    if (!user?.id) return;
    await fetch(`/api/users/${user.id}/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  if (authLoading) return <div className="max-w-6xl mx-auto px-6 py-8 text-sm text-neutral-600">Loading...</div>;
  if (!isLoggedIn) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Card padding="lg"><p className="text-sm text-neutral-600">Please log in to view your applications.</p></Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-lg font-bold text-neutral-900 mb-1">My Applications</h1>
      <p className="text-sm text-neutral-600 mb-6">Track every application from apply to result.</p>

      {loading ? (
        <p className="text-sm text-neutral-600">Loading...</p>
      ) : applications.length === 0 ? (
        <Card padding="lg">
          <p className="text-sm text-neutral-600 text-center py-8">
            No applications tracked yet. Mark a job as "Applied" from its detail page to start tracking it here.
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-4 gap-4">
          {columns.map((col) => (
            <div key={col.key} className="bg-neutral-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-neutral-600 mb-3 uppercase tracking-wide">{col.label}</p>
              <div className="space-y-2">
                {applications
                  .filter((app) => app.status === col.key)
                  .map((app) => (
                    <div key={app.id} className="bg-white border border-neutral-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-neutral-900">{app.notification?.title ?? 'Unknown'}</p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">{app.notification?.organization?.name}</p>
                      <select
                        value={app.status}
                        onChange={(e) => updateStatus(app.id, e.target.value)}
                        className="mt-2 w-full text-[10px] border border-neutral-200 rounded px-1.5 py-1"
                      >
                        {columns.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                      </select>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
