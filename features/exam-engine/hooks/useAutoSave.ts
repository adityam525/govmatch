'use client';

import { useEffect } from 'react';

import { ExamState } from '../types/exam';
import { saveExamState } from '../storage/examStorage';

export default function useAutoSave(
  examId: string,
  state: ExamState,
) {
  useEffect(() => {
    const timer = setTimeout(() => {
      saveExamState(
        examId,
        state,
      );
    }, 500);

    return () => clearTimeout(timer);
  }, [examId, state]);
}
