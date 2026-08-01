'use client';

import { useEffect } from 'react';

import {
  loadExamState,
  saveExamState,
} from '../storage/examStorage';

import { ExamState } from '../types/exam';

interface Props {
  examId: string;
  state: ExamState;
  restore(state: ExamState): void;
}

export default function useExamPersistence({
  examId,
  state,
  restore,
}: Props) {
  useEffect(() => {
    const previous = loadExamState(examId);

    if (previous) {
      restore(previous);
    }
  }, [examId, restore]);

  useEffect(() => {
    saveExamState(examId, state);
  }, [examId, state]);
}
