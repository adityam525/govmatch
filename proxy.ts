import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/admin-token';
import { csrfProblem } from '@/lib/csrf';

// Admin-only APIs: every method requires the admin session.
const ADMIN_ONLY_PREFIXES = ['/api/admin-users', '/api/admin/'];

// Shared content/lookup APIs: GET stays public (public pages read them);
// every write method requires the admin session.
const WRITE_PROTECTED_PREFIXES = [
  '/api/notifications',
  '/api/notification-links',
  '/api/notification-faqs',
  '/api/important-dates',
  '/api/exam-levels',
  '/api/application-fees',
  '/api/posts',
  '/api/organizations',
  '/api/categories',
  '/api/qualification-categories',
  '/api/qualifications',
  '/api/branches',
  '/api/roles',
  '/api/states',
  '/api/admit-cards',
  '/api/results',
  '/api/answer-keys',
  '/api/documents',
];

// Pages that should never appear in search results.
const PRIVATE_PREFIXES = ['/admin', '/dashboard', '/profile', '/applications', '/saved-jobs', '/mock-tests', '/exam', '/login', '/signup'];

// Pages that need a logged-in user. This only checks for a session cookie; APIs check the real session.
const USER_PREFIXES = ['/dashboard', '/profile', '/applications', '/saved-jobs', '/mock-tests', '/exam/run'];
const hasSession = (request: NextRequest) =>
  request.cookies.getAll().some((c) => /^(__Secure-)?(authjs|next-auth)\.session-token/.test(c.name));

async function guard(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const isRead = request.method === 'GET' || request.method === 'HEAD';
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  // Admin pages (login page excluded)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!(await verifyAdminSessionToken(token))) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  // Admin-only APIs
  if (ADMIN_ONLY_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (!(await verifyAdminSessionToken(token))) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Shared APIs: reads public, writes admin-only
  if (!isRead && WRITE_PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (!(await verifyAdminSessionToken(token))) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname.startsWith('/api/')) {
    const problem = csrfProblem({
      method: request.method,
      path: pathname,
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
      secFetchSite: request.headers.get('sec-fetch-site'),
      host: request.headers.get('host'),
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    });
    if (problem) return NextResponse.json({ message: problem }, { status: 403 });
  }

  if (USER_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/')) && !hasSession(request)) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname + request.nextUrl.search);
    const redirect = NextResponse.redirect(url);
    redirect.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return redirect;
  }

  const response = await guard(request);

  if (PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  } else if (pathname === '/jobs' && [...searchParams.keys()].length > 0) {
    response.headers.set('X-Robots-Tag', 'noindex, follow');
  }
  return response;
}

export const config = {
  matcher: [
    '/admin/:path*', '/api/:path*', '/dashboard/:path*', '/profile/:path*', '/applications/:path*',
    '/saved-jobs/:path*', '/mock-tests/:path*', '/exam/:path*', '/login', '/signup', '/jobs',
  ],
};
