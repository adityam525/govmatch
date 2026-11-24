import { prisma } from '@/lib/prisma';
import { clientIp } from '@/lib/rate-limit';

// Records an admin action. It must never break the request, so errors are swallowed.
export async function audit(action: string, opts: { request?: Request; adminId?: string | null; adminEmail?: string | null; detail?: string } = {}) {
  try {
    await prisma.auditLog.create({
      data: { action: action.slice(0, 100), adminId: opts.adminId ?? null, adminEmail: opts.adminEmail ?? null, detail: opts.detail?.slice(0, 500) ?? null, ip: opts.request ? clientIp(opts.request) : null },
    });
  } catch (error) { console.error('Audit log failed:', error); }
}
