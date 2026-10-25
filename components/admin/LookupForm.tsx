'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ImageUpload from './ImageUpload';

export interface LookupField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'image' | 'multi';
  required?: boolean;
  placeholder?: string;
  help?: string;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  /** For image fields: where the file is stored, and which field names the file. */
  folder?: 'organizations' | 'states';
  slugFrom?: string;
}

const input = 'w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500';
const isEmpty = (v: unknown) => v === undefined || v === null || (Array.isArray(v) ? v.length === 0 : String(v).trim() === '');

// A form for lookup records (organizations, states, qualifications ...) with logo upload,
// multi-select and server messages.
export default function LookupForm({
  title,
  fields,
  initialValues = {},
  onSubmit,
  backHref,
  onDelete,
}: {
  title: string;
  fields: LookupField[];
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => Promise<unknown>;
  backHref: string;
  onDelete?: () => Promise<unknown>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const set = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setError('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    for (const f of fields) {
      if (f.required && isEmpty(values[f.name])) next[f.name] = `${f.label} is required`;
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    setError('');
    try {
      await onSubmit(values);
      router.push(backHref);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'Could not save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async () => {
    if (!onDelete || !confirm('Delete this record permanently?')) return;
    setDeleting(true);
    setError('');
    try {
      await onDelete();
      router.push(backHref);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'Could not delete.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card padding="lg">
      <h2 className="mb-6 text-lg font-bold text-neutral-900">{title}</h2>
      <form onSubmit={submit} className="grid gap-5 md:grid-cols-2">
        {fields.map((f) => (
          <div key={f.name} className={f.type === 'image' || f.type === 'multi' ? 'md:col-span-2' : ''}>
            <label className="mb-1.5 block text-xs font-medium text-neutral-600">
              {f.label}
              {f.required && <span className="ml-0.5 text-danger">*</span>}
            </label>

            {f.type === 'image' ? (
              <ImageUpload
                value={values[f.name] ?? ''}
                onChange={(url) => set(f.name, url)}
                folder={f.folder ?? 'organizations'}
                slug={String(values[f.slugFrom ?? 'name'] ?? '')}
                name={String(values.name ?? '')}
              />
            ) : f.type === 'multi' ? (
              <div className="flex flex-wrap gap-1.5">
                {f.options?.map((o) => {
                  const list: string[] = Array.isArray(values[f.name]) ? values[f.name] : [];
                  const on = list.includes(o.value);
                  return (
                    <button
                      key={o.value}
                      type="button"
                      aria-pressed={on}
                      onClick={() => set(f.name, on ? list.filter((v) => v !== o.value) : [...list, o.value])}
                      className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                        on ? 'border-primary-600 bg-primary-600 text-white' : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                      }`}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            ) : f.type === 'select' ? (
              <select value={values[f.name] ?? ''} onChange={(e) => set(f.name, e.target.value)} className={input}>
                <option value="">Select...</option>
                {f.options?.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ) : (
              <input
                type={f.type}
                min={f.min}
                max={f.max}
                value={values[f.name] ?? ''}
                placeholder={f.placeholder}
                onChange={(e) => set(f.name, f.type === 'number' ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value)}
                className={input}
              />
            )}

            {f.help && <p className="mt-1 text-[11px] leading-relaxed text-neutral-500">{f.help}</p>}
            {errors[f.name] && <p className="mt-1 text-xs text-danger">{errors[f.name]}</p>}
          </div>
        ))}

        {error && <p className="text-sm text-danger md:col-span-2">{error}</p>}

        <div className="mt-2 flex flex-wrap gap-3 border-t border-neutral-100 pt-4 md:col-span-2">
          <Button type="submit" variant="primary" disabled={submitting || deleting}>
            {submitting ? 'Saving...' : 'Save'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.push(backHref)} disabled={submitting || deleting}>
            Cancel
          </Button>
          {onDelete && (
            <button type="button" onClick={remove} disabled={submitting || deleting} className="ml-auto text-sm text-danger hover:underline disabled:opacity-50">
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>
      </form>
    </Card>
  );
}
