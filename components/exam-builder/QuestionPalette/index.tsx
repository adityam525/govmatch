"use client";

import Card from "@/components/ui/Card";

import { UserAnswer } from "@/features/exam-engine/types/exam";

interface QuestionPaletteProps {
  answers: UserAnswer[];
  current: number;
  onSelect(index: number): void;
}

export default function QuestionPalette({
  answers,
  current,
  onSelect,
}: QuestionPaletteProps) {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-neutral-900">
        Question Palette
      </h3>

      <div className="mt-4 grid grid-cols-5 gap-2">
        {answers.map((answer, index) => {
          const active = current === index;

          const answered = answer.selectedOptionId !== null;

          return (
            <button
              key={answer.questionId}
              type="button"
              onClick={() => onSelect(index)}
              className={[
                "h-10 rounded-md border text-sm font-medium transition",
                active
                  ? "border-primary-600 bg-primary-600 text-white"
                  : answered
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-neutral-200 hover:bg-neutral-50",
              ].join(" ")}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-2 text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-primary-600" />
          Current
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-green-500" />
          Answered
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-neutral-300 bg-white" />
          Not Answered
        </div>
      </div>
    </Card>
  );
}
