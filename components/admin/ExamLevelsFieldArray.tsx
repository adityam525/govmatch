'use client';

import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import Button from '@/components/ui/Button';

export interface ExamLevelDraft {
  id?: string;
  name: string;
}

interface ExamLevelsFieldArrayProps {
  levels: ExamLevelDraft[];
  onChange: (levels: ExamLevelDraft[]) => void;
}

const SUGGESTED = ['Direct', 'Prelims', 'Mains', 'Interview', 'Document Verification', 'Medical'];

export default function ExamLevelsFieldArray({ levels, onChange }: ExamLevelsFieldArrayProps) {
  const update = (i: number, value: string) => {
    const next = [...levels];
    next[i] = { ...next[i], name: value };
    onChange(next);
  };
  const add = (name = '') => onChange([...levels, { name }]);
  const remove = (i: number) => onChange(levels.filter((_, idx) => idx !== i));
  const addSuggested = (name: string) => {
    if (!levels.some((l) => l.name === name)) add(name);
  };
  const moveUp = (i: number) => {
    if (i === 0) return;
    const next = [...levels];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    onChange(next);
  };
  const moveDown = (i: number) => {
    if (i === levels.length - 1) return;
    const next = [...levels];
    [next[i], next[i + 1]] = [next[i + 1], next[i]];
    onChange(next);
  };

  return (
    <div className="md:col-span-2 border-t border-neutral-100 pt-5 mt-2">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-neutral-900">Exam Levels</p>
        <Button type="button" variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => add()}>
          Add Custom Level
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {SUGGESTED.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => addSuggested(name)}
            className="text-[11px] px-2.5 py-1 rounded-full border border-dashed border-neutral-300 text-neutral-500 hover:border-primary-300 hover:text-primary-600"
          >
            + {name}
          </button>
        ))}
      </div>

      {levels.length === 0 && <p className="text-xs text-neutral-400 mb-2">No exam levels added yet.</p>}

      <div className="space-y-2">
        {levels.map((level, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 w-5">{i + 1}.</span>
            <input
              value={level.name}
              onChange={(e) => update(i, e.target.value)}
              placeholder="Level name"
              className="flex-1 text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500"
            />
            <button type="button" onClick={() => moveUp(i)} disabled={i === 0} className="text-neutral-400 hover:text-primary-600 disabled:opacity-30 p-1">
              <ChevronUp size={16} />
            </button>
            <button type="button" onClick={() => moveDown(i)} disabled={i === levels.length - 1} className="text-neutral-400 hover:text-primary-600 disabled:opacity-30 p-1">
              <ChevronDown size={16} />
            </button>
            <button type="button" onClick={() => remove(i)} className="text-neutral-400 hover:text-danger p-1">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
