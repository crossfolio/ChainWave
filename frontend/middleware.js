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

  // 如果用戶未登入且不在 worldcoin 頁面，則重定向至 /worldcoin
  if (!isAuthenticated) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 已登入，允許訪問
  return NextResponse.next();
}
