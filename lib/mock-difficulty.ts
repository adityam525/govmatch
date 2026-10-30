export const DIFFICULTIES = [
  { code: 'EASY', label: 'Easy', tone: 'bg-green-50 text-green-700' },
  { code: 'MEDIUM', label: 'Medium', tone: 'bg-amber-50 text-amber-700' },
  { code: 'HARD', label: 'Hard', tone: 'bg-red-50 text-red-700' },
] as const;

// null means "not set". undefined means the value is not one of the allowed ones.
export function readDifficulty(v: unknown): string | null | undefined {
  if (v === '' || v === null || v === undefined) return null;
  return typeof v === 'string' && DIFFICULTIES.some((d) => d.code === v) ? v : undefined;
}
