"use client";

import { useMemo, useState } from "react";

import ExamLayout from "@/components/exam-builder/ExamLayout";
import ExamHeader from "@/components/exam-builder/ExamHeader";
import QuestionCard from "@/components/exam-builder/QuestionCard";
import ExamNavigation from "@/components/exam-builder/ExamNavigation";
import RightSidebar from "@/components/exam-builder/RightSidebar";
import SubmitDialog from "@/components/exam-builder/SubmitDialog";

import { sampleExam } from "@/features/exam-engine/sample/sampleExam";
import ExamEngine from "@/features/exam-engine/engine/ExamEngine";

export default function AttemptPage() {
  const engine = useMemo(() => {
    return new ExamEngine(sampleExam);
  }, []);

  const [, rerender] = useState(0);

  const [submitOpen, setSubmitOpen] = useState(false);

  const state = engine.getState();

  const question = sampleExam.questions[state.currentQuestion];

  function update() {
    rerender((v) => v + 1);
  }

  function next() {
    engine.nextQuestion();
    update();
  }

  function previous() {
    engine.previousQuestion();
    update();
  }

  function answer(optionId: string) {
    engine.answer(optionId);
    update();
  }

  function bookmark() {
    engine.toggleBookmark();
    update();
  }

  return (
    <>
      <ExamLayout
        header={
          <ExamHeader
            title={sampleExam.config.title}
            totalQuestions={sampleExam.questions.length}
            currentQuestion={state.currentQuestion + 1}
            remainingTime={state.remainingTime}
            onSubmit={() => setSubmitOpen(true)}
          />
        }
        sidebar={
          <RightSidebar
            answers={state.answers}
            currentQuestion={state.currentQuestion}
            onSelectQuestion={(index) => {
              engine.goToQuestion(index);

              update();
            }}
          />
        }
      >
        <QuestionCard
          question={question}
          answer={state.answers[state.currentQuestion]}
          onAnswer={answer}
          onBookmark={bookmark}
        />

        <div className="mt-8">
          <ExamNavigation
            current={state.currentQuestion}
            total={sampleExam.questions.length}
            onPrevious={previous}
            onNext={next}
            onSubmit={() => setSubmitOpen(true)}
          />
        </div>
      </ExamLayout>

      <SubmitDialog
        open={submitOpen}
        answered={state.answers.filter((a) => a.answered).length}
        total={sampleExam.questions.length}
        onCancel={() => setSubmitOpen(false)}
        onSubmit={() => {
          engine.submit();

          update();

          setSubmitOpen(false);
        }}
      />
    </>
  );
}
