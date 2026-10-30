import { prisma } from '@/lib/prisma';

// A test may link to one job and, optionally, one exam level that belongs to that job.
export async function resolveLink(body: Record<string, any>): Promise<{ error: string } | { notificationId: string | null; examLevelId: string | null }> {
  const notificationId = typeof body.notificationId === 'string' && body.notificationId ? body.notificationId : null;
  const examLevelId = typeof body.examLevelId === 'string' && body.examLevelId ? body.examLevelId : null;
  if (!notificationId) return { notificationId: null, examLevelId: null };
  if (!(await prisma.notification.findUnique({ where: { id: notificationId }, select: { id: true } }))) return { error: 'That job no longer exists.' };
  if (examLevelId && !(await prisma.examLevel.findFirst({ where: { id: examLevelId, notificationId }, select: { id: true } }))) {
    return { error: 'That exam level does not belong to the chosen job.' };
  }
  return { notificationId, examLevelId };
}
