import { NextRequest, NextResponse } from 'next/server';
import { DEV_BYPASS_COOKIE_NAME } from '@/utils/dev-bypass-constants';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const enableParam = searchParams.get('enable');
  const toggleParam = searchParams.get('toggle');
  const redirectUrl = searchParams.get('redirect') || '/';

  const currentCookie = request.cookies.get(DEV_BYPASS_COOKIE_NAME)?.value;
  let newStatus = true;

  if (toggleParam !== null) {
    newStatus = currentCookie !== 'true';
  } else if (enableParam !== null) {
    newStatus = enableParam === '1' || enableParam === 'true';
  }

  const response = NextResponse.redirect(new URL(redirectUrl, request.url));
  response.cookies.set(DEV_BYPASS_COOKIE_NAME, newStatus ? 'true' : 'false', {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}
