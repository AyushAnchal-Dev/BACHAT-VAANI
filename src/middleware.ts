import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from './lib/jwt';

// In-memory rate limiting configuration
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const LIMIT = 100; // 100 requests per minute
const WINDOW_MS = 60 * 1000; // 1 minute window

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const client = rateLimitMap.get(ip);

  if (!client) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return false;
  }

  if (now > client.resetTime) {
    client.count = 1;
    client.resetTime = now + WINDOW_MS;
    return false;
  }

  client.count += 1;
  return client.count > LIMIT;
}

export async function middleware(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';

  // Apply rate limiting
  if (isRateLimited(ip)) {
    return new NextResponse('Too Many Requests. Please slow down and try again later.', {
      status: 429,
      headers: { 'Retry-After': '60', 'Content-Type': 'text/plain' },
    });
  }
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Verify session token
  let user = null;
  if (token) {
    user = await verifyJWT(token);
  }

  // Define route checks
  const isAuthRoute = pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register');
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAdminRoute = pathname.startsWith('/admin');

  // Guard Admin routes
  if (isAdminRoute) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      return NextResponse.redirect(url);
    }
    if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // Guard Dashboard routes
  if (isDashboardRoute) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users trying to access login/register
  if (isAuthRoute) {
    if (user) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // Redirect landing page to dashboard for active sessions
  if (pathname === '/') {
    if (user) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  const response = NextResponse.next();

  // Strict CSP and Security Headers for Platform Compliance
  const csp = "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: https://* blob:; connect-src 'self' https://* http://localhost:* ws://localhost:* wss://localhost:* blob:; media-src 'self' blob: data:;";
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/auth/login', '/auth/register', '/'],
};
