'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface ResumeBannerProps {
  answered: number;
  total: number;
  onResume(): void;
  onDiscard(): void;
}

export default function ResumeBanner({
  answered,
  total,
  onResume,
  onDiscard,
}: ResumeBannerProps) {
  return (
    <Card
      padding="lg"
      className="border-primary-200 bg-primary-50"
    >
      <h2 className="text-lg font-bold">
        Resume Previous Attempt
      </h2>

      <p className="mt-2 text-sm text-neutral-600">
        You have an unfinished practice test.

        {' '}Answered

        <strong>
          {' '}
          {answered}
        </strong>

        {' '}out of

        <strong>
          {' '}
          {total}
        </strong>

        {' '}questions.
      </p>

      <div className="mt-6 flex gap-3">

        <Button
          onClick={onResume}
        >
          Resume Test
        </Button>

        <Button
          variant="secondary"
          onClick={onDiscard}
        >
          Start New
        </Button>

      </div>

    </Card>
  );
}
