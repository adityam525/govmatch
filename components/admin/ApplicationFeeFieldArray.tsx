'use client';

import { Plus, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';

export interface ApplicationFeeDraft {
  id?: string;
  categoryLabel: string;
  amount: string;
}

interface ApplicationFeeFieldArrayProps {
  fees: ApplicationFeeDraft[];
  onChange: (fees: ApplicationFeeDraft[]) => void;
}

const DEFAULTS: ApplicationFeeDraft[] = [
  { categoryLabel: 'General/OBC/EWS', amount: '' },
  { categoryLabel: 'SC/ST/PwD', amount: '' },
];

export default function ApplicationFeeFieldArray({ fees, onChange }: ApplicationFeeFieldArrayProps) {
  const update = (i: number, key: keyof ApplicationFeeDraft, value: string) => {
    const next = [...fees];
    next[i] = { ...next[i], [key]: value };
    onChange(next);
  };
  const add = () => onChange([...fees, { categoryLabel: '', amount: '' }]);
  const remove = (i: number) => onChange(fees.filter((_, idx) => idx !== i));
  const initDefaults = () => onChange([...DEFAULTS]);

  return (
    <div className="md:col-span-2 border-t border-neutral-100 pt-5 mt-2">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-neutral-900">Application Fee</p>
        <Button type="button" variant="secondary" size="sm" icon={<Plus size={14} />} onClick={add}>
          Add Fee Category
        </Button>
      </div>

      {fees.length === 0 && (
        <button type="button" onClick={initDefaults} className="text-xs text-primary-600 hover:underline mb-3">
          + Use default categories (General/OBC/EWS, SC/ST/PwD)
        </button>
      )}

      <div className="space-y-2">
        {fees.map((fee, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={fee.categoryLabel}
              onChange={(e) => update(i, 'categoryLabel', e.target.value)}
              placeholder="Category, e.g. General/OBC/EWS"
              className="flex-1 text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500"
            />
            <input
              value={fee.amount}
              onChange={(e) => update(i, 'amount', e.target.value)}
              placeholder="Amount, e.g. Rs 500"
              className="flex-1 text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500"
            />
            <button type="button" onClick={() => remove(i)} className="text-neutral-400 hover:text-danger p-2">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
