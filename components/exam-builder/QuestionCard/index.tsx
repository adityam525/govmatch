'use client';

import { Bookmark, BookmarkCheck } from 'lucide-react';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

import {
  ExamQuestion,
  UserAnswer,
} from '@/features/exam-engine/types/exam';

interface QuestionCardProps {
  question: ExamQuestion;
  answer: UserAnswer;
  onAnswer: (optionId: string) => void;
  onBookmark: () => void;
}

export default function QuestionCard({
  question,
  answer,
  onAnswer,
  onBookmark,
}: QuestionCardProps) {
  return (
    <Card>

      <div className="flex items-start justify-between gap-4">

        <h2 className="text-xl font-semibold leading-8">
          {question.question}
        </h2>

        <Button
          variant="ghost"
          onClick={onBookmark}
          aria-label="Bookmark Question"
        >
          {answer.bookmarked ? (
            <BookmarkCheck size={20} />
          ) : (
            <Bookmark size={20} />
          )}
        </Button>

      </div>

      <div className="mt-8 space-y-3">

        {question.options.map((option) => {

          const selected =
            answer.selectedOptionId === option.id;

          return (
            <button
              key={option.id}
              onClick={() => onAnswer(option.id)}
              className={[
                'w-full rounded-lg border p-4 text-left transition',
                selected
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-neutral-200 hover:border-primary-300',
              ].join(' ')}
            >
              <span className="mr-3 font-semibold">
                {option.id}.
              </span>

              {option.text}
            </button>
          );
        })}

      </div>

    </Card>
  );
}
