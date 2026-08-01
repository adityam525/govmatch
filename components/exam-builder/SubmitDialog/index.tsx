'use client';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface SubmitDialogProps {
  open: boolean;

  answered: number;

  total: number;

  onCancel(): void;

  onSubmit(): void;
}

export default function SubmitDialog({
  open,
  answered,
  total,
  onCancel,
  onSubmit,
}: SubmitDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">

      <Card
        padding="lg"
        className="w-full max-w-md"
      >

        <h2 className="text-xl font-bold">
          Submit Test?
        </h2>

        <p className="mt-4 text-neutral-600">

          You answered

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

        <div className="mt-8 flex justify-end gap-3">

          <Button
            variant="secondary"
            onClick={onCancel}
          >
            Continue Test
          </Button>

          <Button
            onClick={onSubmit}
          >
            Submit
          </Button>

        </div>

      </Card>

    </div>
  );
}
