'use client';

import { Clock3, BookOpen } from 'lucide-react';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface ExamHeaderProps {
  title: string;
  currentQuestion: number;
  totalQuestions: number;
  remainingTime: number;
  onSubmit: () => void;
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function ExamHeader({
  title,
  currentQuestion,
  totalQuestions,
  remainingTime,
  onSubmit,
}: ExamHeaderProps) {
  return (
    <Card className="sticky top-4 z-40">

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-2xl font-bold">
            {title}
          </h1>

          <p className="mt-1 text-sm text-neutral-500">
            Computer Based Test
          </p>

        </div>

        <div className="flex items-center gap-3">

          <div className="flex items-center gap-2 rounded-lg bg-primary-50 px-4 py-2">

            <BookOpen size={18} />

            <span className="font-medium">
              {currentQuestion} / {totalQuestions}
            </span>

          </div>

          <div className="flex items-center gap-2 rounded-lg bg-orange-50 px-4 py-2">

            <Clock3 size={18} />

            <span className="font-semibold">
              {formatTime(remainingTime)}
            </span>

          </div>

          <Button
            variant="primary"
            onClick={onSubmit}
          >
            Submit Test
          </Button>

        </div>

      </div>

    </Card>
  );
}
