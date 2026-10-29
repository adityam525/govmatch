'use client';

import { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';

interface Props {
  value: { preferredSectorSlugs: string[]; preferredOrganizationSlugs: string[] };
  onChange: (next: { preferredSectorSlugs: string[]; preferredOrganizationSlugs: string[] }) => void;
}
interface Option { slug: string; name: string }

const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
const chip = (on: boolean) =>
  `rounded-full border px-2.5 py-1 text-xs transition-colors ${on ? 'border-primary-600 bg-primary-600 text-white' : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'}`;

export default function RecruiterPrefs({ value, onChange }: Props) {
  const [sectors, setSectors] = useState<Option[]>([]);
  const [orgs, setOrgs] = useState<Option[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then((d) => setSectors(Array.isArray(d) ? d : [])).catch(() => {});
    fetch('/api/organizations').then((r) => r.json()).then((d) => setOrgs(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const needle = query.trim().toLowerCase();
  const chosen = orgs.filter((o) => value.preferredOrganizationSlugs.includes(o.slug));
  const found = needle ? orgs.filter((o) => o.name.toLowerCase().includes(needle) && !chosen.includes(o)).slice(0, 12) : [];

  return (
    <section id="recruiters" className="mt-6 scroll-mt-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600"><Building2 size={16} /></span>
        <h2 className="text-base font-bold text-neutral-900">Preferred recruiters</h2>
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-500">Optional</span>
      </div>
      <p className="mt-1.5 text-sm text-neutral-600">
        Jobs from these sectors and organizations are shown higher in your recommendations. Other jobs are never hidden.
      </p>

      <p className="mb-2 mt-4 text-xs font-medium text-neutral-600">Sectors</p>
      <div className="flex flex-wrap gap-1.5">
        {sectors.map((s) => (
          <button key={s.slug} type="button" aria-pressed={value.preferredSectorSlugs.includes(s.slug)}
            onClick={() => onChange({ ...value, preferredSectorSlugs: toggle(value.preferredSectorSlugs, s.slug) })}
            className={chip(value.preferredSectorSlugs.includes(s.slug))}>{s.name}</button>
        ))}
      </div>

      <p className="mb-2 mt-5 text-xs font-medium text-neutral-600">Organizations ({chosen.length} selected)</p>
      {chosen.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {chosen.map((o) => (
            <button key={o.slug} type="button" aria-pressed
              onClick={() => onChange({ ...value, preferredOrganizationSlugs: toggle(value.preferredOrganizationSlugs, o.slug) })}
              className={chip(true)}>{o.name} ×</button>
          ))}
        </div>
      )}
      <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search organizations, for example SSC or Railway"
        className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
      {found.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {found.map((o) => (
            <button key={o.slug} type="button"
              onClick={() => { onChange({ ...value, preferredOrganizationSlugs: toggle(value.preferredOrganizationSlugs, o.slug) }); setQuery(''); }}
              className={chip(false)}>+ {o.name}</button>
          ))}
        </div>
      )}
    </section>
  );
}
