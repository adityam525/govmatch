import { DISABILITY_CODES } from '@/lib/special-categories';

// { VISUAL: 2, HEARING: 1 }: whole numbers 1 to 500, known groups only. Returns null when nothing valid.
export function parsePwdVacancies(raw: unknown): { value: Record<string, number> | null; error: string | null } {
  if (raw === null || raw === undefined || raw === '') return { value: null, error: null };
  if (typeof raw !== 'object' || Array.isArray(raw)) return { value: null, error: 'Reserved vacancies must be a list of groups with numbers.' };
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (v === '' || v === null || v === undefined || Number(v) === 0) continue;
    const n = Number(v);
    if (!DISABILITY_CODES.has(k)) return { value: null, error: 'Unknown disability group "' + k + '".' };
    if (!Number.isInteger(n) || n < 1 || n > 500) return { value: null, error: 'Reserved vacancies must be whole numbers from 1 to 500.' };
    out[k] = n;
  }
  return { value: Object.keys(out).length ? out : null, error: null };
}
