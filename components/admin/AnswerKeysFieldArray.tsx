'use client';

import { Plus, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';

export interface AnswerKeyDraft {
  id?: string;
  title: string;
  keyType: string;
  releaseDate: string;
  objectionEndDate: string;
  downloadLink: string;
  examLevelId: string;
}

interface ExamLevelOption { id?: string; name: string; }

interface AnswerKeysFieldArrayProps {
  items: AnswerKeyDraft[];
  onChange: (items: AnswerKeyDraft[]) => void;
  examLevels: ExamLevelOption[];
}

const empty: AnswerKeyDraft = { title: '', keyType: 'PROVISIONAL', releaseDate: '', objectionEndDate: '', downloadLink: '', examLevelId: '' };

export default function AnswerKeysFieldArray({ items, onChange, examLevels }: AnswerKeysFieldArrayProps) {
  const update = (i: number, key: keyof AnswerKeyDraft, value: string) => {
    const next = [...items];
    next[i] = { ...next[i], [key]: value };
    onChange(next);
  };
  const add = () => onChange([...items, { ...empty }]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div className="md:col-span-2 border-t border-neutral-100 pt-5 mt-2">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-neutral-900">Answer Keys</p>
        <Button type="button" variant="secondary" size="sm" icon={<Plus size={14} />} onClick={add}>
          Add Answer Key
        </Button>
      </div>

      {items.length === 0 && <p className="text-xs text-neutral-400 mb-3">No answer keys added yet.</p>}

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="border border-neutral-200 rounded-lg p-3 relative">
            <button type="button" onClick={() => remove(i)} className="absolute top-3 right-3 text-neutral-400 hover:text-danger">
              <Trash2 size={14} />
            </button>
            <div className="grid md:grid-cols-2 gap-2 pr-6">
              <input
                value={item.title}
                onChange={(e) => update(i, 'title', e.target.value)}
                placeholder="Title, e.g. Provisional Answer Key"
                className="text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500 md:col-span-2"
              />
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Key Type</label>
                <select value={item.keyType} onChange={(e) => update(i, 'keyType', e.target.value)} className="w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500">
                  <option value="PROVISIONAL">Provisional</option>
                  <option value="FINAL">Final</option>
                </select>
              </div>
              {examLevels.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Exam Level</label>
                  <select value={item.examLevelId} onChange={(e) => update(i, 'examLevelId', e.target.value)} className="w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500">
                    <option value="">Optional</option>
                    {examLevels.map((lvl, idx) => (
                      <option key={lvl.id ?? idx} value={lvl.id ?? ''}>{lvl.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Release Date</label>
                <input type="date" value={item.releaseDate} onChange={(e) => update(i, 'releaseDate', e.target.value)} className="w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Objection End Date</label>
                <input type="date" value={item.objectionEndDate} onChange={(e) => update(i, 'objectionEndDate', e.target.value)} className="w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500" />
              </div>
              <input
                value={item.downloadLink}
                onChange={(e) => update(i, 'downloadLink', e.target.value)}
                placeholder="Download link"
                className="text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500 md:col-span-2"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
