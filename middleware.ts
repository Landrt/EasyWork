import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const ref = request.nextUrl.searchParams.get('ref');

  if (ref) {
    // Stocker le code partenaire pendant 60 jours
    response.cookies.set('easywork_ref', ref.trim().toLowerCase(), {
      maxAge: 60 * 24 * 60 * 60, // 60 jours
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}