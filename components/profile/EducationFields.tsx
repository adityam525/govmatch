'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface Category { id: string; name: string; slug: string }
interface QualOption { id: string; name: string; slug: string; level: number }
interface BranchOption { id: string; name: string; slug: string }

export interface EducationRowState {
  key: number;
  categorySlug: string;
  qualificationId: string;
  branchId: string;
  subject: string;
  institution: string;
  yearOfPassing: string;
  percentage: string;
}

export interface SavedEducation {
  qualificationId: string;
  qualification: { categories: { slug: string }[] };
  branchId: string | null;
  subject: string | null;
  institution: string | null;
  yearOfPassing: number | null;
  percentage: number | null;
}

const MAX_ROWS = 12;
const currentYear = new Date().getFullYear();
let counter = 1;

export const blankRow = (): EducationRowState => ({
  key: counter++,
  categorySlug: '',
  qualificationId: '',
  branchId: '',
  subject: '',
  institution: '',
  yearOfPassing: '',
  percentage: '',
});

export const rowsFromSaved = (saved: SavedEducation[]): EducationRowState[] =>
  saved.length === 0
    ? [blankRow()]
    : saved.map((s) => ({
        key: counter++,
        categorySlug: s.qualification.categories[0]?.slug ?? '',
        qualificationId: s.qualificationId,
        branchId: s.branchId ?? '',
        subject: s.subject ?? '',
        institution: s.institution ?? '',
        yearOfPassing: s.yearOfPassing?.toString() ?? '',
        percentage: s.percentage?.toString() ?? '',
      }));

export const rowHasContent = (r: EducationRowState) =>
  !!(r.categorySlug || r.qualificationId || r.subject || r.institution || r.yearOfPassing || r.percentage);

export function validateRows(list: EducationRowState[]): string | null {
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
}

export const rowsToPayload = (list: EducationRowState[]) =>
  list.map((r) => ({
    qualificationId: r.qualificationId,
    branchId: r.branchId || null,
    subject: r.subject,
    institution: r.institution,
    yearOfPassing: r.yearOfPassing,
    percentage: r.percentage,
  }));

const inputClass =
  'h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100';

function EducationRow({
  index,
  row,
  categories,
  onChange,
  onRemove,
}: {
  index: number;
  row: EducationRowState;
  categories: Category[];
  onChange: (patch: Partial<EducationRowState>) => void;
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

  const selectedSlug = quals.find((q) => q.id === row.qualificationId)?.slug;

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
        <button type="button" onClick={onRemove} aria-label={`Remove qualification ${index + 1}`} className="rounded-md p-1.5 text-neutral-400 hover:bg-red-50 hover:text-danger">
          <Trash2 size={15} />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-600">Education type</span>
          <select value={row.categorySlug} onChange={(e) => onChange({ categorySlug: e.target.value, qualificationId: '', branchId: '' })} className={inputClass}>
            <option value="">Select...</option>
            {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-600">Qualification</span>
          <select value={row.qualificationId} disabled={!row.categorySlug} onChange={(e) => onChange({ qualificationId: e.target.value, branchId: '' })} className={`${inputClass} disabled:bg-neutral-100`}>
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
          <input type="text" value={row.subject} maxLength={100} placeholder="e.g. Economics" onChange={(e) => onChange({ subject: e.target.value })} className={inputClass} />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-neutral-600">School / college / university (optional)</span>
          <input type="text" value={row.institution} maxLength={150} onChange={(e) => onChange({ institution: e.target.value })} className={inputClass} />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-600">Year of passing</span>
          <input type="number" inputMode="numeric" min={1950} max={currentYear} value={row.yearOfPassing} onChange={(e) => onChange({ yearOfPassing: e.target.value })} className={inputClass} />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-600">Marks (%)</span>
          <input type="number" inputMode="decimal" min={0} max={100} step="0.01" value={row.percentage} onChange={(e) => onChange({ percentage: e.target.value })} className={inputClass} />
        </label>
      </div>
    </div>
  );
}

export default function EducationFields({
  rows,
  onChange,
  highlight = false,
}: {
  rows: EducationRowState[];
  onChange: (rows: EducationRowState[]) => void;
  highlight?: boolean;
}) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/qualification-categories')
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  return (
    <section
      className={`mt-6 rounded-2xl border bg-white p-5 shadow-sm sm:p-6 ${
        highlight ? 'border-amber-300 ring-1 ring-amber-200' : 'border-neutral-200'
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-bold text-neutral-900">Education</h2>
        {highlight && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
            Required for job matching
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-neutral-600">
        Add every qualification you hold, from 10th onwards. If you have two degrees at the same level, add both. This
        decides which jobs you are eligible for.
      </p>

      <div className="mt-4 space-y-3">
        {rows.map((row, index) => (
          <EducationRow
            key={row.key}
            index={index}
            row={row}
            categories={categories}
            onChange={(patch) => onChange(rows.map((r) => (r.key === row.key ? { ...r, ...patch } : r)))}
            onRemove={() => {
              const next = rows.filter((r) => r.key !== row.key);
              onChange(next.length === 0 ? [blankRow()] : next);
            }}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => onChange([...rows, blankRow()])}
        disabled={rows.length >= MAX_ROWS}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
      >
        <Plus size={14} /> Add qualification
      </button>
    </section>
  );
}
