'use client';

import { useEffect, useState } from 'react';
import { Briefcase, MapPin, Ruler } from 'lucide-react';
import { CERTIFICATIONS } from '@/lib/eligibility-options';

export interface ExtraState {
  experienceYears: string;
  certifications: string[];
  domicileStateCode: string;
  preferredStateCodes: string[];
  heightCm: string;
  chestCm: string;
}

interface StateOption { code: string; name: string }

const input =
  'h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100';
const toggle = (list: string[], value: string) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

function Block({
  id,
  icon,
  title,
  hint,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-6 scroll-mt-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">{icon}</span>
        <h2 className="text-base font-bold text-neutral-900">{title}</h2>
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-500">Optional</span>
      </div>
      <p className="mt-1.5 text-sm text-neutral-600">{hint}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function ExtraProfileFields({ value, onChange }: { value: ExtraState; onChange: (next: ExtraState) => void }) {
  const [states, setStates] = useState<StateOption[]>([]);

  useEffect(() => {
    fetch('/api/states')
      .then((r) => r.json())
      .then((d) => setStates(Array.isArray(d) ? [...d].sort((a, b) => a.name.localeCompare(b.name)) : []))
      .catch(() => {});
  }, []);

  const set = (patch: Partial<ExtraState>) => onChange({ ...value, ...patch });

  return (
    <>
      <Block
        id="work"
        icon={<Briefcase size={16} />}
        title="Work and skills"
        hint="Some posts ask for experience, a qualifying test or a licence. Add what you hold and we will check it for you."
      >
        <label className="block max-w-xs">
          <span className="mb-1 block text-xs font-medium text-neutral-600">Total work experience (years)</span>
          <input type="number" inputMode="numeric" min={0} max={50} value={value.experienceYears} onChange={(e) => set({ experienceYears: e.target.value })} className={input} />
        </label>

        <fieldset className="mt-4">
          <legend className="text-xs font-medium text-neutral-600">Certificates and tests you hold</legend>
          <div className="mt-1 grid gap-0.5 sm:grid-cols-2">
            {CERTIFICATIONS.map((c) => (
              <label key={c.code} className="flex cursor-pointer items-start gap-2.5 rounded-lg px-1.5 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50">
                <input
                  type="checkbox"
                  checked={value.certifications.includes(c.code)}
                  onChange={() => set({ certifications: toggle(value.certifications, c.code) })}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-primary-600"
                />
                <span>{c.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </Block>

      <Block
        id="location"
        icon={<MapPin size={16} />}
        title="Location"
        hint="Some state jobs are open only to residents of that state. Your preferred states also help us pick relevant jobs."
      >
        <label className="block max-w-xs">
          <span className="mb-1 block text-xs font-medium text-neutral-600">Home state (domicile)</span>
          <select value={value.domicileStateCode} onChange={(e) => set({ domicileStateCode: e.target.value })} className={input}>
            <option value="">Select...</option>
            {states.map((s) => (
              <option key={s.code} value={s.code}>{s.name}</option>
            ))}
          </select>
        </label>

        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-neutral-600">
            States where you would work <span className="text-neutral-400">({value.preferredStateCodes.length} selected)</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {states.map((s) => {
              const active = value.preferredStateCodes.includes(s.code);
              return (
                <button
                  key={s.code}
                  type="button"
                  aria-pressed={active}
                  onClick={() => set({ preferredStateCodes: toggle(value.preferredStateCodes, s.code) })}
                  className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                    active ? 'border-primary-600 bg-primary-600 text-white' : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>
      </Block>

      <Block
        id="physical"
        icon={<Ruler size={16} />}
        title="Physical details"
        hint="Police, defence, forest and similar posts set a minimum height or chest. Skip this if you are not looking at those."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-600">Height (cm)</span>
            <input type="number" inputMode="numeric" min={100} max={230} value={value.heightCm} onChange={(e) => set({ heightCm: e.target.value })} className={input} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-600">Chest, not expanded (cm)</span>
            <input type="number" inputMode="numeric" min={50} max={150} value={value.chestCm} onChange={(e) => set({ chestCm: e.target.value })} className={input} />
            <span className="mt-1 block text-[11px] text-neutral-500">Used for posts that set a chest minimum, which is normally for men.</span>
          </label>
        </div>
      </Block>
    </>
  );
}
