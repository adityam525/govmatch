// Turns a branch or subject name into a comparable key, so "Computer Science and
// Engineering", "Computer Science (M.Tech)" and "CSE" all count as one field.

const DROP_WORDS = new Set([
  'engineering', 'engg', 'and', 'the', 'of', 'in', 'with',
  'branch', 'stream', 'specialization', 'specialisation', 'department', 'dept', 'studies',
]);

// Short forms and spelling variants mapped onto one key. If two fields are wrongly merged,
// or one field is split, fix it here. `npx tsx prisma/review-field-keys.ts` shows the result.
const ALIASES: Record<string, string> = {
  cse: 'computer science',
  cs: 'computer science',
  cst: 'computer science',
  it: 'information technology',
  ece: 'electronics communication',
  etc: 'electronics communication',
  'electronics telecommunication': 'electronics communication',
  eee: 'electrical electronics',
  ee: 'electrical',
  mech: 'mechanical',
  civ: 'civil',
  chem: 'chemical',
};

export function fieldKey(text: string | null | undefined): string | null {
  if (!text) return null;
  const cleaned = text
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9 ]+/g, ' ');
  const words = cleaned.split(/\s+/).filter((word) => word && !DROP_WORDS.has(word));
  if (words.length === 0) return null;
  const joined = words.join(' ');
  return ALIASES[joined] ?? joined;
}
