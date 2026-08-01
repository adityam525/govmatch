import { Exam } from '../types/exam';

export const sampleExam: Exam = {
  id: 'ssc-practice-demo',

  config: {
    title: 'SSC Practice Test',
    duration: 60,
    shuffleQuestions: false,
    shuffleOptions: false,
    negativeMarking: false,
    allowReview: true,
  },

  questions: [
    {
      id: '1',
      question: 'Capital of India is?',
      options: [
        { id: 'A', text: 'Mumbai' },
        { id: 'B', text: 'Delhi' },
        { id: 'C', text: 'Chennai' },
        { id: 'D', text: 'Lucknow' },
      ],
      correctOptionId: 'B',
      marks: 1,
      negativeMarks: 0,
      topic: 'GK',
      difficulty: 'easy',
    },
    {
      id: '2',
      question: '2 + 2 = ?',
      options: [
        { id: 'A', text: '3' },
        { id: 'B', text: '4' },
        { id: 'C', text: '5' },
        { id: 'D', text: '6' },
      ],
      correctOptionId: 'B',
      marks: 1,
      negativeMarks: 0,
      topic: 'Math',
      difficulty: 'easy',
    },
  ],
};
