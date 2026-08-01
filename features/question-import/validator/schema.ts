import {
  ImportedQuestion,
  ValidationError,
} from '../types/import';

export function validateQuestions(
  questions: ImportedQuestion[],
): ValidationError[] {

  const errors: ValidationError[] = [];

  questions.forEach((question, index) => {

    if (!question.question) {

      errors.push({

        row: index + 1,

        field: 'question',

        message: 'Question is required',

      });

    }

    if (!question.answer) {

      errors.push({

        row: index + 1,

        field: 'answer',

        message: 'Correct answer missing',

      });

    }

  });

  return errors;

}
