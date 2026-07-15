'use client';

import { Plus, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';

export interface LinkDraft {
  label: string;
  url: string;
  linkType: string;
}

interface LinksFieldArrayProps {
  links: LinkDraft[];
  onChange: (links: LinkDraft[]) => void;
}

const LINK_TYPES = [
  { value: 'APPLY_ONLINE', label: 'Apply Online' },
  { value: 'NOTIFICATION_PDF', label: 'Download Notification' },
  { value: 'OFFICIAL_WEBSITE', label: 'Official Website' },
  { value: 'ADMIT_CARD', label: 'Admit Card' },
  { value: 'RESULT', label: 'Result' },
  { value: 'SYLLABUS', label: 'Syllabus' },
  { value: 'SHORT_NOTICE', label: 'Short Notice' },
  { value: 'OTHER', label: 'Other' },
];

const emptyLink: LinkDraft = { label: '', url: '', linkType: 'OTHER' };

export default function LinksFieldArray({ links, onChange }: LinksFieldArrayProps) {
  const updateLink = (index: number, key: keyof LinkDraft, value: string) => {
    const next = [...links];
    next[index] = { ...next[index], [key]: value };
    onChange(next);
  };

  const addLink = () => onChange([...links, { ...emptyLink }]);
  const removeLink = (index: number) => onChange(links.filter((_, i) => i !== index));

  return (
    <div className="md:col-span-2 border-t border-neutral-100 pt-5 mt-2">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-neutral-900">Important Links</p>
        <Button type="button" variant="secondary" size="sm" icon={<Plus size={14} />} onClick={addLink}>
          Add Link
        </Button>
      </div>

      {links.length === 0 && (
        <p className="text-xs text-neutral-400 mb-3">No links added yet.</p>
      )}

      <div className="space-y-3">
        {links.map((link, index) => (
          <div key={index} className="border border-neutral-200 rounded-lg p-3 relative">
            <button
              type="button"
              onClick={() => removeLink(index)}
              className="absolute top-3 right-3 text-neutral-400 hover:text-danger"
            >
              <Trash2 size={14} />
            </button>
            <div className="grid md:grid-cols-3 gap-3 pr-6">
              <select
                value={link.linkType}
                onChange={(e) => updateLink(index, 'linkType', e.target.value)}
                className="text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500"
              >
                {LINK_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <input
                type="text"
                value={link.label}
                onChange={(e) => updateLink(index, 'label', e.target.value)}
                placeholder="Label (optional, defaults to type)"
                className="text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500"
              />
              <input
                type="text"
                value={link.url}
                onChange={(e) => updateLink(index, 'url', e.target.value)}
                placeholder="https://..."
                className="text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
