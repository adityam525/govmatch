export interface ExamConfig {
  title: string;
  duration: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  negativeMarking: boolean;
  allowReview: boolean;
}

export interface ExamOption {
  id: string;
  text: string;
}

export interface ExamQuestion {
  id: string;
  question: string;
  options: ExamOption[];
  correctOptionId: string;
  marks: number;
  negativeMarks: number;
  topic?: string;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface Exam {
  id: string;
  config: ExamConfig;
  questions: ExamQuestion[];
}

export interface UserAnswer {
  questionId: string;
  selectedOptionId: string | null;
  bookmarked: boolean;
  visited: boolean;
  answered: boolean;
  timeSpent: number;
}

export interface ExamState {
  currentQuestion: number;
  startedAt: number;
  remainingTime: number;
  submitted: boolean;
  answers: UserAnswer[];
}

export interface ExamResult {
  totalQuestions: number;
  attempted: number;
  skipped: number;
  correct: number;
  wrong: number;
  obtainedMarks: number;
  maximumMarks: number;
  percentage: number;
  timeTaken: number;
}
