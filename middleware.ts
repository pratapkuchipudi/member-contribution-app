import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { parseSession, SESSION_COOKIE } from '@/lib/session';

export function middleware(req: NextRequest) {
  const session = parseSession(req.cookies.get(SESSION_COOKIE)?.value);
  const isLogin = req.nextUrl.pathname === '/login';

  if (!session && !isLogin) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (session && isLogin) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
