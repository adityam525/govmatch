'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/features/auth/hooks';

interface RoleOption { id: string; name: string; }

const EMPLOYMENT_TYPES = [
  { value: 'PERMANENT', label: 'Permanent' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'APPRENTICE', label: 'Apprentice' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'TEMPORARY', label: 'Temporary' },
  { value: 'DEPUTATION', label: 'Deputation' },
];

const chip = (active: boolean) =>
  `text-xs px-3 py-1.5 rounded-full border transition-colors ${
    active
      ? 'bg-primary-600 text-white border-primary-600'
      : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
  }`;

export default function PreferencesCard() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/roles')
      .then((r) => r.json())
      .then((d) => setRoles(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/users/${user.id}/preferences`)
      .then((r) => r.json())
      .then((d) => {
        setRoleIds(d.preferredRoleIds ?? []);
        setTypes(d.preferredEmploymentTypes ?? []);
      })
      .catch(() => {});
  }, [user?.id]);

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const res = await fetch(`/api/users/${user.id}/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredRoleIds: roleIds, preferredEmploymentTypes: types }),
      });
      if (!res.ok) {
        setError('Could not save preferences. Please try again.');
        return;
      }
      setSaved(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card padding="lg" className="mt-6">
      <h2 className="text-sm font-bold text-neutral-900">Job Preferences</h2>
      <p className="text-xs text-neutral-600 mt-1">Fine-tune which jobs are recommended to you.</p>

      <div className="mt-4">
        <p className="text-xs font-medium text-neutral-600 mb-2">
          Preferred Roles <span className="text-neutral-400">(boosts matching jobs, never hides others)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {roles.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => { setRoleIds((prev) => toggle(prev, r.id)); setSaved(false); }}
              className={chip(roleIds.includes(r.id))}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs font-medium text-neutral-600 mb-2">
          Employment Type <span className="text-neutral-400">(if you pick any, other types won't count as eligible matches)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {EMPLOYMENT_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => { setTypes((prev) => toggle(prev, t.value)); setSaved(false); }}
              className={chip(types.includes(t.value))}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-5 pt-4 border-t border-neutral-100">
        <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
        {saved && <span className="text-xs text-success">Saved!</span>}
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>
    </Card>
  );
}
