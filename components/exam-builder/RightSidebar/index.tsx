'use client';

import QuestionPalette from '../QuestionPalette';

import Card from '@/components/ui/Card';

import { UserAnswer } from '@/features/exam-engine/types/exam';

interface RightSidebarProps {
  answers: UserAnswer[];

  currentQuestion: number;

  onSelectQuestion(index: number): void;
}

export default function RightSidebar({
  answers,
  currentQuestion,
  onSelectQuestion,
}: RightSidebarProps) {
  const answered = answers.filter(
    (item) => item.answered,
  ).length;

  const bookmarked = answers.filter(
    (item) => item.bookmarked,
  ).length;

  const visited = answers.filter(
    (item) => item.visited,
  ).length;

  return (
    <div className="space-y-5">

      <Card>

        <div className="grid grid-cols-2 gap-3">

          <div>

            <p className="text-xs text-neutral-500">
              Answered
            </p>

            <p className="mt-1 text-2xl font-bold text-green-600">
              {answered}
            </p>

          </div>

          <div>

            <p className="text-xs text-neutral-500">
              Visited
            </p>

            <p className="mt-1 text-2xl font-bold text-orange-500">
              {visited}
            </p>

          </div>

          <div>

            <p className="text-xs text-neutral-500">
              Bookmarked
            </p>

            <p className="mt-1 text-2xl font-bold text-primary-600">
              {bookmarked}
            </p>

          </div>

          <div>

            <p className="text-xs text-neutral-500">
              Remaining
            </p>

            <p className="mt-1 text-2xl font-bold">
              {answers.length - answered}
            </p>

          </div>

        </div>

      </Card>

      <QuestionPalette
        answers={answers}
        current={currentQuestion}
        onSelect={onSelectQuestion}
      />

    </div>
  );
}
