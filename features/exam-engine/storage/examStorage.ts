import { ExamState } from '../types/exam';

const STORAGE_PREFIX = 'govmatch:exam';

function getKey(examId: string) {
  return `${STORAGE_PREFIX}:${examId}`;
}

export function saveExamState(
  examId: string,
  state: ExamState,
) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(
    getKey(examId),
    JSON.stringify(state),
  );
}

export function loadExamState(
  examId: string,
): ExamState | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const value = localStorage.getItem(
    getKey(examId),
  );

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function clearExamState(
  examId: string,
) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(
    getKey(examId),
  );
}
