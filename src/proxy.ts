import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Protected routes proxy (Next.js 16 convention).
 * Stub implementation — passes all requests through.
 * Replace with real auth checks once Firebase Auth is integrated.
 */

const PROTECTED_PATHS = ['/dashboard', '/studio'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path),
  );

  if (isProtected) {
    // TODO: Check for auth session / Firebase token
    // const token = request.cookies.get('session')?.value;
    // if (!token) {
    //   return NextResponse.redirect(new URL('/login', request.url));
    // }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/studio/:path*'],
};
