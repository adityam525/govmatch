'use client';

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import FilterDropdown from '@/components/ui/FilterDropdown';

interface QualCategoryOption { id: string; name: string; slug: string; }
interface QualificationOption { id: string; name: string; slug: string; level?: number; }
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

const slugify = (text: string) =>
  text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const jsonHeaders = { 'Content-Type': 'application/json' };

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
      .then((data) => setQualifications(Array.isArray(data) ? data : []))
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
          <FilterDropdown
            label="Select category"
            options={categories.map((c) => ({ id: c.slug, label: c.name }))}
            selected={block.qualificationCategorySlug ? [block.qualificationCategorySlug] : []}
            onChange={(ids) => onUpdate({ qualificationCategorySlug: ids[0] ?? '', qualificationId: '', branchIds: [] })}
            multi={false}
            allowClear
            widthClass="w-full"
            allowCreate
            onCreate={async (name) => {
              const res = await fetch('/api/qualification-categories', {
                method: 'POST',
                headers: jsonHeaders,
                body: JSON.stringify({ name }),
              });
              if (!res.ok) return null;
              const created = await res.json();
              setCategories((prev) => [...prev, created]);
              return { id: created.slug, label: created.name };
            }}
          />
        </div>

        {block.qualificationCategorySlug && (
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Qualification</label>
            <FilterDropdown
              label="Select qualification"
              options={qualifications.map((q) => ({ id: q.id, label: q.name }))}
              selected={block.qualificationId ? [block.qualificationId] : []}
              onChange={(ids) => onUpdate({ qualificationId: ids[0] ?? '', branchIds: [] })}
              multi={false}
              allowClear
              widthClass="w-full"
              allowCreate
              onCreate={async (name) => {
                // Default level = highest level already in this category (review later in /admin/qualifications)
                const level = qualifications.reduce((max, q) => Math.max(max, q.level ?? 0), 0) || 5;
                const res = await fetch('/api/qualifications', {
                  method: 'POST',
                  headers: jsonHeaders,
                  body: JSON.stringify({
                    name,
                    slug: slugify(name),
                    level,
                    categorySlug: block.qualificationCategorySlug,
                  }),
                });
                if (!res.ok) return null;
                const created = await res.json();
                setQualifications((prev) => [...prev, created]);
                return { id: created.id, label: created.name };
              }}
            />
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
