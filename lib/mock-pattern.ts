import { LIMITS } from '@/lib/mock-test';

export interface PatternSection { name: string; questionCount: number; marks: number; negativeMarks: number; durationMinutes: number | null }
export interface PatternInput { name: string; organizationId: string; totalMinutes: number; sections: PatternSection[] }

const isBlank = (v: unknown) => v === '' || v === null || v === undefined;
const num = (v: unknown) => (typeof v === 'boolean' || isBlank(v) ? NaN : Number(v));
const round2 = (n: number) => Math.round(n * 100) / 100;

export function validatePattern(raw: unknown): { error: string } | { data: PatternInput } {
  if (!raw || typeof raw !== 'object') return { error: 'Invalid pattern.' };
  const r = raw as Record<string, unknown>;

  const name = typeof r.name === 'string' ? r.name.trim() : '';
  if (!name || name.length > LIMITS.titleMax) return { error: `Enter a pattern name (up to ${LIMITS.titleMax} characters).` };
  const organizationId = typeof r.organizationId === 'string' ? r.organizationId : '';
  if (!organizationId) return { error: 'Choose the organization this pattern belongs to.' };
  if (!Array.isArray(r.sections) || r.sections.length < 1 || r.sections.length > LIMITS.sections) {
    return { error: `Add 1 to ${LIMITS.sections} sections.` };
  }

  const sections: PatternSection[] = [];
  let questions = 0;
  for (const [i, raw] of r.sections.entries()) {
    const s = (raw ?? {}) as Record<string, unknown>;
    const at = `Section ${i + 1}`;
    const sName = typeof s.name === 'string' ? s.name.trim() : '';
    if (!sName || sName.length > LIMITS.nameMax) return { error: `${at}: enter a name (up to ${LIMITS.nameMax} characters).` };
    const count = num(s.questionCount);
    if (!Number.isInteger(count) || count < 1) return { error: `${at}: the number of questions must be a whole number of at least 1.` };
    questions += count;
    if (questions > LIMITS.questions) return { error: `A pattern can have at most ${LIMITS.questions} questions.` };
    const marks = num(s.marks);
    if (!(marks > 0) || marks > LIMITS.maxMarks) return { error: `${at}: marks must be above 0 and at most ${LIMITS.maxMarks}.` };
    const negRaw = num(s.negativeMarks);
    const negative = Number.isNaN(negRaw) ? 0 : negRaw;
    if (negative < 0 || negative > LIMITS.maxMarks) return { error: `${at}: negative marks must be from 0 to ${LIMITS.maxMarks}.` };

    let minutes: number | null = null;
    if (!isBlank(s.durationMinutes)) {
      minutes = num(s.durationMinutes);
      if (!Number.isInteger(minutes) || minutes < 1 || minutes > LIMITS.maxMinutes) {
        return { error: `${at}: the time must be a whole number of minutes from 1 to ${LIMITS.maxMinutes}.` };
      }
    }
    sections.push({ name: sName, questionCount: count, marks: round2(marks), negativeMarks: round2(negative), durationMinutes: minutes });
  }

  const timed = sections.filter((s) => s.durationMinutes !== null).length;
  if (timed > 0 && timed < sections.length) return { error: 'Give a time limit to every section, or to none of them.' };

  let totalMinutes: number;
  if (timed === sections.length) {
    totalMinutes = sections.reduce((n, s) => n + (s.durationMinutes ?? 0), 0);
  } else {
    totalMinutes = num(r.totalMinutes);
    if (!Number.isInteger(totalMinutes) || totalMinutes < 1) return { error: 'Enter the total time in minutes, or give every section its own time.' };
  }
  if (totalMinutes > LIMITS.maxMinutes) return { error: `The total time can be at most ${LIMITS.maxMinutes} minutes.` };

  return { data: { name, organizationId, totalMinutes, sections } };
}
