import type { QbExamDef } from './qb-exams';

const ENGLISH = ['Grammar', 'Vocabulary', 'Sentence Structure', 'Comprehension'];
const REASONING = ['Verbal Reasoning', 'Relations and Direction', 'Arrangements and Puzzles', 'Logical Reasoning', 'Mathematical Reasoning'];
const REASONING_FULL = [...REASONING, 'Calendar and Clock', 'Non-verbal Reasoning'];
const BANK_QUANT = ['Simplification and Approximation', 'Number Series', 'Data Interpretation', 'Percentage', 'Ratio and Proportion', 'Average', 'Profit and Loss', 'Simple and Compound Interest', 'Time and Work', 'Time, Speed and Distance', 'Mensuration', 'Ages', 'Permutation, Combination and Probability', 'Number System'];
const BASIC_QUANT = ['Number System', 'Simplification and Approximation', 'Percentage', 'Ratio and Proportion', 'Average', 'Profit and Loss', 'Simple and Compound Interest', 'Time and Work', 'Time, Speed and Distance', 'Mensuration', 'Algebra', 'Geometry', 'Statistics'];
const RAIL_MATHS = [...BASIC_QUANT, 'Trigonometry'];
const GA_FULL = ['History', 'Geography', 'Polity', 'Economy', 'General Science', 'Static GK', 'Current Affairs'];
const GA_BANK = ['Economy', 'Current Affairs', 'Static GK'];
const COMPUTER = ['Fundamentals', 'Office Tools', 'Internet and Security'];

export const QB_EXAMS_2: QbExamDef[] = [
  { slug: 'sbi-po-prelims', name: 'SBI PO', stage: 'Prelims', org: 'SBI', chapters: [...ENGLISH, ...BANK_QUANT, ...REASONING] },
  { slug: 'sbi-po-mains', name: 'SBI PO', stage: 'Mains', org: 'SBI', chapters: [...ENGLISH, ...BANK_QUANT, ...REASONING, ...GA_BANK, ...COMPUTER] },
  { slug: 'sbi-clerk-prelims', name: 'SBI Clerk', stage: 'Prelims', org: 'SBI', chapters: [...ENGLISH, ...BANK_QUANT, ...REASONING] },
  { slug: 'ibps-rrb-po-prelims', name: 'IBPS RRB Officer Scale I', stage: 'Prelims', org: 'IBPS', chapters: [...BANK_QUANT, ...REASONING] },
  { slug: 'ibps-rrb-clerk-prelims', name: 'IBPS RRB Office Assistant', stage: 'Prelims', org: 'IBPS', chapters: [...BANK_QUANT, ...REASONING] },
  { slug: 'ibps-so-prelims', name: 'IBPS SO', stage: 'Prelims', org: 'IBPS', chapters: [...ENGLISH, ...BANK_QUANT, ...REASONING] },
  { slug: 'ssc-cpo-paper-1', name: 'SSC CPO', stage: 'Paper 1', org: 'SSC', chapters: [...REASONING_FULL, ...GA_FULL, ...BASIC_QUANT, ...ENGLISH] },
  { slug: 'ssc-gd-constable', name: 'SSC GD Constable', stage: 'CBT', org: 'SSC', chapters: [...REASONING, ...GA_FULL, ...BASIC_QUANT.slice(0, 10), ...ENGLISH] },
  { slug: 'ssc-mts', name: 'SSC MTS', stage: 'Session', org: 'SSC', chapters: [...REASONING, ...GA_FULL, ...BASIC_QUANT.slice(0, 10), ...ENGLISH] },
  { slug: 'rrb-ntpc-cbt-1', name: 'RRB NTPC', stage: 'CBT 1', org: 'RRB', chapters: [...REASONING_FULL, ...GA_FULL, ...RAIL_MATHS] },
  { slug: 'rrb-group-d', name: 'RRB Group D', stage: 'CBT', org: 'RRB', chapters: [...REASONING, ...GA_FULL, ...BASIC_QUANT.slice(0, 12)] },
];
