import { Exam } from '../types/exam';

export interface ValidationIssue {
  questionId?: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

export function validateExam(
  exam: Exam,
): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (exam.questions.length === 0) {
    issues.push({
      message: 'No questions were found.',
    });
  }

  const ids = new Set<string>();

  exam.questions.forEach((question, index) => {
    const id = question.id || String(index + 1);

    if (ids.has(id)) {
      issues.push({
        questionId: id,
        message: 'Duplicate question id.',
      });
    }

    ids.add(id);

    if (!question.question.trim()) {
      issues.push({
        questionId: id,
        message: 'Question cannot be empty.',
      });
    }

    if (question.options.length < 2) {
      issues.push({
        questionId: id,
        message: 'Minimum two options required.',
      });
    }

    const optionIds = new Set<string>();

    question.options.forEach((option) => {
      if (optionIds.has(option.id)) {
        issues.push({
          questionId: id,
          message: `Duplicate option "${option.id}".`,
        });
      }

      optionIds.add(option.id);

      if (!option.text.trim()) {
        issues.push({
          questionId: id,
          message: `Option "${option.id}" is empty.`,
        });
      }
    });

    const found = question.options.some(
      (option) => option.id === question.correctOptionId,
    );

    if (!found) {
      issues.push({
        questionId: id,
        message: `Correct answer "${question.correctOptionId}" does not exist.`,
      });
    }

    if (question.marks <= 0) {
      issues.push({
        questionId: id,
        message: 'Marks must be greater than zero.',
      });
    }

    if (question.negativeMarks < 0) {
      issues.push({
        questionId: id,
        message: 'Negative marks cannot be negative.',
      });
    }
  });

  return {
    valid: issues.length === 0,
    issues,
  };
}
