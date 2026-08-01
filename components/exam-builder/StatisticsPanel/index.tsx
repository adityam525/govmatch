'use client';

import Card from '@/components/ui/Card';

import { UserAnswer } from '@/features/exam-engine/types/exam';

interface Props {
  answers: UserAnswer[];
}

export default function StatisticsPanel({
  answers,
}: Props) {
  const answered = answers.filter(
    (item) => item.answered,
  ).length;

  const bookmarked = answers.filter(
    (item) => item.bookmarked,
  ).length;

  const visited = answers.filter(
    (item) => item.visited,
  ).length;

  const remaining =
    answers.length - answered;

  return (
    <Card>
      <h3 className="text-lg font-semibold">
        Exam Statistics
      </h3>

      <div className="mt-6 space-y-4">

        <div className="flex justify-between">
          <span>Answered</span>
          <strong>{answered}</strong>
        </div>

        <div className="flex justify-between">
          <span>Visited</span>
          <strong>{visited}</strong>
        </div>

        <div className="flex justify-between">
          <span>Bookmarked</span>
          <strong>{bookmarked}</strong>
        </div>

        <div className="flex justify-between">
          <span>Remaining</span>
          <strong>{remaining}</strong>
        </div>

      </div>
    </Card>
  );
}
