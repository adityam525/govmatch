import { sanitizeAnswers, scoreAttempt, type AnswerState, type ScoreResult, type SnapshotQuestion } from '@/lib/mock-test';

// A frozen copy of the test taken when the exam starts, so later edits never change a sitting.
export interface SnapQ { id: string; text: string; options: string[]; correctIndex: number; marks: number; negativeMarks: number; explanation: string | null }
export interface SnapSection { name: string; durationMinutes: number | null; questions: SnapQ[] }
export interface Snapshot { title: string; durationMinutes: number; sections: SnapSection[] }

export const SECTION_GRACE_MS = 5_000;
export const SUBMIT_GRACE_MS = 15_000;

interface TestLike {
  title: string;
  durationMinutes: number;
  sections: { name: string; durationMinutes: number | null; questions: SnapQ[] }[];
}

export function snapshotFromTest(t: TestLike): Snapshot {
  return {
    title: t.title,
    durationMinutes: t.durationMinutes,
    sections: t.sections.map((s) => ({
      name: s.name,
      durationMinutes: s.durationMinutes ?? null,
      questions: s.questions.map((q) => ({
        id: q.id, text: q.text, options: q.options, correctIndex: q.correctIndex,
        marks: q.marks, negativeMarks: q.negativeMarks, explanation: q.explanation ?? null,
      })),
    })),
  };
}

// Timed sections run one after another and lock when their time ends. Untimed tests use one overall clock.
export const isTimed = (s: Snapshot) => s.sections.length > 0 && s.sections.every((x) => x.durationMinutes != null);
export const totalMinutes = (s: Snapshot) => (isTimed(s) ? s.sections.reduce((n, x) => n + (x.durationMinutes ?? 0), 0) : s.durationMinutes);
export const expiresAtMs = (s: Snapshot, startMs: number) => startMs + totalMinutes(s) * 60_000;
export const isExpired = (s: Snapshot, startMs: number, nowMs: number) => nowMs >= expiresAtMs(s, startMs);

export function windows(s: Snapshot, startMs: number): { start: number; end: number }[] | null {
  if (!isTimed(s)) return null;
  let t = startMs;
  return s.sections.map((x) => {
    const start = t;
    t += (x.durationMinutes as number) * 60_000;
    return { start, end: t };
  });
}

/** The section open right now, or null for an untimed test or once everything has ended. */
export function activeSection(s: Snapshot, startMs: number, nowMs: number): number | null {
  const w = windows(s, startMs);
  if (!w) return null;
  const i = w.findIndex((x) => nowMs >= x.start && nowMs < x.end);
  return i < 0 ? null : i;
}

export function flatQuestions(s: Snapshot): SnapshotQuestion[] {
  return s.sections.flatMap((sec, sectionIndex) =>
    sec.questions.map((q) => ({ id: q.id, sectionIndex, correctIndex: q.correctIndex, marks: q.marks, negativeMarks: q.negativeMarks, optionCount: q.options.length })),
  );
}

// Merges saved answers. Anything for a locked or unopened section, or sent long after the end, is ignored.
// Returns null when the exam is over for good.
export function mergeAnswers(
  s: Snapshot, startMs: number, nowMs: number,
  existing: Record<string, AnswerState>, incoming: unknown,
): Record<string, AnswerState> | null {
  if (nowMs >= expiresAtMs(s, startMs) + SUBMIT_GRACE_MS) return null;
  const qs = flatQuestions(s);
  const clean = sanitizeAnswers(incoming, qs.map((q) => ({ id: q.id, optionCount: q.optionCount })));
  const w = windows(s, startMs);
  const out = { ...existing };
  for (const q of qs) {
    const a = clean[q.id];
    if (!a) continue;
    if (w) {
      const win = w[q.sectionIndex];
      if (nowMs < win.start - 1_000 || nowMs >= win.end + SECTION_GRACE_MS) continue;
    }
    out[q.id] = a;
  }
  return out;
}

export function finalize(s: Snapshot, answers: Record<string, AnswerState>): ScoreResult {
  return scoreAttempt(s.sections.map((x) => x.name), flatQuestions(s), answers);
}

// What the browser may see. Correct answers and explanations only appear after the test is submitted.
export function clientView(s: Snapshot, reveal: boolean) {
  return s.sections.map((sec) => ({
    name: sec.name,
    durationMinutes: sec.durationMinutes,
    questions: sec.questions.map((q) => ({
      id: q.id, text: q.text, options: q.options, marks: q.marks, negativeMarks: q.negativeMarks,
      ...(reveal ? { correctIndex: q.correctIndex, explanation: q.explanation } : {}),
    })),
  }));
}
