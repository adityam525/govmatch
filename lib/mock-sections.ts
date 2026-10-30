import { LIMITS, toSectionCreate, type SectionInput } from '@/lib/mock-test';

const isBlank = (v: unknown) => v === '' || v === null || v === undefined;
const whole = (v: unknown) => (typeof v === 'boolean' || isBlank(v) ? NaN : Number(v));

type TimesResult = { error: string } | { payload: Record<string, unknown>; times: (number | null)[] };

// Section time limits are all or nothing. When every section has one, the test's total time is their sum.
// The returned payload can be passed straight to validateTest.
export function readSectionTimes(raw: unknown): TimesResult {
  if (!raw || typeof raw !== 'object') return { error: 'Invalid test.' };
  const r = raw as Record<string, unknown>;
  if (!Array.isArray(r.sections)) return { payload: r, times: [] };

  const values = r.sections.map((s) => (s as Record<string, unknown> | null)?.durationMinutes);
  const timed = values.filter((v) => !isBlank(v)).length;
  if (timed === 0) return { payload: r, times: values.map(() => null) };
  if (timed < values.length) return { error: 'Give a time limit to every section, or to none of them.' };

  const times: number[] = [];
  for (const [i, v] of values.entries()) {
    const n = whole(v);
    if (!Number.isInteger(n) || n < 1 || n > LIMITS.maxMinutes) {
      return { error: `Section ${i + 1}: the time must be a whole number of minutes from 1 to ${LIMITS.maxMinutes}.` };
    }
    times.push(n);
  }
  const total = times.reduce((a, b) => a + b, 0);
  if (total > LIMITS.maxMinutes) return { error: `The section times add up to ${total} minutes. The most allowed is ${LIMITS.maxMinutes}.` };
  return { payload: { ...r, durationMinutes: total }, times };
}

// Same as toSectionCreate, with each section's own time limit added.
export function toTimedSectionCreate(sections: SectionInput[], times: (number | null)[]) {
  return toSectionCreate(sections).map((s, i) => ({ ...s, durationMinutes: times[i] ?? null }));
}
