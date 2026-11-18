import { cache } from 'react';
import { cookies, headers } from 'next/headers';
import { ADMIN_SESSION_COOKIE, verifyAdminToken } from '@/lib/admin-token';
import { audit } from '@/lib/audit';

// The admin id of the current request, or null. Cached per request, so a write is logged once.
const adminForRequest = cache(async (): Promise<string | null> => {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  const id = await verifyAdminToken(token);
  if (!id) return null;
  const write = (await headers()).get('x-admin-write');
  if (write) void audit('write', { adminId: id, detail: write });
  return id;
});

export const getAdminId = () => adminForRequest();

// True when the current request carries a valid, unexpired admin session.
export async function isAdminRequest(): Promise<boolean> {
  return (await adminForRequest()) !== null;
}
