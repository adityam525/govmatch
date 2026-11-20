export interface PatternSection { name: string; questionCount: number; marks: number; negativeMarks: number; durationMinutes?: number }
export interface PatternDef { name: string; org: string; totalMinutes: number; sections: PatternSection[] }

// Negative marking is one-fourth (or one-third for RRB) of the marks of a question.
const s = (name: string, questionCount: number, totalMarks: number, negFraction: number, durationMinutes?: number): PatternSection => {
  const marks = totalMarks / questionCount;
  return { name, questionCount, marks, negativeMarks: Math.round(marks * negFraction * 10000) / 10000, durationMinutes };
};
const sum = (x: PatternSection[]) => x.reduce((n, a) => n + (a.durationMinutes ?? 0), 0);
const timed = (name: string, org: string, sections: PatternSection[]): PatternDef => ({ name, org, totalMinutes: sum(sections), sections });
const untimed = (name: string, org: string, totalMinutes: number, sections: PatternSection[]): PatternDef => ({ name, org, totalMinutes, sections });

const PRELIMS = () => [s('English Language', 30, 30, 0.25, 20), s('Quantitative Aptitude', 35, 35, 0.25, 20), s('Reasoning Ability', 35, 35, 0.25, 20)];
const CLERK_PRELIMS = () => [s('English Language', 30, 30, 0.25, 20), s('Numerical Ability', 35, 35, 0.25, 20), s('Reasoning Ability', 35, 35, 0.25, 20)];

export const PATTERNS: PatternDef[] = [
  timed('IBPS PO Prelims', 'IBPS', PRELIMS()),
  timed('IBPS PO Mains (objective)', 'IBPS', [s('Reasoning and Computer Aptitude', 45, 60, 0.25, 60), s('English Language', 35, 40, 0.25, 40), s('Data Analysis and Interpretation', 35, 60, 0.25, 45), s('General, Economy and Banking Awareness', 35, 40, 0.25, 35)]),
  timed('IBPS Clerk Prelims', 'IBPS', CLERK_PRELIMS()),
  timed('IBPS Clerk Mains', 'IBPS', [s('General and Financial Awareness', 50, 50, 0.25, 35), s('General English', 40, 40, 0.25, 35), s('Reasoning Ability and Computer Aptitude', 50, 60, 0.25, 45), s('Quantitative Aptitude', 50, 50, 0.25, 45)]),
  untimed('IBPS RRB Officer Scale I Prelims', 'IBPS', 45, [s('Reasoning', 40, 40, 0.25), s('Quantitative Aptitude', 40, 40, 0.25)]),
  untimed('IBPS RRB Office Assistant Prelims', 'IBPS', 45, [s('Reasoning', 40, 40, 0.25), s('Numerical Ability', 40, 40, 0.25)]),
  timed('SBI PO Prelims', 'SBI', PRELIMS()),
  timed('SBI Clerk Prelims', 'SBI', CLERK_PRELIMS()),
  untimed('SSC CGL Tier 1', 'SSC', 60, [s('General Intelligence and Reasoning', 25, 50, 0.25), s('General Awareness', 25, 50, 0.25), s('Quantitative Aptitude', 25, 50, 0.25), s('English Comprehension', 25, 50, 0.25)]),
  untimed('SSC CHSL Tier 1', 'SSC', 60, [s('English Language', 25, 50, 0.25), s('General Intelligence', 25, 50, 0.25), s('Quantitative Aptitude', 25, 50, 0.25), s('General Awareness', 25, 50, 0.25)]),
  untimed('SSC CPO Paper 1', 'SSC', 120, [s('General Intelligence and Reasoning', 50, 50, 0.25), s('General Knowledge and Awareness', 50, 50, 0.25), s('Quantitative Aptitude', 50, 50, 0.25), s('English Comprehension', 50, 50, 0.25)]),
  untimed('SSC GD Constable', 'SSC', 60, [s('General Intelligence and Reasoning', 20, 40, 0.25), s('General Knowledge and Awareness', 20, 40, 0.25), s('Elementary Mathematics', 20, 40, 0.25), s('English or Hindi', 20, 40, 0.25)]),
  untimed('RRB NTPC CBT 1', 'RRB', 90, [s('General Awareness', 40, 40, 1 / 3), s('Mathematics', 30, 30, 1 / 3), s('General Intelligence and Reasoning', 30, 30, 1 / 3)]),
  untimed('RRB Group D CBT', 'RRB', 90, [s('Mathematics', 25, 25, 1 / 3), s('General Intelligence and Reasoning', 30, 30, 1 / 3), s('General Science', 25, 25, 1 / 3), s('General Awareness and Current Affairs', 20, 20, 1 / 3)]),
];
