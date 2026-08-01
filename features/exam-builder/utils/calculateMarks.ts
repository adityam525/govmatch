import { SelectedQuestion } from '../types/exam-builder';

export function calculateMarks(
  questions: SelectedQuestion[],
) {

  const total = questions.reduce(

    (sum, question) => sum + question.marks,

    0,

  );

  const negative = questions.reduce(

    (sum, question) => sum + question.negativeMarks,

    0,

  );

  return {

    total,

    negative,

  };

}
