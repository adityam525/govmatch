'use client';

import { useEffect, useState } from 'react';

interface RoleOption { id: string; name: string }

const EMPLOYMENT_TYPES = [
  { value: 'PERMANENT', label: 'Permanent' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'APPRENTICE', label: 'Apprentice' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'TEMPORARY', label: 'Temporary' },
  { value: 'DEPUTATION', label: 'Deputation' },
];

const chip = (active: boolean) =>
  `rounded-full border px-3 py-1.5 text-xs transition-colors ${
    active
      ? 'border-primary-600 bg-primary-600 text-white'
      : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
  }`;

const toggle = (list: string[], value: string) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

export default function PreferencesFields({
  roleIds,
  types,
  onChange,
}: {
  roleIds: string[];
  types: string[];
  onChange: (next: { roleIds: string[]; types: string[] }) => void;
}) {
  const [roles, setRoles] = useState<RoleOption[]>([]);

  useEffect(() => {
    fetch('/api/roles')
      .then((r) => r.json())
      .then((d) => setRoles(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  return (
    <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-base font-bold text-neutral-900">Job preferences</h2>
      <p className="mt-1 text-sm text-neutral-600">Optional. Fine-tune which jobs are recommended to you.</p>

      <div className="mt-4">
        <p className="mb-2 text-xs font-medium text-neutral-600">
          Preferred roles <span className="text-neutral-400">(boosts matching jobs, never hides others)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {roles.map((r) => (
            <button key={r.id} type="button" onClick={() => onChange({ roleIds: toggle(roleIds, r.id), types })} className={chip(roleIds.includes(r.id))}>
              {r.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs font-medium text-neutral-600">
          Job type <span className="text-neutral-400">(if you pick any, other types will show as not matching)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {EMPLOYMENT_TYPES.map((t) => (
            <button key={t.value} type="button" onClick={() => onChange({ roleIds, types: toggle(types, t.value) })} className={chip(types.includes(t.value))}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
