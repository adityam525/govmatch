// Rules for user-made mock tests: validation, answer cleaning and scoring. Pure functions
// (no database), so prisma/check-mocktest.ts tests exactly the code the API uses.

export const LIMITS = {
  tests: 20, sections: 8, questions: 300, titleMax: 120, descriptionMax: 500, nameMax: 80,
  textMax: 2000, optionMax: 500, explanationMax: 2000, optionsMin: 2, optionsMax: 5, maxMinutes: 360, maxMarks: 10,
};

export const EXAM_STYLES = [{ code: 'SSC', label: 'SSC / IBPS style (computer based test)' }] as const;

export interface QuestionInput { text: string; options: string[]; correctIndex: number; marks: number; negativeMarks: number; explanation: string | null }
export interface SectionInput { name: string; questions: QuestionInput[] }
export interface TestInput { title: string; description: string | null; examStyle: string; durationMinutes: number; sections: SectionInput[] }

const round2 = (n: number) => Math.round(n * 100) / 100;
const text = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
const toNum = (v: unknown) => (v === '' || v === null || v === undefined || typeof v === 'boolean' ? NaN : Number(v));

export function validateTest(raw: unknown): { error: string } | { data: TestInput } {
  if (!raw || typeof raw !== 'object') return { error: 'Invalid test.' };
  const r = raw as Record<string, unknown>;

  const title = text(r.title);
  if (!title || title.length > LIMITS.titleMax) return { error: `Enter a title (up to ${LIMITS.titleMax} characters).` };
  const description = text(r.description);
  if (description.length > LIMITS.descriptionMax) return { error: `The description can be up to ${LIMITS.descriptionMax} characters.` };
  const examStyle = text(r.examStyle) || 'SSC';
  if (!EXAM_STYLES.some((s) => s.code === examStyle)) return { error: 'Choose a valid exam layout.' };

  const duration = toNum(r.durationMinutes);
  if (!Number.isInteger(duration) || duration < 1 || duration > LIMITS.maxMinutes) {
    return { error: `The time limit must be a whole number of minutes from 1 to ${LIMITS.maxMinutes}.` };
  }
  if (!Array.isArray(r.sections) || r.sections.length < 1 || r.sections.length > LIMITS.sections) {
    return { error: `Add 1 to ${LIMITS.sections} sections.` };
  }

  let total = 0;
  const sections: SectionInput[] = [];
  for (const [si, rawSection] of r.sections.entries()) {
    const s = (rawSection ?? {}) as Record<string, unknown>;
    const where = `Section ${si + 1}`;
    const name = text(s.name);
    if (!name || name.length > LIMITS.nameMax) return { error: `${where}: enter a name (up to ${LIMITS.nameMax} characters).` };
    if (!Array.isArray(s.questions) || s.questions.length < 1) return { error: `${where} ("${name}"): add at least one question.` };

    const questions: QuestionInput[] = [];
    for (const [qi, rawQ] of s.questions.entries()) {
      if (++total > LIMITS.questions) return { error: `A test can have at most ${LIMITS.questions} questions.` };
      const q = (rawQ ?? {}) as Record<string, unknown>;
      const at = `${where}, question ${qi + 1}`;

      const qText = text(q.text);
      if (!qText || qText.length > LIMITS.textMax) return { error: `${at}: enter the question (up to ${LIMITS.textMax} characters).` };
      if (!Array.isArray(q.options) || q.options.length < LIMITS.optionsMin || q.options.length > LIMITS.optionsMax) {
        return { error: `${at}: give ${LIMITS.optionsMin} to ${LIMITS.optionsMax} options.` };
      }
      const options = q.options.map(text);
      if (options.some((o) => !o || o.length > LIMITS.optionMax)) return { error: `${at}: every option needs text (up to ${LIMITS.optionMax} characters).` };

      const correct = toNum(q.correctIndex);
      if (!Number.isInteger(correct) || correct < 0 || correct >= options.length) return { error: `${at}: choose the correct answer.` };

      const marks = toNum(q.marks);
      if (!(marks > 0) || marks > LIMITS.maxMarks) return { error: `${at}: marks must be above 0 and at most ${LIMITS.maxMarks}.` };
      const negRaw = toNum(q.negativeMarks);
      const negative = Number.isNaN(negRaw) ? 0 : negRaw;
      if (negative < 0 || negative > LIMITS.maxMarks) return { error: `${at}: negative marks must be from 0 to ${LIMITS.maxMarks}.` };

      const explanation = text(q.explanation);
      if (explanation.length > LIMITS.explanationMax) return { error: `${at}: the explanation can be up to ${LIMITS.explanationMax} characters.` };

      questions.push({ text: qText, options, correctIndex: correct, marks: round2(marks), negativeMarks: round2(negative), explanation: explanation || null });
    }
    sections.push({ name, questions });
  }

  return { data: { title, description: description || null, examStyle, durationMinutes: duration, sections } };
}

// The shape Prisma needs to create sections with their questions in one go.
export const toSectionCreate = (sections: SectionInput[]) =>
  sections.map((s, si) => ({
    name: s.name,
    order: si,
    questions: {
      createMany: {
        data: s.questions.map((q, qi) => ({
          order: qi, text: q.text, options: q.options, correctIndex: q.correctIndex,
          marks: q.marks, negativeMarks: q.negativeMarks, explanation: q.explanation,
        })),
      },
    },
  }));

// ---- Answers and scoring ---------------------------------------------------

export interface AnswerState { selected: number | null; marked: boolean; visited: boolean; timeSec: number }
export type PaletteStatus = 'not-visited' | 'not-answered' | 'answered' | 'marked' | 'answered-marked';

export function paletteStatus(a?: AnswerState): PaletteStatus {
  if (!a || (!a.visited && a.selected === null && !a.marked)) return 'not-visited';
  if (a.selected !== null) return a.marked ? 'answered-marked' : 'answered';
  return a.marked ? 'marked' : 'not-answered';
}

// Keeps only known questions and well-formed values, so a tampered request cannot add anything.
export function sanitizeAnswers(raw: unknown, questions: { id: string; optionCount: number }[]): Record<string, AnswerState> {
  const out: Record<string, AnswerState> = {};
  if (!raw || typeof raw !== 'object') return out;
  const source = raw as Record<string, unknown>;
  for (const q of questions) {
    const a = source[q.id];
    if (!a || typeof a !== 'object') continue;
    const x = a as Record<string, unknown>;
    const selected = typeof x.selected === 'number' && Number.isInteger(x.selected) && x.selected >= 0 && x.selected < q.optionCount ? x.selected : null;
    const timeSec = typeof x.timeSec === 'number' && Number.isFinite(x.timeSec) ? Math.min(86400, Math.max(0, Math.round(x.timeSec))) : 0;
    const marked = x.marked === true;
    out[q.id] = { selected, marked, visited: x.visited === true || selected !== null || marked, timeSec };
  }
  return out;
}

export interface SnapshotQuestion { id: string; sectionIndex: number; correctIndex: number; marks: number; negativeMarks: number; optionCount: number }
export interface SectionScore { name: string; score: number; maxScore: number; correct: number; wrong: number; unattempted: number }
export interface ScoreResult {
  score: number; maxScore: number; correct: number; wrong: number; unattempted: number;
  /** Share of attempted questions that were right, or null when nothing was attempted. */
  accuracy: number | null;
  sections: SectionScore[];
  perQuestion: { id: string; status: 'correct' | 'wrong' | 'unattempted'; earned: number }[];
}

// An answer counts whether or not it was also marked for review; a mark without an answer counts as unattempted.
export function scoreAttempt(sectionNames: string[], questions: SnapshotQuestion[], answers: Record<string, AnswerState>): ScoreResult {
  const sections: SectionScore[] = sectionNames.map((name) => ({ name, score: 0, maxScore: 0, correct: 0, wrong: 0, unattempted: 0 }));
  const perQuestion: ScoreResult['perQuestion'] = [];

  for (const q of questions) {
    const sec = sections[q.sectionIndex];
    if (!sec) continue;
    const a = answers[q.id];
    sec.maxScore += q.marks;
    let status: 'correct' | 'wrong' | 'unattempted';
    let earned = 0;
    if (!a || a.selected === null) {
      status = 'unattempted';
      sec.unattempted++;
    } else if (a.selected === q.correctIndex) {
      status = 'correct';
      earned = q.marks;
      sec.correct++;
    } else {
      status = 'wrong';
      earned = q.negativeMarks ? -q.negativeMarks : 0;
      sec.wrong++;
    }
    sec.score += earned;
    perQuestion.push({ id: q.id, status, earned: round2(earned) });
  }

  for (const sec of sections) { sec.score = round2(sec.score); sec.maxScore = round2(sec.maxScore); }
  const sum = (key: 'score' | 'maxScore' | 'correct' | 'wrong' | 'unattempted') => sections.reduce((n, s) => n + s[key], 0);
  const correct = sum('correct');
  const wrong = sum('wrong');
  return {
    score: round2(sum('score')), maxScore: round2(sum('maxScore')), correct, wrong, unattempted: sum('unattempted'),
    accuracy: correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : null,
    sections, perQuestion,
  };
}
