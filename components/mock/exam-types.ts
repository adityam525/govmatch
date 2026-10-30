import type { AnswerState } from '@/lib/mock-test';

export interface ExamQuestion {
  id: string; text: string; options: string[]; marks: number; negativeMarks: number;
  correctIndex?: number; explanation?: string | null;
}
export interface ExamSection { name: string; durationMinutes: number | null; questions: ExamQuestion[] }
export interface ExamResultData {
  score: number; maxScore: number; correct: number; wrong: number; unattempted: number; accuracy: number | null;
  sections: { name: string; score: number; maxScore: number; correct: number; wrong: number; unattempted: number }[];
  perQuestion: { id: string; status: 'correct' | 'wrong' | 'unattempted'; earned: number }[];
}
export interface ExamData {
  id: string; testId: string; title: string; submitted: boolean; serverNow: number; startedAt: number; expiresAt: number;
  timed: boolean; windows: { start: number; end: number }[] | null; activeSection: number | null;
  sections: ExamSection[]; answers: Record<string, AnswerState>; result: ExamResultData | null;
}
