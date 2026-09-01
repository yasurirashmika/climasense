import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth0 } from './lib/auth0';

/**
 * Middleware that protects routes requiring authentication.
 *
 * How it works:
 * 1. Runs before every matched request (see `config.matcher` below)
 * 2. Checks for a valid Auth0 session cookie
 * 3. If no session → redirects to /api/auth/login
 * 4. If session exists → allows the request through
 *
 * Why middleware instead of checking in each page?
 * - Centralized auth logic (DRY)
 * - Runs at the edge (fast)
 * - User never sees a flash of protected content
 */
export async function middleware(request: NextRequest) {
  // Let Auth0 handle its own routes (/auth/*)
  const authRes = await auth0.middleware(request);

  // For protected routes, check session
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    try {
      const session = await auth0.getSession(request);

      // If no session and trying to access protected routes
      if (!session) {
        const loginUrl = new URL('/auth/login', request.url);
        // After login, redirect back to where they were trying to go
        loginUrl.searchParams.set('returnTo', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch (err) {
      // If error fetching session, redirect to login
      const loginUrl = new URL('/auth/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return authRes;
}

/**
 * Only apply this middleware to these routes.
 *
 * We protect /dashboard (the main app) but NOT:
 * - / (landing page — public)
 * - /api/auth/* (auth endpoints must be accessible)
 * - /_next/* (static assets)
 */
export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
};
