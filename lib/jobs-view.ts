import {
  getPublishedJobs,
  getUpcomingExamRows,
  getAdmitCardRows,
  getResultRows,
  getAnswerKeyRows,
  type PublishedJob,
  type UpdateRow,
} from '@/lib/job-queries';
import { isLastDateToday } from '@/lib/job-today';
import { todayIST } from '@/lib/job-status';

export type PhaseTab = 'open' | 'upcoming' | 'progress' | 'closed';
export type PhaseFilter = PhaseTab | 'today' | 'all';
export type UpdatePreset = 'exams' | 'admit-cards' | 'results' | 'answer-keys';

// A preset (exams / admit cards / ...) and a tab combine: the preset picks the
// jobs, the tab narrows them by lifecycle phase.
export interface JobsView {
  tab: PhaseFilter;
  preset: UpdatePreset | null;
}

export const PHASE_TABS: { id: PhaseFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Applications Open' },
  { id: 'today', label: 'Last Date Today' },
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

const PHASE_ALIASES: Record<string, PhaseFilter> = {
  all: 'all',
  live: 'open',
  open: 'open',
  today: 'today',
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

function matchesTab(job: PublishedJob, tab: PhaseFilter, today: Date): boolean {
  if (tab === 'all') return true;
  if (tab === 'today') return isLastDateToday(job, today);
  return tabOf(job) === tab;
}

async function presetJobIds(preset: UpdatePreset | null): Promise<Set<string> | null> {
  if (!preset) return null;
  const rows = await PRESET_ROWS[preset](Infinity);
  return new Set(rows.map((row) => row.id));
}

// Ids of the published jobs in the selected view. With a preset active the ids
// come back in the preset's own order (soonest exam first, newest result first...).
export async function getViewIds(view: JobsView): Promise<string[]> {
  const today = todayIST();
  const [jobs, rows] = await Promise.all([
    getPublishedJobs(),
    view.preset ? PRESET_ROWS[view.preset](Infinity) : Promise.resolve(null),
  ]);
  const order = rows ? new Map(rows.map((row, index) => [row.id, index] as const)) : null;

  const ids = jobs
    .filter((job) => (!order || order.has(job.id)) && matchesTab(job, view.tab, today))
    .map((job) => job.id);

  if (order) ids.sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0));
  return ids;
}

export function sortByIdOrder<T extends { id: string }>(items: T[], ids: string[]): T[] {
  const position = new Map(ids.map((id, index) => [id, index] as const));
  return [...items].sort((a, b) => (position.get(a.id) ?? ids.length) - (position.get(b.id) ?? ids.length));
}

// Tab counts, computed inside the active preset (if any).
export async function getPhaseCounts(preset: UpdatePreset | null = null): Promise<Record<PhaseFilter, number>> {
  const today = todayIST();
  const [jobs, allowed] = await Promise.all([getPublishedJobs(), presetJobIds(preset)]);
  const counts: Record<PhaseFilter, number> = { all: 0, open: 0, today: 0, upcoming: 0, progress: 0, closed: 0 };
  for (const job of jobs) {
    if (allowed && !allowed.has(job.id)) continue;
    counts.all += 1;
    counts[tabOf(job)] += 1;
    if (isLastDateToday(job, today)) counts.today += 1;
  }
  return counts;
}
