export type ExamCategory =
  | 'SSC'
  | 'UPSC'
  | 'BANKING'
  | 'RAILWAY'
  | 'DEFENCE'
  | 'STATE_PSC';

export type Difficulty =
  | 'easy'
  | 'medium'
  | 'hard';

export interface MockTest {
  id: string;

  slug: string;

  title: string;

  description: string;

  category: ExamCategory;

  duration: number;

  questions: number;

  marks: number;

  negativeMarking: number;

  difficulty: Difficulty;

  language: string;

  free: boolean;

  featured: boolean;

  attempts: number;

  rating: number;

  examId: string;

  tags: string[];

  createdAt: string;
}
