import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Protected routes proxy (Next.js 16 convention).
 * Stub implementation — passes all requests through.
 * Client-side AuthGuard handles the actual redirect to /login.
 */

const PROTECTED_PATHS = ['/studio'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path),
  );

  if (isProtected) {
    // Client-side AuthGuard handles redirect to /login
    // Server-side session checks can be added here in the future
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/studio/:path*'],
};
