'use client';

import Card from '@/components/ui/Card';

import {
  Exam,
  UserAnswer,
} from '@/features/exam-engine/types/exam';

interface Props {
  exam: Exam;
  answers: UserAnswer[];
}

export default function ReviewPanel({
  exam,
  answers,
}: Props) {
  return (
    <div className="space-y-6">

      {exam.questions.map((question, index) => {

        const answer = answers[index];

        const correct =
          answer.selectedOptionId ===
          question.correctOptionId;

        return (

          <Card
            key={question.id}
            padding="lg"
          >

            <div className="flex justify-between">

              <h3 className="font-semibold">

                Q{index + 1}. {question.question}

              </h3>

              <span
                className={
                  correct
                    ? 'text-green-600'
                    : 'text-red-600'
                }
              >
                {correct ? 'Correct' : 'Wrong'}
              </span>

            </div>

            <div className="mt-5 space-y-2">

              {question.options.map((option) => {

                const selected =
                  option.id === answer.selectedOptionId;

                const isCorrect =
                  option.id === question.correctOptionId;

                return (

                  <div
                    key={option.id}
                    className={[
                      'rounded border p-3',

                      isCorrect
                        ? 'border-green-500 bg-green-50'

                        : selected
                        ? 'border-red-400 bg-red-50'

                        : 'border-neutral-200',
                    ].join(' ')}
                  >

                    <strong>

                      {option.id}.

                    </strong>

                    {' '}

                    {option.text}

                  </div>

                );

              })}

            </div>

            {question.explanation && (

              <div className="mt-5 rounded bg-blue-50 p-4 text-sm">

                <strong>

                  Explanation

                </strong>

                <p className="mt-2">

                  {question.explanation}

                </p>

              </div>

            )}

          </Card>

        );

      })}

    </div>
  );
}
