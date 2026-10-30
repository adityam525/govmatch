export interface SectionResult { name: string; score: number; maxScore: number; correct: number; wrong: number; unattempted: number }
export interface HistoryItem {
  id: string; testId: string; title: string; startedAt: string; submittedAt: string;
  score: number; maxScore: number; correct: number; wrong: number; unattempted: number;
  accuracy: number | null; sections: SectionResult[];
}
export interface SectionStat {
  name: string; attempts: number; accuracy: number | null; scorePercent: number | null;
  correct: number; wrong: number; unattempted: number;
}
export interface Summary {
  count: number; averagePercent: number; bestPercent: number; latestPercent: number;
  averageAccuracy: number | null;
  /** Latest score minus the average of the earlier ones, in percentage points. */
  change: number | null;
  trend: { id: string; title: string; percent: number; date: string }[];
  sections: SectionStat[]; strongest: SectionStat | null; weakest: SectionStat | null;
}

const r1 = (n: number) => Math.round(n * 10) / 10;
export const percentOf = (score: number, max: number) => (max > 0 ? r1((score / max) * 100) : 0);
export const minutesTaken = (startedAt: string, submittedAt: string) =>
  Math.max(0, Math.round((new Date(submittedAt).getTime() - new Date(startedAt).getTime()) / 60000));

export function summarize(items: HistoryItem[]): Summary | null {
  if (items.length === 0) return null;
  const sorted = [...items].sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
  const percents = sorted.map((i) => percentOf(i.score, i.maxScore));
  const accs = sorted.map((i) => i.accuracy).filter((a): a is number => a !== null);
  const latest = percents[percents.length - 1];
  const earlier = percents.slice(0, -1);

  const by = new Map<string, SectionStat & { score: number; max: number }>();
  for (const item of sorted) {
    for (const s of item.sections) {
      const key = s.name.trim().toLowerCase();
      const cur = by.get(key) ?? { name: s.name, attempts: 0, accuracy: null, scorePercent: null, correct: 0, wrong: 0, unattempted: 0, score: 0, max: 0 };
      cur.attempts++; cur.correct += s.correct; cur.wrong += s.wrong; cur.unattempted += s.unattempted;
      cur.score += s.score; cur.max += s.maxScore;
      by.set(key, cur);
    }
  }
  const sections: SectionStat[] = [...by.values()].map((s) => ({
    name: s.name, attempts: s.attempts, correct: s.correct, wrong: s.wrong, unattempted: s.unattempted,
    accuracy: s.correct + s.wrong > 0 ? Math.round((s.correct / (s.correct + s.wrong)) * 100) : null,
    scorePercent: s.max > 0 ? percentOf(s.score, s.max) : null,
  }));
  const ranked = sections.filter((s) => s.accuracy !== null).sort((a, b) => (b.accuracy as number) - (a.accuracy as number));

  return {
    count: sorted.length,
    averagePercent: r1(percents.reduce((a, b) => a + b, 0) / percents.length),
    bestPercent: Math.max(...percents),
    latestPercent: latest,
    averageAccuracy: accs.length ? Math.round(accs.reduce((a, b) => a + b, 0) / accs.length) : null,
    change: earlier.length ? r1(latest - earlier.reduce((a, b) => a + b, 0) / earlier.length) : null,
    trend: sorted.slice(-10).map((i, k, arr) => ({ id: i.id, title: i.title, percent: percents[sorted.length - arr.length + k], date: i.submittedAt })),
    sections,
    strongest: ranked.length >= 2 ? ranked[0] : null,
    weakest: ranked.length >= 2 ? ranked[ranked.length - 1] : null,
  };
}
