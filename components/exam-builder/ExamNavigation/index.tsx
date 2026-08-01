'use client';

import Button from '@/components/ui/Button';

interface ExamNavigationProps {
  current: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export default function ExamNavigation({
  current,
  total,
  onPrevious,
  onNext,
  onSubmit,
}: ExamNavigationProps) {
  const isFirst = current === 0;
  const isLast = current === total - 1;

  return (
    <div className="flex items-center justify-between">

      <Button
        variant="secondary"
        onClick={onPrevious}
        disabled={isFirst}
      >
        Previous
      </Button>

      <div className="text-sm text-neutral-500">
        Question {current + 1} of {total}
      </div>

      {isLast ? (
        <Button
          variant="primary"
          onClick={onSubmit}
        >
          Submit Test
        </Button>
      ) : (
        <Button
          variant="primary"
          onClick={onNext}
        >
          Next
        </Button>
      )}

    </div>
  );
}
