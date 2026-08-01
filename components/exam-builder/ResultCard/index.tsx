'use client';

import Card from '@/components/ui/Card';
import { ExamResult } from '@/features/exam-engine/types/exam';

interface ResultCardProps {
  result?: ExamResult;
}

const EMPTY_RESULT: ExamResult = {
  totalQuestions: 0,
  attempted: 0,
  skipped: 0,
  correct: 0,
  wrong: 0,
  obtainedMarks: 0,
  maximumMarks: 0,
  percentage: 0,
  timeTaken: 0,
};

const stats = [
  {
    key: 'correct',
    label: 'Correct',
    color: 'text-green-600',
  },
  {
    key: 'wrong',
    label: 'Wrong',
    color: 'text-red-600',
  },
  {
    key: 'skipped',
    label: 'Skipped',
    color: 'text-orange-600',
  },
  {
    key: 'percentage',
    label: 'Percentage',
    color: 'text-primary-600',
  },
] as const;

export default function ResultCard({
  result = EMPTY_RESULT,
}: ResultCardProps) {
  return (
    <Card padding="lg">
      <h2 className="text-2xl font-bold">
        Exam Result
      </h2>

      <div className="mt-6 grid gap-4 md:grid-cols-4">

        {stats.map((item) => (
          <div
            key={item.key}
            className="rounded-lg border p-4"
          >
            <div className="text-xs text-neutral-500">
              {item.label}
            </div>

            <div className={`mt-2 text-3xl font-bold ${item.color}`}>
              {item.key === 'percentage'
                ? `${result.percentage}%`
                : result[item.key]}
            </div>
          </div>
        ))}

      </div>

      <div className="mt-6 rounded-lg bg-neutral-50 p-5">

        <div className="flex justify-between">

          <span>Total Marks</span>

          <strong>
            {result.obtainedMarks} / {result.maximumMarks}
          </strong>

        </div>

      </div>

    </Card>
  );
}
