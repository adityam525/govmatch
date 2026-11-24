'use client';

import { useEffect, useState } from 'react';

interface Row { id: string; action: string; adminEmail: string | null; adminId: string | null; detail: string | null; ip: string | null; createdAt: string }

export default function AuditPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    fetch('/api/admin/audit').then((r) => (r.ok ? r.json() : Promise.reject())).then(setRows).catch(() => setError('Could not load the log.'));
  }, []);
  const bad = (a: string) => ['login_failed', 'login_blocked', 'account_locked'].includes(a);
  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl font-bold text-neutral-900">Audit log</h1>
      <p className="mt-1 text-sm text-neutral-600">The latest 200 admin events: logins, failures, lockouts and changes.</p>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      <div className="mt-4 overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-neutral-100 bg-neutral-50 text-left text-neutral-600">
            <th className="px-4 py-2.5 font-medium">When</th><th className="px-4 py-2.5 font-medium">Event</th><th className="px-4 py-2.5 font-medium">Who</th><th className="px-4 py-2.5 font-medium">Detail</th><th className="px-4 py-2.5 font-medium">IP</th>
          </tr></thead>
          <tbody>
            {rows.length === 0 && !error && <tr><td colSpan={5} className="py-8 text-center text-neutral-500">No events yet.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-neutral-50">
                <td className="whitespace-nowrap px-4 py-2.5 text-neutral-600">{new Date(r.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                <td className="px-4 py-2.5"><span className={'rounded-full px-2 py-0.5 text-xs font-medium ' + (bad(r.action) ? 'bg-red-50 text-red-700' : 'bg-neutral-100 text-neutral-700')}>{r.action}</span></td>
                <td className="px-4 py-2.5 text-neutral-800">{r.adminEmail ?? r.adminId ?? '-'}</td>
                <td className="max-w-xs truncate px-4 py-2.5 text-neutral-600" title={r.detail ?? ''}>{r.detail ?? ''}</td>
                <td className="px-4 py-2.5 text-neutral-500">{r.ip ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
