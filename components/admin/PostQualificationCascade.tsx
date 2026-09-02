'use client';

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

interface QualCategoryOption { id: string; name: string; slug: string; }
interface QualificationOption { id: string; name: string; slug: string; }
interface BranchOption { id: string; name: string; slug: string; }

export interface QualificationBlock {
  qualificationCategorySlug: string;
  qualificationId: string;
  branchIds: string[];
}

interface PostQualificationCascadeProps {
  blocks: QualificationBlock[];
  onChange: (blocks: QualificationBlock[]) => void;
}

function SingleQualificationRow({
  block,
  onUpdate,
  onRemove,
  showRemove,
}: {
  block: QualificationBlock;
  onUpdate: (updates: Partial<QualificationBlock>) => void;
  onRemove: () => void;
  showRemove: boolean;
}) {
  const [categories, setCategories] = useState<QualCategoryOption[]>([]);
  const [qualifications, setQualifications] = useState<QualificationOption[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);

  useEffect(() => {
    fetch('/api/qualification-categories').then((r) => r.json()).then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (!block.qualificationCategorySlug) {
      setQualifications([]);
      return;
    }
    fetch(`/api/qualifications?categorySlugs=${block.qualificationCategorySlug}`)
      .then((r) => r.json())
      .then(setQualifications)
      .catch(() => {});
  }, [block.qualificationCategorySlug]);

  useEffect(() => {
    const selectedQual = qualifications.find((q) => q.id === block.qualificationId);
    if (!selectedQual) {
      setBranches([]);
      return;
    }
    fetch(`/api/branches?qualificationSlugs=${selectedQual.slug}`)
      .then((r) => r.json())
      .then((data) => setBranches(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [block.qualificationId, qualifications]);

  const toggleBranch = (branchId: string) => {
    onUpdate({
      branchIds: block.branchIds.includes(branchId)
        ? block.branchIds.filter((b) => b !== branchId)
        : [...block.branchIds, branchId],
    });
  };

  const inputClass = 'w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500';

  return (
    <div className="border border-neutral-200 rounded-lg p-3 relative">
      {showRemove && (
        <button type="button" onClick={onRemove} className="absolute top-2 right-2 text-neutral-400 hover:text-danger">
          <X size={14} />
        </button>
      )}
      <div className="grid md:grid-cols-2 gap-3 pr-6">
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Qualification Category</label>
          <select
            value={block.qualificationCategorySlug}
            onChange={(e) => onUpdate({ qualificationCategorySlug: e.target.value, qualificationId: '', branchIds: [] })}
            className={inputClass}
          >
            <option value="">Select...</option>
            {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
        </div>

        {qualifications.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Qualification</label>
            <select
              value={block.qualificationId}
              onChange={(e) => onUpdate({ qualificationId: e.target.value, branchIds: [] })}
              className={inputClass}
            >
              <option value="">Select...</option>
              {qualifications.map((q) => <option key={q.id} value={q.id}>{q.name}</option>)}
            </select>
          </div>
        )}

        {branches.length > 0 && (
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Branches (leave empty if branch-agnostic)</label>
            <div className="flex flex-wrap gap-1.5">
              {branches.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => toggleBranch(b.id)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border ${
                    block.branchIds.includes(b.id)
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-neutral-600 border-neutral-200'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PostQualificationCascade({ blocks, onChange }: PostQualificationCascadeProps) {
  const updateBlock = (index: number, updates: Partial<QualificationBlock>) => {
    const next = [...blocks];
    next[index] = { ...next[index], ...updates };
    onChange(next);
  };

  const addBlock = () => onChange([...blocks, { qualificationCategorySlug: '', qualificationId: '', branchIds: [] }]);
  const removeBlock = (index: number) => onChange(blocks.filter((_, i) => i !== index));

  return (
    <div className="md:col-span-2">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-neutral-600">Qualifications Accepted</label>
        <button type="button" onClick={addBlock} className="text-xs text-primary-600 flex items-center gap-1">
          <Plus size={12} /> Add Another Qualification
        </button>
      </div>
      <div className="space-y-2">
        {blocks.map((block, i) => (
          <SingleQualificationRow
            key={i}
            block={block}
            onUpdate={(updates) => updateBlock(i, updates)}
            onRemove={() => removeBlock(i)}
            showRemove={blocks.length > 1}
          />
        ))}
      </div>
    </div>
  );
}
