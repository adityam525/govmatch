export interface ImportedQuestion {

  question: string;

  optionA: string;

  optionB: string;

  optionC: string;

  optionD: string;

  answer: string;

  explanation?: string;

  subject: string;

  topic: string;

  difficulty: string;

  exam: string;

}

export interface ValidationError {

  row: number;

  field: string;

  message: string;

}

export interface ImportResult {

  total: number;

  success: number;

  failed: number;

  errors: ValidationError[];

}
