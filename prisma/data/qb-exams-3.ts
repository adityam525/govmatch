import type { QbExamDef } from './qb-exams';

const ENGLISH = ['Grammar', 'Vocabulary', 'Sentence Structure', 'Comprehension'];
const REASONING = ['Verbal Reasoning', 'Relations and Direction', 'Arrangements and Puzzles', 'Logical Reasoning', 'Mathematical Reasoning'];
const REASONING_FULL = [...REASONING, 'Calendar and Clock', 'Non-verbal Reasoning'];
const BANK_QUANT = ['Simplification and Approximation', 'Number Series', 'Data Interpretation', 'Percentage', 'Ratio and Proportion', 'Average', 'Profit and Loss', 'Simple and Compound Interest', 'Time and Work', 'Time, Speed and Distance', 'Mensuration', 'Ages', 'Permutation, Combination and Probability', 'Number System'];
const BASIC_QUANT = ['Number System', 'Simplification and Approximation', 'Percentage', 'Ratio and Proportion', 'Average', 'Profit and Loss', 'Simple and Compound Interest', 'Time and Work', 'Time, Speed and Distance', 'Mensuration', 'Algebra', 'Geometry', 'Statistics'];
const MATHS_FULL = [...BASIC_QUANT, 'Trigonometry'];
const GA_FULL = ['History', 'Geography', 'Polity', 'Economy', 'General Science', 'Static GK', 'Current Affairs'];
const GA_BANK = ['Economy', 'Current Affairs', 'Static GK'];
const COMPUTER = ['Fundamentals', 'Office Tools', 'Internet and Security'];

// Removes repeats while keeping the order.
const u = (...parts: string[][]) => [...new Set(parts.flat())];

export const QB_EXAMS_3: QbExamDef[] = [
  // Banking and insurance
  { slug: 'rbi-assistant-prelims', name: 'RBI Assistant', stage: 'Prelims', org: 'RBI', chapters: u(ENGLISH, BANK_QUANT, REASONING) },
  { slug: 'rbi-assistant-mains', name: 'RBI Assistant', stage: 'Mains', org: 'RBI', chapters: u(ENGLISH, BANK_QUANT, REASONING, GA_BANK, COMPUTER) },
  { slug: 'rbi-grade-b-phase-1', name: 'RBI Grade B', stage: 'Phase 1', org: 'RBI', chapters: u(ENGLISH, BANK_QUANT, REASONING, GA_FULL) },
  { slug: 'nabard-grade-a-prelims', name: 'NABARD Grade A', stage: 'Prelims', org: 'NABARD', chapters: u(ENGLISH, BANK_QUANT, REASONING, GA_BANK, COMPUTER) },
  { slug: 'lic-aao-prelims', name: 'LIC AAO', stage: 'Prelims', org: 'LIC', chapters: u(ENGLISH, BANK_QUANT, REASONING) },
  { slug: 'lic-assistant-prelims', name: 'LIC Assistant', stage: 'Prelims', org: 'LIC', chapters: u(ENGLISH, BANK_QUANT, REASONING) },
  { slug: 'idbi-jam-online-test', name: 'IDBI Junior Assistant Manager', stage: 'Online test', org: 'IDBI', chapters: u(ENGLISH, BANK_QUANT, REASONING, GA_BANK, COMPUTER) },
  // SSC
  { slug: 'ssc-stenographer-cbt', name: 'SSC Stenographer', stage: 'CBT', org: 'SSC', chapters: u(REASONING, GA_FULL, ENGLISH) },
  { slug: 'ssc-je-paper-1', name: 'SSC Junior Engineer', stage: 'Paper 1 (general sections)', org: 'SSC', chapters: u(REASONING_FULL, GA_FULL) },
  { slug: 'ssc-selection-post', name: 'SSC Selection Post', stage: 'CBT', org: 'SSC', chapters: u(REASONING, GA_FULL, BASIC_QUANT, ENGLISH) },
  { slug: 'ssc-chsl-tier-2', name: 'SSC CHSL', stage: 'Tier 2', org: 'SSC', chapters: u(REASONING_FULL, GA_FULL, BASIC_QUANT, ENGLISH, COMPUTER) },
  // Railways
  { slug: 'rrb-alp-technician-cbt-1', name: 'RRB ALP and Technician', stage: 'CBT 1', org: 'RRB', chapters: u(REASONING, GA_FULL, MATHS_FULL) },
  { slug: 'rrb-je-cbt-1', name: 'RRB Junior Engineer', stage: 'CBT 1', org: 'RRB', chapters: u(REASONING, GA_FULL, MATHS_FULL, COMPUTER) },
  { slug: 'rrb-ntpc-cbt-2', name: 'RRB NTPC', stage: 'CBT 2', org: 'RRB', chapters: u(REASONING_FULL, GA_FULL, MATHS_FULL) },
  // UPSC and defence
  { slug: 'upsc-csat', name: 'UPSC Civil Services', stage: 'Prelims Paper 2 (CSAT)', org: 'UPSC', chapters: u(ENGLISH, REASONING, ['Number System', 'Percentage', 'Ratio and Proportion', 'Average', 'Data Interpretation', 'Statistics']) },
  { slug: 'upsc-cds-written', name: 'UPSC CDS', stage: 'Written', org: 'UPSC', chapters: u(ENGLISH, GA_FULL, BASIC_QUANT) },
  { slug: 'upsc-nda-written', name: 'UPSC NDA', stage: 'Written', org: 'UPSC', chapters: u(ENGLISH, GA_FULL, MATHS_FULL) },
  { slug: 'afcat-written', name: 'AFCAT', stage: 'Written', org: 'IAF', chapters: u(ENGLISH, REASONING, BASIC_QUANT, ['History', 'Geography', 'Polity', 'General Science', 'Static GK', 'Current Affairs']) },
  { slug: 'agniveer-army-gd', name: 'Agniveer Army General Duty', stage: 'CEE', org: 'ARMY', chapters: u(['General Science', 'Static GK', 'Current Affairs', 'History', 'Geography', 'Polity'], BASIC_QUANT) },
  // State and other
  { slug: 'upsssc-pet', name: 'UPSSSC PET', stage: 'Preliminary', org: 'UPSSSC', chapters: u(GA_FULL, REASONING, BASIC_QUANT, ENGLISH) },
  { slug: 'up-police-constable', name: 'UP Police Constable', stage: 'Written', org: 'UPPOLICE', chapters: u(GA_FULL, REASONING, BASIC_QUANT) },
  { slug: 'dsssb-tier-1', name: 'DSSSB', stage: 'Tier 1', org: 'DSSSB', chapters: u(GA_FULL, REASONING, BASIC_QUANT, ENGLISH) },
  { slug: 'state-psc-prelims-csat-style', name: 'State PSC', stage: 'Prelims aptitude', org: 'UPSC', chapters: u(ENGLISH, REASONING, ['Number System', 'Percentage', 'Ratio and Proportion', 'Average', 'Data Interpretation', 'Statistics']) },
];
