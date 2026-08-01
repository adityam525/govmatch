"use client";

import { useMemo, useState } from "react";

import Card from "@/components/ui/Card";

import InputEditor from "@/components/exam-builder/InputEditor";

import { parseExam } from "@/features/exam-engine/parser/parseExam";
import { validateExam } from "@/features/exam-engine/parser/validator";

import { useExam } from "@/features/exam-engine/hooks/useExam";
import { sampleExam } from "@/features/exam-engine/sample/sampleExam";
import { Exam } from "@/features/exam-engine/types/exam";

export default function ExamBuilderPage() {
  const [exam, setExam] = useState<Exam>(sampleExam);

  const [errors, setErrors] = useState<string[]>([]);

  const {
    currentQuestion,
    currentAnswer,
    state,
    answer,
    next,
    previous,
    submit,
    result,
    submitted,
  } = useExam(exam);

  function handleGenerate(text: string) {
    try {
      const parsed = parseExam(text);

      const validation = validateExam(parsed);

      if (!validation.valid) {
        setErrors(validation.issues.map((item) => item.message));

        return;
      }

      setErrors([]);

      setExam(parsed);
    } catch {
      setErrors(["Unable to parse exam."]);
    }
  }

  const progress = useMemo(() => {
    return `${state.currentQuestion + 1} / ${exam.questions.length}`;
  }, [state.currentQuestion, exam.questions.length]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8">
      <InputEditor onGenerate={handleGenerate} />

      {errors.length > 0 && (
        <Card className="border-red-300 bg-red-50">
          <h3 className="font-semibold text-red-700">Validation Errors</h3>

          <ul className="mt-3 list-disc pl-6 text-sm text-red-600">
            {errors.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{exam.config.title}</h2>

          <span className="rounded bg-primary-50 px-3 py-1 text-sm text-primary-700">
            {progress}
          </span>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold">{currentQuestion.question}</h3>

          <div className="mt-6 grid gap-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                onClick={() => answer(option.id)}
                className={`rounded-lg border p-4 text-left transition

${
  currentAnswer.selectedOptionId === option.id
    ? "border-primary-600 bg-primary-50"
    : "border-neutral-200 hover:border-primary-300"
}`}
              >
                <strong className="mr-2">{option.id}.</strong>

                {option.text}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={previous}
            disabled={state.currentQuestion === 0}
            className="rounded border px-5 py-2 disabled:opacity-50"
          >
            Previous
          </button>

          {state.currentQuestion === exam.questions.length - 1 ? (
            <button
              onClick={submit}
              className="rounded bg-green-600 px-5 py-2 text-white"
            >
              Submit
            </button>
          ) : (
            <button
              onClick={next}
              className="rounded bg-primary-600 px-5 py-2 text-white"
            >
              Next
            </button>
          )}
        </div>
      </Card>

      {submitted && (
        <Card className="border-green-300 bg-green-50">
          <h2 className="text-xl font-bold">Result</h2>

          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-xs text-neutral-500">Correct</p>

              <p className="text-2xl font-bold">{result.correct}</p>
            </div>

            <div>
              <p className="text-xs text-neutral-500">Wrong</p>

              <p className="text-2xl font-bold">{result.wrong}</p>
            </div>

            <div>
              <p className="text-xs text-neutral-500">Skipped</p>

              <p className="text-2xl font-bold">{result.skipped}</p>
            </div>

            <div>
              <p className="text-xs text-neutral-500">Percentage</p>

              <p className="text-2xl font-bold">{result.percentage}%</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
