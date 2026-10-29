'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface Branch { id: string; name: string; slug: string }

const input = 'w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500';

async function call(url: string, method: string, body?: unknown) {
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? 'Something went wrong.');
  return data;
}

export default function BranchManager({ qualificationId, qualificationSlug }: { qualificationId: string; qualificationSlug: string }) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/branches?qualificationSlugs=${encodeURIComponent(qualificationSlug)}`);
      const data = await res.json();
      setBranches(Array.isArray(data) ? data : []);
    } catch {
      setError('Could not load the branches.');
    } finally {
      setLoading(false);
    }
  }, [qualificationSlug]);

  useEffect(() => { load(); }, [load]);

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setError('');
    try {
      await action();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card padding="lg" className="mt-6">
      <h2 className="text-base font-bold text-neutral-900">Branches</h2>
      <p className="mt-1 text-xs text-neutral-500">
        Fields of study for this qualification, used on profiles and job requirements. A name can exist only once across all qualifications, so use names like &quot;Physics (M.Sc)&quot; when another qualification already has &quot;Physics&quot;.
      </p>

      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}

      <div className="mt-4 flex gap-2">
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New branch name" maxLength={120} className={input} />
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={busy || !newName.trim()}
          onClick={() => run(async () => { await call('/api/branches', 'POST', { name: newName, qualificationId }); setNewName(''); })}
        >
          Add
        </Button>
      </div>

      {loading ? (
        <p className="mt-4 text-xs text-neutral-400">Loading...</p>
      ) : branches.length === 0 ? (
        <p className="mt-4 text-xs text-neutral-400">No branches yet. Posts that ask for this qualification will accept any branch.</p>
      ) : (
        <ul className="mt-4 divide-y divide-neutral-100">
          {branches.map((b) => (
            <li key={b.id} className="flex items-center gap-2 py-2">
              {editing?.id === b.id ? (
                <>
                  <input value={editing.name} onChange={(e) => setEditing({ id: b.id, name: e.target.value })} maxLength={120} className={input} autoFocus />
                  <button type="button" disabled={busy || !editing.name.trim()} aria-label="Save name" onClick={() => run(async () => { await call(`/api/branches/${b.id}`, 'PATCH', { name: editing.name }); setEditing(null); })} className="rounded-md p-2 text-success hover:bg-green-50 disabled:opacity-50"><Check size={15} /></button>
                  <button type="button" aria-label="Cancel" onClick={() => setEditing(null)} className="rounded-md p-2 text-neutral-400 hover:bg-neutral-100"><X size={15} /></button>
                </>
              ) : (
                <>
                  <span className="min-w-0 flex-1 truncate text-sm text-neutral-800">{b.name}</span>
                  <button type="button" aria-label={`Rename ${b.name}`} onClick={() => setEditing({ id: b.id, name: b.name })} className="rounded-md p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"><Pencil size={14} /></button>
                  <button
                    type="button"
                    disabled={busy}
                    aria-label={`Delete ${b.name}`}
                    onClick={() => { if (confirm(`Delete the branch "${b.name}"?`)) run(() => call(`/api/branches/${b.id}`, 'DELETE')); }}
                    className="rounded-md p-2 text-neutral-400 hover:bg-red-50 hover:text-danger disabled:opacity-50"
                  ><Trash2 size={14} /></button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
