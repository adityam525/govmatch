'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/features/auth/hooks';

interface Category { id: string; name: string; slug: string }
interface QualOption { id: string; name: string; slug: string; level: number }
interface BranchOption { id: string; name: string; slug: string }

interface Row {
  key: number;
  categorySlug: string;
  qualificationId: string;
  branchId: string;
  subject: string;
  institution: string;
  yearOfPassing: string;
  percentage: string;
}

interface SavedRow {
  qualificationId: string;
  qualification: { categories: { slug: string }[] };
  branchId: string | null;
  subject: string | null;
  institution: string | null;
  yearOfPassing: number | null;
  percentage: number | null;
}

const inputClass =
  'h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100';
const currentYear = new Date().getFullYear();

function EducationRow({
  index,
  row,
  categories,
  onChange,
  onRemove,
}: {
  index: number;
  row: Row;
  categories: Category[];
  onChange: (patch: Partial<Row>) => void;
  onRemove: () => void;
}) {
  const [quals, setQuals] = useState<QualOption[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);

  useEffect(() => {
    if (!row.categorySlug) { setQuals([]); return; }
    let cancelled = false;
    fetch(`/api/qualifications?categorySlugs=${encodeURIComponent(row.categorySlug)}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setQuals(Array.isArray(d) ? d : []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [row.categorySlug]);

  const selected = quals.find((q) => q.id === row.qualificationId);
  const selectedSlug = selected?.slug;

  useEffect(() => {
    if (!selectedSlug) { setBranches([]); return; }
    let cancelled = false;
    fetch(`/api/branches?qualificationSlugs=${encodeURIComponent(selectedSlug)}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setBranches(Array.isArray(d) ? d : []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [selectedSlug]);

  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Qualification {index + 1}</p>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove qualification ${index + 1}`}
          className="rounded-md p-1.5 text-neutral-400 hover:bg-red-50 hover:text-danger"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-600">Education type</span>
          <select
            value={row.categorySlug}
            onChange={(e) => onChange({ categorySlug: e.target.value, qualificationId: '', branchId: '' })}
            className={inputClass}
          >
            <option value="">Select...</option>
            {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-600">Qualification</span>
          <select
            value={row.qualificationId}
            disabled={!row.categorySlug}
            onChange={(e) => onChange({ qualificationId: e.target.value, branchId: '' })}
            className={`${inputClass} disabled:bg-neutral-100`}
          >
            <option value="">{row.categorySlug ? 'Select...' : 'Choose a type first'}</option>
            {quals.map((q) => <option key={q.id} value={q.id}>{q.name}</option>)}
          </select>
        </label>

        {branches.length > 0 && (
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-600">Branch / stream</span>
            <select value={row.branchId} onChange={(e) => onChange({ branchId: e.target.value })} className={inputClass}>
              <option value="">Select...</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </label>
        )}

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-600">
            {branches.length > 0 ? 'Other subject (if not listed)' : 'Subject / specialisation'}
          </span>
          <input
            type="text"
            value={row.subject}
            maxLength={100}
            placeholder="e.g. Economics"
            onChange={(e) => onChange({ subject: e.target.value })}
            className={inputClass}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-neutral-600">School / college / university (optional)</span>
          <input
            type="text"
            value={row.institution}
            maxLength={150}
            onChange={(e) => onChange({ institution: e.target.value })}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-600">Year of passing</span>
          <input
            type="number"
            inputMode="numeric"
            min={1950}
            max={currentYear}
            value={row.yearOfPassing}
            onChange={(e) => onChange({ yearOfPassing: e.target.value })}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-600">Marks (%)</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step="0.01"
            value={row.percentage}
            onChange={(e) => onChange({ percentage: e.target.value })}
            className={inputClass}
          />
        </label>
      </div>
    </div>
  );
}

export default function EducationSection() {
  const { user } = useAuth();
  const nextKey = useRef(1);
  const blankRow = (): Row => ({
    key: nextKey.current++,
    categorySlug: '',
    qualificationId: '',
    branchId: '',
    subject: '',
    institution: '',
    yearOfPassing: '',
    percentage: '',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/qualification-categories')
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const toRows = (saved: SavedRow[]): Row[] =>
    saved.length === 0
      ? [blankRow()]
      : saved.map((s) => ({
          key: nextKey.current++,
          categorySlug: s.qualification.categories[0]?.slug ?? '',
          qualificationId: s.qualificationId,
          branchId: s.branchId ?? '',
          subject: s.subject ?? '',
          institution: s.institution ?? '',
          yearOfPassing: s.yearOfPassing?.toString() ?? '',
          percentage: s.percentage?.toString() ?? '',
        }));

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/users/${user.id}/education`)
      .then((r) => r.json())
      .then((d) => setRows(toRows(Array.isArray(d) ? d : [])))
      .catch(() => setRows([blankRow()]))
      .finally(() => setLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const update = (key: number, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
    setMessage(null);
  };

  const validate = (list: Row[]): string | null => {
    for (let i = 0; i < list.length; i++) {
      const r = list[i];
      if (!r.qualificationId) return `Qualification ${i + 1}: choose a qualification, or remove the row.`;
      if (r.yearOfPassing) {
        const y = Number(r.yearOfPassing);
        if (!Number.isInteger(y) || y < 1950 || y > currentYear) return `Qualification ${i + 1}: enter a year between 1950 and ${currentYear}.`;
      }
      if (r.percentage) {
        const p = Number(r.percentage);
        if (!Number.isFinite(p) || p < 0 || p > 100) return `Qualification ${i + 1}: marks must be between 0 and 100.`;
      }
    }
    return null;
  };

  const save = async () => {
    if (!user?.id) return;
    // A completely empty row is just ignored.
    const filled = rows.filter(
      (r) => r.categorySlug || r.qualificationId || r.subject || r.institution || r.yearOfPassing || r.percentage,
    );
    const problem = validate(filled);
    if (problem) { setMessage({ kind: 'error', text: problem }); return; }

    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/users/${user.id}/education`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: filled.map((r) => ({
            qualificationId: r.qualificationId,
            branchId: r.branchId || null,
            subject: r.subject,
            institution: r.institution,
            yearOfPassing: r.yearOfPassing,
            percentage: r.percentage,
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ kind: 'error', text: data.message ?? 'Could not save your education.' });
        return;
      }
      setRows(toRows(Array.isArray(data) ? data : []));
      setMessage({ kind: 'ok', text: 'Education saved.' });
    } catch {
      setMessage({ kind: 'error', text: 'Network error. Nothing was saved. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-base font-bold text-neutral-900">Education</h2>
      <p className="mt-1 text-sm text-neutral-600">
        Add every qualification you hold, from 10th onwards. If you have two degrees at the same level, add both.
        This is what decides which jobs you are eligible for.
      </p>

      {!loaded ? (
        <p className="mt-4 text-sm text-neutral-400">Loading...</p>
      ) : (
        <>
          <div className="mt-4 space-y-3">
            {rows.map((row, index) => (
              <EducationRow
                key={row.key}
                index={index}
                row={row}
                categories={categories}
                onChange={(patch) => update(row.key, patch)}
                onRemove={() => {
                  setRows((prev) => {
                    const next = prev.filter((r) => r.key !== row.key);
                    return next.length === 0 ? [blankRow()] : next;
                  });
                  setMessage(null);
                }}
              />
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => setRows((prev) => [...prev, blankRow()])}
              disabled={rows.length >= 12}
            >
              Add qualification
            </Button>
            <Button type="button" variant="primary" size="sm" onClick={save} disabled={saving}>
              {saving ? 'Saving...' : 'Save education'}
            </Button>
            {message && (
              <span className={`text-xs ${message.kind === 'ok' ? 'text-success' : 'text-danger'}`}>{message.text}</span>
            )}
          </div>
        </>
      )}
    </section>
  );
}
