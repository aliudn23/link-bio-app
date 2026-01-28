import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that require authentication
const protectedPaths = ['/dashboard'];

// Paths that should redirect to dashboard if user is already authenticated
const authPaths = ['/login', '/register', '/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Debug: Log all cookies
  console.log('Middleware - All cookies:', request.cookies.getAll());
  
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  // Check if the current path is protected
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  // Check if the current path is an auth path
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));

  // If it's an auth path and user has token, redirect to dashboard
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If it's a protected path and no token, redirect to login
  console.log('Middleware - Path:', pathname);
  console.log('Middleware - Token from cookie:', request.cookies.get('token')?.value?.substring(0, 20) + '...');
  console.log('Middleware - Token from header:', request.headers.get('authorization')?.substring(0, 30) + '...');
  console.log('Middleware - Is protected path:', isProtectedPath);
  console.log('Middleware - Has token:', !!token);
  
  if (isProtectedPath && !token) {
    console.log('Middleware - Redirecting to login');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

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