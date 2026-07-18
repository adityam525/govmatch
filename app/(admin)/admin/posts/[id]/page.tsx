'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAdminRecord } from '@/features/admin/hooks';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { adminApi } from '@/features/admin/api';
import { Plus, Trash2 } from 'lucide-react';

interface QualificationOption { id: string; name: string; }
interface BranchOption { id: string; name: string; qualificationGroup: string; }
interface RoleOption { id: string; name: string; }
type KeyValuePair = { key: string; value: string };

const EMPLOYMENT_TYPES = [
  { value: 'PERMANENT', label: 'Permanent' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'APPRENTICE', label: 'Apprentice' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'TEMPORARY', label: 'Temporary' },
  { value: 'DEPUTATION', label: 'Deputation' },
];

function jsonToPairs(obj: Record<string, string> | null | undefined): KeyValuePair[] {
  if (!obj) return [];
  return Object.entries(obj).map(([key, value]) => ({ key, value }));
}

function pairsToJson(pairs: KeyValuePair[]): Record<string, string> | null {
  const filtered = pairs.filter((p) => p.key && p.value);
  if (filtered.length === 0) return null;
  return Object.fromEntries(filtered.map((p) => [p.key, p.value]));
}

function KeyValueEditor({ label, pairs, onChange }: { label: string; pairs: KeyValuePair[]; onChange: (p: KeyValuePair[]) => void }) {
  const update = (i: number, field: 'key' | 'value', val: string) => {
    const next = [...pairs];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };
  const add = () => onChange([...pairs, { key: '', value: '' }]);
  const remove = (i: number) => onChange(pairs.filter((_, idx) => idx !== i));

  return (
    <div className="md:col-span-2">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-neutral-600">{label}</label>
        <button type="button" onClick={add} className="text-xs text-primary-600 flex items-center gap-1">
          <Plus size={12} /> Add
        </button>
      </div>
      <div className="space-y-2">
        {pairs.map((pair, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={pair.key}
              onChange={(e) => update(i, 'key', e.target.value)}
              placeholder="Category / Label"
              className="flex-1 text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500"
            />
            <input
              value={pair.value}
              onChange={(e) => update(i, 'value', e.target.value)}
              placeholder="Value"
              className="flex-1 text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500"
            />
            <button type="button" onClick={() => remove(i)} className="text-neutral-400 hover:text-danger">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MultiSelectChips({ label, options, selected, onToggle }: { label: string; options: { id: string; name: string }[]; selected: string[]; onToggle: (id: string) => void }) {
  return (
    <div className="md:col-span-2">
      <label className="block text-xs font-medium text-neutral-600 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onToggle(opt.id)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              selected.includes(opt.id)
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
            }`}
          >
            {opt.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, loading, save } = useAdminRecord<any>('posts', id);
  const [qualifications, setQualifications] = useState<QualificationOption[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<any>(null);
  const [ageRelaxationPairs, setAgeRelaxationPairs] = useState<KeyValuePair[]>([]);
  const [physicalPairs, setPhysicalPairs] = useState<KeyValuePair[]>([]);
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  useEffect(() => {
    adminApi.list<QualificationOption>('qualifications').then(setQualifications).catch(() => {});
    adminApi.list<BranchOption>('branches').then(setBranches).catch(() => {});
    adminApi.list<RoleOption>('roles').then(setRoles).catch(() => {});
  }, []);

  useEffect(() => {
    if (!data) return;
    setForm({
      title: data.title ?? '',
      notificationId: data.notificationId ?? '',
      vacancies: data.vacancies ?? 0,
      qualificationId: data.qualificationId ?? '',
      minAge: data.minAge ?? '',
      maxAge: data.maxAge ?? '',
      payScale: data.payScale ?? '',
      educationDetails: data.educationDetails ?? '',
      employmentType: data.employmentType ?? 'PERMANENT',
    });
    setAgeRelaxationPairs(jsonToPairs(data.ageRelaxation));
    setPhysicalPairs(jsonToPairs(data.physicalCriteria));
    setSelectedBranchIds((data.branches ?? []).map((b: any) => b.id));
    setSelectedRoleIds((data.roles ?? []).map((r: any) => r.id));
  }, [data]);

  const updateField = (key: string, value: any) => setForm((prev: any) => ({ ...prev, [key]: value }));

  const toggleBranch = (branchId: string) => {
    setSelectedBranchIds((prev) => (prev.includes(branchId) ? prev.filter((b) => b !== branchId) : [...prev, branchId]));
  };

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) => (prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await save({
        ...form,
        ageRelaxation: pairsToJson(ageRelaxationPairs),
        physicalCriteria: pairsToJson(physicalPairs),
        branchIds: selectedBranchIds,
        roleIds: selectedRoleIds,
      });
      router.push('/admin/posts');
    } catch (err) {
      console.error(err);
      alert('Failed to save. Check console.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !form) return <div className="p-6">Loading...</div>;

  const inputClass = 'w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500';

  return (
    <div className="p-6 max-w-2xl">
      <Card padding="lg">
        <h2 className="text-lg font-bold text-neutral-900 mb-6">Edit Post</h2>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Notification ID *</label>
            <input required value={form.notificationId} onChange={(e) => updateField('notificationId', e.target.value)} className={inputClass} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Post Title *</label>
            <input required value={form.title} onChange={(e) => updateField('title', e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Vacancies *</label>
            <input required type="number" value={form.vacancies} onChange={(e) => updateField('vacancies', e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Qualification *</label>
            <select required value={form.qualificationId} onChange={(e) => updateField('qualificationId', e.target.value)} className={inputClass}>
              <option value="">Select...</option>
              {qualifications.map((q) => <option key={q.id} value={q.id}>{q.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Min Age</label>
            <input type="number" value={form.minAge} onChange={(e) => updateField('minAge', e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Max Age</label>
            <input type="number" value={form.maxAge} onChange={(e) => updateField('maxAge', e.target.value)} className={inputClass} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Employment Type</label>
            <select value={form.employmentType} onChange={(e) => updateField('employmentType', e.target.value)} className={inputClass}>
              {EMPLOYMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Pay Scale</label>
            <input value={form.payScale} onChange={(e) => updateField('payScale', e.target.value)} className={inputClass} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Education Details</label>
            <textarea value={form.educationDetails} onChange={(e) => updateField('educationDetails', e.target.value)} rows={2} className={inputClass} placeholder="e.g. Graduate in any discipline from a recognized university" />
          </div>

          <MultiSelectChips label="Branches (leave empty if branch-agnostic)" options={branches} selected={selectedBranchIds} onToggle={toggleBranch} />
          <MultiSelectChips label="Roles" options={roles} selected={selectedRoleIds} onToggle={toggleRole} />

          <KeyValueEditor label="Age Relaxation (by category)" pairs={ageRelaxationPairs} onChange={setAgeRelaxationPairs} />
          <KeyValueEditor label="Physical Criteria" pairs={physicalPairs} onChange={setPhysicalPairs} />

          <div className="md:col-span-2 flex gap-3 pt-4 border-t border-neutral-100 mt-2">
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.push('/admin/posts')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
