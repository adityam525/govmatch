'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '@/components/ui/Card';

interface FilterOption {
  id: string;
  label: string;
}

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'central', label: 'Central Govt.' },
  { id: 'state', label: 'State Govt.' },
  { id: 'banking', label: 'Banking' },
  { id: 'defence', label: 'Defence' },
  { id: 'teaching', label: 'Teaching' },
  { id: 'psu', label: 'PSU' },
];

export default function JobFiltersSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get('category') ?? 'all';
  const selectedQualifications = searchParams.get('qualifications')?.split(',').filter(Boolean) ?? [];
  const selectedOrganizations = searchParams.get('organizations')?.split(',').filter(Boolean) ?? [];

  const [qualifications, setQualifications] = useState<FilterOption[]>([]);
  const [organizations, setOrganizations] = useState<FilterOption[]>([]);

  useEffect(() => {
    fetch('/api/qualifications')
      .then((r) => r.json())
      .then((data) => setQualifications(Array.isArray(data) ? data.map((q: any) => ({ id: q.slug, label: q.name })) : []))
      .catch(() => {});

    fetch('/api/organizations')
      .then((r) => r.json())
      .then((data) => setOrganizations(Array.isArray(data) ? data.map((o: any) => ({ id: o.id, label: o.name })) : []))
      .catch(() => {});
  }, []);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push(`/jobs?${params.toString()}`);
  };

  const toggleQualification = (slug: string) => {
    const next = selectedQualifications.includes(slug)
      ? selectedQualifications.filter((s) => s !== slug)
      : [...selectedQualifications, slug];
    updateParams({ qualifications: next.join(',') });
  };

  const toggleOrganization = (id: string) => {
    const next = selectedOrganizations.includes(id)
      ? selectedOrganizations.filter((o) => o !== id)
      : [...selectedOrganizations, id];
    updateParams({ organizations: next.join(',') });
  };

  const clearAll = () => {
    router.push('/jobs');
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedQualifications.length > 0 || selectedOrganizations.length > 0;

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-neutral-900">Filters</h2>
        {hasActiveFilters && (
          <button onClick={clearAll} className="text-xs text-primary-600 hover:underline">
            Clear all
          </button>
        )}
      </div>

      <div className="mb-6">
        <p className="text-xs font-semibold text-neutral-900 mb-2.5">Category</p>
        <div className="space-y-1.5">
          {CATEGORIES.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === cat.id}
                onChange={() => updateParams({ category: cat.id === 'all' ? '' : cat.id })}
                className="w-3.5 h-3.5 text-primary-600"
              />
              <span className="text-xs text-neutral-600">{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <p className="text-xs font-semibold text-neutral-900 mb-2.5">Qualification</p>
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {qualifications.map((q) => (
            <label key={q.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedQualifications.includes(q.id)}
                onChange={() => toggleQualification(q.id)}
                className="w-3.5 h-3.5 text-primary-600 rounded"
              />
              <span className="text-xs text-neutral-600">{q.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-neutral-900 mb-2.5">Organization</p>
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {organizations.map((org) => (
            <label key={org.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedOrganizations.includes(org.id)}
                onChange={() => toggleOrganization(org.id)}
                className="w-3.5 h-3.5 text-primary-600 rounded"
              />
              <span className="text-xs text-neutral-600">{org.label}</span>
            </label>
          ))}
        </div>
      </div>
    </Card>
  );
}
