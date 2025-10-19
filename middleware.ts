import { NextResponse, type NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { createFirebaseAdminApp } from '@/firebase/server-admin-init';

async function verifySessionCookie(cookie: string) {
  try {
    const app = createFirebaseAdminApp();
    const auth = getAuth(app);
    await auth.verifySessionCookie(cookie, true);
    return true;
  } catch (error) {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('__session')?.value;

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');
  
  if (!sessionCookie) {
    if (isAuthPage) {
      return NextResponse.next();
    }
    // Redirect to login if no session cookie and not on auth page.
    // For now we allow access to all pages, will implement protected routes later.
    return NextResponse.next();
  }

  const isValidSession = await verifySessionCookie(sessionCookie);

  if (!isValidSession) {
     if (isAuthPage) {
      return NextResponse.next();
    }
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('__session');
    return response;
  }
  
  if (isAuthPage) {
    // If user is logged in, redirect from auth pages to home.
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
