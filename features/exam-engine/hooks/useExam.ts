import { useCallback, useMemo, useState } from 'react';

import ExamEngine from '../engine/ExamEngine';
import { Exam } from '../types/exam';

export function useExam(exam: Exam) {
  const engine = useMemo(
    () => new ExamEngine(exam),
    [exam],
  );

  const [, forceRender] = useState(0);

  const refresh = useCallback(() => {
    forceRender((value) => value + 1);
  }, []);

  const next = useCallback(() => {
    engine.nextQuestion();
    refresh();
  }, [engine, refresh]);

  const previous = useCallback(() => {
    engine.previousQuestion();
    refresh();
  }, [engine, refresh]);

  const goToQuestion = useCallback(
    (index: number) => {
      engine.goToQuestion(index);
      refresh();
    },
    [engine, refresh],
  );

  const answer = useCallback(
    (optionId: string) => {
      engine.answer(optionId);
      refresh();
    },
    [engine, refresh],
  );

  const clearAnswer = useCallback(() => {
    engine.clearAnswer();
    refresh();
  }, [engine, refresh]);

  const toggleBookmark = useCallback(() => {
    engine.toggleBookmark();
    refresh();
  }, [engine, refresh]);

  const submit = useCallback(() => {
    engine.submit();
    refresh();
  }, [engine, refresh]);

  const tick = useCallback(() => {
    engine.tick();
    refresh();
  }, [engine, refresh]);

  return {
    exam: engine.getExam(),

    state: engine.getState(),

    currentQuestion: engine.getCurrentQuestion(),

    currentAnswer: engine.getCurrentAnswer(),

    result: engine.getResult(),

    next,

    previous,

    goToQuestion,

    answer,

    clearAnswer,

    toggleBookmark,

    submit,

    tick,

    submitted: engine.isSubmitted(),
  };
}
