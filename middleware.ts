import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Allowed domains that are NOT tenants (the main system)
  const isMainDomain = 
    hostname.includes('localhost') || 
    hostname.includes('127.0.0.1') ||
    hostname === 'nexoplay.com' ||
    hostname === 'www.nexoplay.com';

  // We extract the subdomain if it's not the main domain
  let tenantSubdomain = null;
  if (!isMainDomain) {
    // e.g. "cineplus.nexoplay.com" -> "cineplus"
    // Or if they use a custom domain "cineplus.com", we might need a different matching logic.
    // For now, we assume the first part of the host is the subdomain or the whole host is the tenant identifier.
    tenantSubdomain = hostname.split('.')[0];
  }

  // If there's a tenant, we can pass it to the frontend via a header
  const requestHeaders = new Headers(req.headers);
  if (tenantSubdomain) {
    requestHeaders.set('x-tenant-subdomain', tenantSubdomain);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
