'use client';

import { Plus, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';

export interface FAQDraft {
  id?: string;
  question: string;
  answer: string;
}

interface FAQsFieldArrayProps {
  faqs: FAQDraft[];
  onChange: (faqs: FAQDraft[]) => void;
}

export default function FAQsFieldArray({ faqs, onChange }: FAQsFieldArrayProps) {
  const update = (i: number, field: 'question' | 'answer', value: string) => {
    const next = [...faqs];
    next[i] = { ...next[i], [field]: value };
    onChange(next);
  };
  const add = () => onChange([...faqs, { question: '', answer: '' }]);
  const remove = (i: number) => onChange(faqs.filter((_, idx) => idx !== i));

  return (
    <div className="md:col-span-2 border-t border-neutral-100 pt-5 mt-2">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-neutral-900">FAQs</p>
        <Button type="button" variant="secondary" size="sm" icon={<Plus size={14} />} onClick={add}>
          Add FAQ
        </Button>
      </div>

      {faqs.length === 0 && (
        <p className="text-xs text-neutral-400 mb-3">No FAQs added yet.</p>
      )}

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div key={i} className="border border-neutral-200 rounded-lg p-3 relative">
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-3 right-3 text-neutral-400 hover:text-danger"
            >
              <Trash2 size={14} />
            </button>
            <input
              value={faq.question}
              onChange={(e) => update(i, 'question', e.target.value)}
              placeholder="Question"
              className="w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500 mb-2 pr-8"
            />
            <textarea
              value={faq.answer}
              onChange={(e) => update(i, 'answer', e.target.value)}
              placeholder="Answer"
              rows={2}
              className="w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
