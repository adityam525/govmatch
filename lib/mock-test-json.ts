// Turns an import file into the shape validateTest expects. Accepts a letter ("B") or a
// 0-based correctIndex for the right answer, and marks set at test, section or question level.

const LETTERS = 'ABCDE';

export function normalizeImport(raw: unknown): { error: string } | { payload: Record<string, unknown> } {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { error: 'The file must contain one test object.' };
  const t = raw as Record<string, any>;
  if (!Array.isArray(t.sections)) return { error: 'The file needs a "sections" list.' };

  const sections = t.sections.map((s: any, si: number) => {
    const questions = Array.isArray(s?.questions) ? s.questions : [];
    return {
      name: s?.name,
      questions: questions.map((q: any) => {
        const out: Record<string, unknown> = {
          text: q?.text ?? q?.question,
          options: q?.options,
          marks: q?.marks ?? s?.marks ?? t.marks ?? 1,
          negativeMarks: q?.negativeMarks ?? s?.negativeMarks ?? t.negativeMarks ?? 0,
          explanation: q?.explanation,
        };
        if (q?.correctIndex !== undefined) out.correctIndex = q.correctIndex;
        else if (typeof q?.answer === 'string' && /^[A-Ea-e]$/.test(q.answer.trim())) out.correctIndex = LETTERS.indexOf(q.answer.trim().toUpperCase());
        return out;
      }),
    };
  });

  return { payload: { title: t.title, description: t.description, examStyle: t.examStyle ?? 'SSC', durationMinutes: t.durationMinutes, sections } };
}

export const SAMPLE_JSON = JSON.stringify(
  {
    title: 'Sample test',
    durationMinutes: 30,
    marks: 2,
    negativeMarks: 0.5,
    sections: [
      {
        name: 'General Awareness',
        questions: [
          { text: 'Capital of India?', options: ['Mumbai', 'New Delhi', 'Kolkata', 'Chennai'], answer: 'B', explanation: 'New Delhi is the capital.' },
        ],
      },
    ],
  },
  null,
  2,
);
