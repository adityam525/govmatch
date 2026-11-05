const SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);

export interface CsrfInput {
  method: string;
  path: string;
  origin: string | null;
  referer: string | null;
  secFetchSite: string | null;
  host: string | null;
  siteUrl?: string;
}

// Returns a reason to refuse the request, or null when it may continue.
export function csrfProblem(i: CsrfInput): string | null {
  if (SAFE.has(i.method.toUpperCase())) return null;
  if (i.path.startsWith('/api/auth/')) return null;

  const allowed = new Set<string>();
  if (i.host) allowed.add(i.host.toLowerCase());
  if (i.siteUrl) {
    try { allowed.add(new URL(i.siteUrl).host.toLowerCase()); } catch { /* ignore a bad setting */ }
  }

  const source = i.origin ?? i.referer;
  if (source) {
    let host: string;
    try { host = new URL(source).host.toLowerCase(); } catch { return 'Request origin is not valid.'; }
    return allowed.has(host) ? null : 'Cross-site request blocked.';
  }
  if (i.secFetchSite === 'cross-site') return 'Cross-site request blocked.';
  return null;
}
