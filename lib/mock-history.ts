import { prisma } from '@/lib/prisma';
import type { HistoryItem, SectionResult } from '@/lib/mock-analytics';

export interface RunningItem { id: string; testId: string; title: string; expiresAt: string; expired: boolean }

// A user's submitted attempts (newest 100) and the ones still open. An open attempt whose time has
// run out is listed as running with expired set: opening it submits it and shows the result.
export async function loadMockHistory(userId: string): Promise<{ history: HistoryItem[]; running: RunningItem[] }> {
  const rows = await prisma.mockAttempt.findMany({
    where: { userId },
    orderBy: { startedAt: 'desc' },
    take: 100,
    select: { id: true, testId: true, startedAt: true, expiresAt: true, submittedAt: true, result: true, test: { select: { title: true } } },
  });

  const history: HistoryItem[] = [];
  const running: RunningItem[] = [];
  const now = Date.now();

  for (const row of rows) {
    const title = row.test?.title ?? 'Mock test';
    const r = row.result as Record<string, any> | null;
    if (row.submittedAt && r && typeof r.score === 'number' && typeof r.maxScore === 'number') {
      history.push({
        id: row.id, testId: row.testId, title,
        startedAt: row.startedAt.toISOString(), submittedAt: row.submittedAt.toISOString(),
        score: r.score, maxScore: r.maxScore, correct: r.correct ?? 0, wrong: r.wrong ?? 0, unattempted: r.unattempted ?? 0,
        accuracy: typeof r.accuracy === 'number' ? r.accuracy : null,
        sections: Array.isArray(r.sections) ? (r.sections as SectionResult[]) : [],
      });
    } else if (!row.submittedAt) {
      running.push({ id: row.id, testId: row.testId, title, expiresAt: row.expiresAt.toISOString(), expired: row.expiresAt.getTime() <= now });
    }
  }
  return { history, running };
}
