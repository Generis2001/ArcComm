import { NextRequest, NextResponse } from 'next/server';
import { verifyPrivyToken } from '@/lib/privy/server';

const PUBLIC_PATHS = ['/', '/auth', '/api/auth/privy-webhook'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname)) return NextResponse.next();

  const token =
    req.cookies.get('privy-token')?.value ??
    req.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/', req.url));
  }

  try {
    await verifyPrivyToken(token);
    return NextResponse.next();
  } catch {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const res = NextResponse.redirect(new URL('/', req.url));
    res.cookies.delete('privy-token');
    return res;
  }
}

export const config = {
  matcher: ['/app/:path*', '/api/creators/:path*', '/api/payments/:path*',
            '/api/content/:path*', '/api/subscriptions/:path*',
            '/api/payouts/:path*', '/api/cron/:path*'],
};
