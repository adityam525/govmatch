import { MockTest } from '../types/mock-test';

export const mockTests: MockTest[] = [
  {
    id: '1',
    slug: 'ssc-cgl-full-test-1',

    title: 'SSC CGL Full Mock Test 1',

    description:
      '100 Questions based on latest SSC pattern.',

    category: 'SSC',

    duration: 60,

    questions: 100,

    marks: 200,

    negativeMarking: 0.5,

    difficulty: 'medium',

    language: 'English',

    free: true,

    featured: true,

    attempts: 18420,

    rating: 4.8,

    examId: 'ssc-cgl-demo',

    tags: [
      'SSC',
      'CGL',
      'Tier 1',
    ],

    createdAt: '2026-07-20',
  },

  {
    id: '2',

    slug: 'ibps-po-prelims',

    title: 'IBPS PO Prelims Mock',

    description:
      'Latest Banking pattern mock test.',

    category: 'BANKING',

    duration: 60,

    questions: 100,

    marks: 100,

    negativeMarking: 0.25,

    difficulty: 'medium',

    language: 'English',

    free: true,

    featured: false,

    attempts: 9050,

    rating: 4.7,

    examId: 'ibps-demo',

    tags: [
      'Banking',
      'IBPS',
    ],

    createdAt: '2026-07-20',
  },
];
