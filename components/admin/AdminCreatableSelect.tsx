'use client';

import { useState } from 'react';
import { Plus, Check, X } from 'lucide-react';

interface Option { id: string; name?: string; label?: string; value?: string; }

interface AdminCreatableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  entity: string;
  labelKey?: string;
  placeholder?: string;
  extraFields?: Record<string, any>;
  onCreated?: (newOption: any) => void;
  className?: string;
}

export default function AdminCreatableSelect({
  value,
  onChange,
  options,
  entity,
  labelKey = 'name',
  placeholder = 'Select...',
  extraFields = {},
  onCreated,
  className = '',
}: AdminCreatableSelectProps) {
  const [adding, setAdding] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [saving, setSaving] = useState(false);

  const inputClass = 'w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500';

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === '__ADD_CUSTOM__') {
      setAdding(true);
      return;
    }
    onChange(e.target.value);
  };

  const slugify = (text: string) =>
    text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleSaveCustom = async () => {
    if (!customValue.trim()) return;
    setSaving(true);
    try {
      const body: Record<string, any> = {
        [labelKey]: customValue.trim(),
        slug: slugify(customValue),
        ...extraFields,
      };
      const res = await fetch(`/api/${entity}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const created = await res.json();
      if (res.ok && created?.id) {
        onCreated?.(created);
        onChange(created.id);
        setAdding(false);
        setCustomValue('');
      } else {
        alert(created?.message ?? 'Failed to create. It may already exist.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create custom option.');
    } finally {
      setSaving(false);
    }
  };

  if (adding) {
    return (
      <div className="flex gap-2">
        <input
          autoFocus
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSaveCustom()}
          placeholder="Enter new value"
          className={inputClass}
        />
        <button
          type="button"
          onClick={handleSaveCustom}
          disabled={saving}
          className="shrink-0 p-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
        >
          <Check size={16} />
        </button>
        <button
          type="button"
          onClick={() => { setAdding(false); setCustomValue(''); }}
          className="shrink-0 p-2 rounded-md border border-neutral-200 text-neutral-500 hover:bg-neutral-50"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <select value={value} onChange={handleSelectChange} className={`${inputClass} ${className}`}>
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {(opt as any)[labelKey] ?? opt.name ?? opt.label}
        </option>
      ))}
      <option value="__ADD_CUSTOM__" className="font-medium text-primary-600">
        + Add Custom...
      </option>
    </select>
  );
}
