'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/features/auth/hooks';
import { LIMITS } from '@/lib/mock-test';

interface Row { id: string; title: string; durationMinutes: number; questionCount: number; attempts: number; updatedAt: string }

export default function MockTestsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}/mock-tests`);
      const data = await res.json();
      if (!res.ok) throw new Error();
      setRows(data);
    } catch {
      setError('Could not load your tests.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { if (user?.id) load(user.id); }, [user?.id]);

  const remove = async (r: Row) => {
    if (!user?.id || !confirm(`Delete "${r.title}" and its ${r.attempts} attempt(s)? This cannot be undone.`)) return;
    const res = await fetch(`/api/users/${user.id}/mock-tests/${r.id}`, { method: 'DELETE' });
    if (!res.ok) { setError('Could not delete the test.'); return; }
    setRows((prev) => prev.filter((x) => x.id !== r.id));
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-neutral-900">My mock tests</h1>
          <p className="mt-1 text-sm text-neutral-600">Tests you create are private to you. {rows.length} of {LIMITS.tests} used.</p>
        </div>
        <Link href="/mock-tests/new"><Button variant="primary" size="sm" icon={<Plus size={14} />}>Create test</Button></Link>
      </div>

      {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}

      {loading ? (
        <p className="text-sm text-neutral-500">Loading...</p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white py-14 text-center">
          <p className="text-sm text-neutral-600">You have not created any tests yet.</p>
          <Link href="/mock-tests/new" className="mt-2 inline-block text-sm font-medium text-primary-600 hover:underline">Create your first test</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-neutral-900">{r.title}</p>
                <p className="mt-0.5 text-xs text-neutral-500">{r.questionCount} questions · {r.durationMinutes} min · {r.attempts} attempt{r.attempts === 1 ? '' : 's'}</p>
              </div>
              <Link href={`/mock-tests/${r.id}`} className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"><Pencil size={14} /> Edit</Link>
              <button type="button" onClick={() => remove(r)} aria-label={`Delete ${r.title}`} className="rounded-md p-2 text-neutral-400 hover:bg-red-50 hover:text-danger"><Trash2 size={16} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
