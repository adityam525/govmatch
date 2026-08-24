'use client';

import { Plus, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';

export interface DateDraft {
  id?: string;
  label: string;
  date: string;
}

interface ImportantDatesFieldArrayProps {
  dates: DateDraft[];
  onChange: (dates: DateDraft[]) => void;
}

const COMMON_LABELS = [
  'Notification Date', 'Application Start', 'Application End', 'Fee Payment Last Date',
  'Admit Card Release', 'Pre-Exam Training', 'Exam Date', 'Answer Key Release',
  'Result Date', 'Interview Date', 'Document Verification', 'Joining Date',
];

export default function ImportantDatesFieldArray({ dates, onChange }: ImportantDatesFieldArrayProps) {
  const update = (i: number, field: 'label' | 'date', value: string) => {
    const next = [...dates];
    next[i] = { ...next[i], [field]: value };
    onChange(next);
  };
  const add = () => onChange([...dates, { label: '', date: '' }]);
  const remove = (i: number) => onChange(dates.filter((_, idx) => idx !== i));

  return (
    <div className="md:col-span-2 border-t border-neutral-100 pt-5 mt-2">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-neutral-900">Important Dates</p>
        <Button type="button" variant="secondary" size="sm" icon={<Plus size={14} />} onClick={add}>
          Add Date
        </Button>
      </div>

      {dates.length === 0 && (
        <p className="text-xs text-neutral-400 mb-3">No dates added yet.</p>
      )}

      <div className="space-y-2">
        {dates.map((d, i) => (
          <div key={i} className="flex gap-2 items-start">
            <input
              list="common-date-labels"
              value={d.label}
              onChange={(e) => update(i, 'label', e.target.value)}
              placeholder="e.g. Pre-Exam Training"
              className="flex-1 text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500"
            />
            <input
              type="date"
              value={d.date}
              onChange={(e) => update(i, 'date', e.target.value)}
              className="text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500"
            />
            <button type="button" onClick={() => remove(i)} className="text-neutral-400 hover:text-danger p-2">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <datalist id="common-date-labels">
        {COMMON_LABELS.map((l) => <option key={l} value={l} />)}
      </datalist>
    </div>
  );
}
