'use client';

import { useState, useEffect } from 'react';

interface QualCategoryOption { id: string; name: string; slug: string; }
interface QualificationOption { id: string; name: string; slug: string; }
interface BranchOption { id: string; name: string; slug: string; }

export interface CascadeUpdate {
  qualificationCategorySlug?: string;
  qualificationId?: string;
  branchIds?: string[];
}

interface PostQualificationCascadeProps {
  qualificationCategorySlug: string;
  qualificationId: string;
  branchIds: string[];
  onCascadeChange: (updates: CascadeUpdate) => void;
}

export default function PostQualificationCascade({
  qualificationCategorySlug,
  qualificationId,
  branchIds,
  onCascadeChange,
}: PostQualificationCascadeProps) {
  const [categories, setCategories] = useState<QualCategoryOption[]>([]);
  const [qualifications, setQualifications] = useState<QualificationOption[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);

  useEffect(() => {
    fetch('/api/qualification-categories').then((r) => r.json()).then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (!qualificationCategorySlug) {
      setQualifications([]);
      return;
    }
    fetch(`/api/qualifications?categorySlugs=${qualificationCategorySlug}`)
      .then((r) => r.json())
      .then(setQualifications)
      .catch(() => {});
  }, [qualificationCategorySlug]);

  useEffect(() => {
    const selectedQual = qualifications.find((q) => q.id === qualificationId);
    if (!selectedQual) {
      setBranches([]);
      return;
    }
    fetch(`/api/branches?qualificationSlugs=${selectedQual.slug}`)
      .then((r) => r.json())
      .then((data) => setBranches(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [qualificationId, qualifications]);

  const toggleBranch = (branchId: string) => {
    onCascadeChange({
      branchIds: branchIds.includes(branchId) ? branchIds.filter((b) => b !== branchId) : [...branchIds, branchId],
    });
  };

  const inputClass = 'w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500';

  return (
    <>
      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-1">Qualification Category</label>
        <select
          value={qualificationCategorySlug}
          onChange={(e) => onCascadeChange({ qualificationCategorySlug: e.target.value, qualificationId: '', branchIds: [] })}
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
            value={qualificationId}
            onChange={(e) => onCascadeChange({ qualificationId: e.target.value, branchIds: [] })}
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
                  branchIds.includes(b.id)
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
    </>
  );
}
