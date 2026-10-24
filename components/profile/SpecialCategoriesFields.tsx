'use client';

import { BENCHMARK_DISABILITY_PERCENT, DISABILITY_TYPES, SPECIAL_STATUSES } from '@/lib/special-categories';

export interface SpecialState {
  disabilityTypes: string[];
  disabilityPercent: string;
  specialStatuses: string[];
}

export const FEMALE_ONLY_STATUSES = ['WIDOW', 'DIVORCED_WOMAN'];

const toggle = (list: string[], value: string) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

const box = 'flex cursor-pointer items-start gap-2.5 rounded-lg px-1.5 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50';

export default function SpecialCategoriesFields({
  value,
  onChange,
  gender,
}: {
  value: SpecialState;
  onChange: (next: SpecialState) => void;
  gender: string;
}) {
  const percent = Number(value.disabilityPercent);
  const underBenchmark =
    value.disabilityTypes.length > 0 && value.disabilityPercent !== '' && percent < BENCHMARK_DISABILITY_PERCENT;
  const statuses = SPECIAL_STATUSES.filter((s) => !FEMALE_ONLY_STATUSES.includes(s.code) || gender === 'Female');

  return (
    <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-base font-bold text-neutral-900">Special categories</h2>
      <p className="mt-1 text-sm text-neutral-600">
        Optional. Many notifications give extra age relaxation or reserved posts for these groups, and we use this to
        check them for you.
      </p>

      <fieldset className="mt-4">
        <legend className="text-xs font-medium text-neutral-600">Person with disability</legend>
        <div className="mt-1 grid gap-0.5 sm:grid-cols-2">
          {DISABILITY_TYPES.map((d) => (
            <label key={d.code} className={box}>
              <input
                type="checkbox"
                checked={value.disabilityTypes.includes(d.code)}
                onChange={() => onChange({ ...value, disabilityTypes: toggle(value.disabilityTypes, d.code) })}
                className="mt-0.5 h-4 w-4 shrink-0 accent-primary-600"
              />
              <span>{d.label}</span>
            </label>
          ))}
        </div>

        {value.disabilityTypes.length > 0 && (
          <label className="mt-3 block max-w-xs">
            <span className="mb-1 block text-xs font-medium text-neutral-600">Disability percentage</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={100}
              value={value.disabilityPercent}
              onChange={(e) => onChange({ ...value, disabilityPercent: e.target.value })}
              placeholder="e.g. 45"
              className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
            <span className={`mt-1 block text-[11px] ${underBenchmark ? 'text-amber-700' : 'text-neutral-500'}`}>
              {underBenchmark
                ? `Benchmark disability is ${BENCHMARK_DISABILITY_PERCENT}% or more, so PwD relaxation will not apply.`
                : `Benchmark disability is ${BENCHMARK_DISABILITY_PERCENT}% or more.`}
            </span>
          </label>
        )}
      </fieldset>

      <fieldset className="mt-5">
        <legend className="text-xs font-medium text-neutral-600">Other</legend>
        <div className="mt-1 grid gap-0.5 sm:grid-cols-2">
          {statuses.map((s) => (
            <label key={s.code} className={box}>
              <input
                type="checkbox"
                checked={value.specialStatuses.includes(s.code)}
                onChange={() => onChange({ ...value, specialStatuses: toggle(value.specialStatuses, s.code) })}
                className="mt-0.5 h-4 w-4 shrink-0 accent-primary-600"
              />
              <span>{s.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </section>
  );
}
