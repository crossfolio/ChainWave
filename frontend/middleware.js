import { NextResponse } from 'next/server';

export function middleware(req) {
  const isAuthenticated = req.cookies.get('isAuthenticated');
  const url = req.nextUrl.clone();

  if (
    url.pathname.startsWith('/img') ||
    url.pathname.startsWith('/favicon.ico') ||
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/static') ||
    url.pathname.startsWith('/api') ||
    url.pathname === '/login'
  ) {
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
