import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host');

  // Skip API, static files, and Next.js internals
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/_next') || url.pathname.includes('.')) {
    return NextResponse.next();
  }

  // Very simple multi-tenant interceptor:
  // If the request isn't coming from localhost or Vexa.com,
  // we could potentially rewrite it or append the tenant info.
  // For now, we inject the domain into a custom header so the frontend can read it.
  
  const response = NextResponse.next();
  if (hostname) {
    response.headers.set('x-tenant-domain', hostname);
  }
  
  return response;
}
