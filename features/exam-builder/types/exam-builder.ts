export interface SelectedQuestion {

  id: string;

  marks: number;

  negativeMarks: number;

  section: string;

}

export interface ExamDraft {

  id?: string;

  title: string;

  slug: string;

  description: string;

  exam: string;

  duration: number;

  totalMarks: number;

  published: boolean;

  questions: SelectedQuestion[];

}
