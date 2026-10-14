import {
  getPublishedJobs,
  getUpcomingExamRows,
  getAdmitCardRows,
  getResultRows,
  getAnswerKeyRows,
  type PublishedJob,
  type UpdateRow,
} from '@/lib/job-queries';

export type PhaseTab = 'open' | 'upcoming' | 'progress' | 'closed';
export type UpdatePreset = 'exams' | 'admit-cards' | 'results' | 'answer-keys';

export type JobsView =
  | { kind: 'phase'; tab: PhaseTab }
  | { kind: 'updates'; preset: UpdatePreset };

export const PHASE_TABS: { id: PhaseTab; label: string }[] = [
  { id: 'open', label: 'Applications Open' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'progress', label: 'In Progress' },
  { id: 'closed', label: 'Closed' },
];

export const PRESET_LABELS: Record<UpdatePreset, string> = {
  exams: 'Upcoming exams',
  'admit-cards': 'Admit cards available',
  results: 'Results declared',
  'answer-keys': 'Answer keys released',
};

// `phase=live` is what the homepage tiles already link to.
const PHASE_ALIASES: Record<string, PhaseTab> = {
  live: 'open',
  open: 'open',
  upcoming: 'upcoming',
  progress: 'progress',
  inprogress: 'progress',
  closed: 'closed',
};

// The same row rules the homepage lists use, so both always agree.
const PRESET_ROWS: Record<UpdatePreset, (limit: number) => Promise<UpdateRow[]>> = {
  exams: getUpcomingExamRows,
  'admit-cards': getAdmitCardRows,
  results: getResultRows,
  'answer-keys': getAnswerKeyRows,
};

const has = (obj: object, key: string) => Object.prototype.hasOwnProperty.call(obj, key);

export function parseView(params: { [key: string]: string | undefined }): JobsView {
  const updates = params.updates;
  if (updates && has(PRESET_LABELS, updates)) {
    return { kind: 'updates', preset: updates as UpdatePreset };
  }
  const phase = params.phase;
  const tab = phase && has(PHASE_ALIASES, phase) ? PHASE_ALIASES[phase] : 'open';
  return { kind: 'phase', tab };
}

function tabOf(job: PublishedJob): PhaseTab {
  if (job.phase === 'UPCOMING') return 'upcoming';
  if (job.phase === 'LIVE') return job.applicationOpen ? 'open' : 'progress';
  return 'closed';
}

// Ids of the published jobs that belong to the selected view.
export async function getViewIds(view: JobsView): Promise<string[]> {
  if (view.kind === 'updates') {
    const rows = await PRESET_ROWS[view.preset](Infinity);
    return rows.map((row) => row.id);
  }
  const jobs = await getPublishedJobs();
  return jobs.filter((job) => tabOf(job) === view.tab).map((job) => job.id);
}

export async function getPhaseCounts(): Promise<Record<PhaseTab, number>> {
  const counts: Record<PhaseTab, number> = { open: 0, upcoming: 0, progress: 0, closed: 0 };
  for (const job of await getPublishedJobs()) counts[tabOf(job)] += 1;
  return counts;
}
