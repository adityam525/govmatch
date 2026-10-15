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
export type PhaseFilter = PhaseTab | 'all';
export type UpdatePreset = 'exams' | 'admit-cards' | 'results' | 'answer-keys';

// A preset (exams / admit cards / ...) and a phase tab combine: the preset
// picks the jobs, the tab narrows them by lifecycle phase.
export interface JobsView {
  tab: PhaseFilter;
  preset: UpdatePreset | null;
}

export const PHASE_TABS: { id: PhaseFilter; label: string }[] = [
  { id: 'all', label: 'All' },
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
const PHASE_ALIASES: Record<string, PhaseFilter> = {
  all: 'all',
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
  const preset = updates && has(PRESET_LABELS, updates) ? (updates as UpdatePreset) : null;

  const phase = params.phase;
  let tab: PhaseFilter;
  if (phase && has(PHASE_ALIASES, phase)) tab = PHASE_ALIASES[phase];
  else tab = preset ? 'all' : 'open';

  return { tab, preset };
}

function tabOf(job: PublishedJob): PhaseTab {
  if (job.phase === 'UPCOMING') return 'upcoming';
  if (job.phase === 'LIVE') return job.applicationOpen ? 'open' : 'progress';
  return 'closed';
}

async function presetJobIds(preset: UpdatePreset | null): Promise<Set<string> | null> {
  if (!preset) return null;
  const rows = await PRESET_ROWS[preset](Infinity);
  return new Set(rows.map((row) => row.id));
}

// Ids of the published jobs that belong to the selected view.
export async function getViewIds(view: JobsView): Promise<string[]> {
  const [jobs, allowed] = await Promise.all([getPublishedJobs(), presetJobIds(view.preset)]);
  return jobs
    .filter((job) => (!allowed || allowed.has(job.id)) && (view.tab === 'all' || tabOf(job) === view.tab))
    .map((job) => job.id);
}

// Tab counts, computed inside the active preset (if any).
export async function getPhaseCounts(preset: UpdatePreset | null = null): Promise<Record<PhaseFilter, number>> {
  const [jobs, allowed] = await Promise.all([getPublishedJobs(), presetJobIds(preset)]);
  const counts: Record<PhaseFilter, number> = { all: 0, open: 0, upcoming: 0, progress: 0, closed: 0 };
  for (const job of jobs) {
    if (allowed && !allowed.has(job.id)) continue;
    counts.all += 1;
    counts[tabOf(job)] += 1;
  }
  return counts;
}
