export interface QbExamDef { slug: string; name: string; stage: string; org: string; chapters: string[] }

const ENGLISH = ['Grammar', 'Vocabulary', 'Sentence Structure', 'Comprehension'];
const REASONING = ['Verbal Reasoning', 'Relations and Direction', 'Arrangements and Puzzles', 'Logical Reasoning', 'Mathematical Reasoning'];
const REASONING_SSC = [...REASONING, 'Calendar and Clock', 'Non-verbal Reasoning'];
const BANK_QUANT = ['Simplification and Approximation', 'Number Series', 'Data Interpretation', 'Percentage', 'Ratio and Proportion', 'Average', 'Profit and Loss', 'Simple and Compound Interest', 'Time and Work', 'Time, Speed and Distance', 'Mensuration', 'Ages', 'Permutation, Combination and Probability', 'Number System'];
const SSC_QUANT = ['Number System', 'Simplification and Approximation', 'Percentage', 'Ratio and Proportion', 'Average', 'Profit and Loss', 'Simple and Compound Interest', 'Time and Work', 'Time, Speed and Distance', 'Mensuration', 'Algebra', 'Geometry', 'Trigonometry', 'Data Interpretation', 'Statistics'];
const GA_BANK = ['Economy', 'Current Affairs', 'Static GK'];
const GA_SSC = ['History', 'Geography', 'Polity', 'Economy', 'General Science', 'Static GK', 'Current Affairs'];
const COMPUTER = ['Fundamentals', 'Office Tools', 'Internet and Security'];

export const QB_EXAMS: QbExamDef[] = [
  { slug: 'ibps-po-prelims', name: 'IBPS PO', stage: 'Prelims', org: 'IBPS', chapters: [...ENGLISH, ...BANK_QUANT, ...REASONING] },
  { slug: 'ibps-po-mains', name: 'IBPS PO', stage: 'Mains', org: 'IBPS', chapters: [...ENGLISH, ...BANK_QUANT, ...REASONING, ...GA_BANK, ...COMPUTER] },
  { slug: 'ibps-clerk-prelims', name: 'IBPS Clerk', stage: 'Prelims', org: 'IBPS', chapters: [...ENGLISH, ...BANK_QUANT, ...REASONING] },
  { slug: 'ibps-clerk-mains', name: 'IBPS Clerk', stage: 'Mains', org: 'IBPS', chapters: [...ENGLISH, ...BANK_QUANT, ...REASONING, ...GA_BANK, ...COMPUTER] },
  { slug: 'ssc-cgl-tier-1', name: 'SSC CGL', stage: 'Tier 1', org: 'SSC', chapters: [...REASONING_SSC, ...GA_SSC, ...SSC_QUANT, ...ENGLISH] },
  { slug: 'ssc-cgl-tier-2', name: 'SSC CGL', stage: 'Tier 2', org: 'SSC', chapters: [...SSC_QUANT, ...ENGLISH] },
  { slug: 'ssc-chsl-tier-1', name: 'SSC CHSL', stage: 'Tier 1', org: 'SSC', chapters: [...REASONING_SSC, ...GA_SSC, ...SSC_QUANT, ...ENGLISH] },
];
