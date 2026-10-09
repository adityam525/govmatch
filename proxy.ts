import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

function isAdmin(request: NextRequest): boolean {
  const session = request.cookies.get('admin_session');
  return !!session && !!process.env.ADMIN_PASSWORD && session.value === process.env.ADMIN_PASSWORD;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const isRead = method === 'GET' || method === 'HEAD';

  // Admin pages (login page excluded)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!isAdmin(request)) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  // Admin-only APIs
  if (ADMIN_ONLY_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (!isAdmin(request)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Shared APIs: reads public, writes admin-only
  if (!isRead && WRITE_PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (!isAdmin(request)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
