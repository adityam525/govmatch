import type { QualDef } from './taxonomy-types';

export const PART_C: QualDef[] = [
  { name: '10th Pass', slug: '10th-pass', level: 2, types: ['10th Pass'], branches: ['Vocational'] },
  { name: 'Postgraduate Diploma', slug: 'pgd', level: 7, types: ['Post Graduate'], short: 'PG Diploma', branches: ['Management', 'Computer Applications', 'Finance', 'Marketing', 'HR', 'Data Science', 'Journalism', 'Education', 'Healthcare', 'Cybersecurity'] },
  { name: 'PGDM', slug: 'pgdm', level: 7, types: ['Post Graduate', 'Management'], branches: ['Marketing', 'Finance', 'HR', 'Operations', 'International Business', 'Business Analytics'] },
  { name: 'CA / CMA / CS', slug: 'ca-cma-cs', level: 6, types: ['Graduate', 'Commerce'], branches: ['Chartered Accountancy', 'Cost and Management Accountancy', 'Company Secretaryship'] },
];
