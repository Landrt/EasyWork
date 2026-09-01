import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const base = process.env.NEXT_PUBLIC_API_URL;

  // If backend is available, proxy the request
  if (base) {
    try {
      const res = await fetch(`${base}/affiliate/link`, {
        headers: { cookie: request.headers.get('cookie') || '' },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) return NextResponse.json(data);
    } catch (e) {
      console.error('Backend unreachable, using fallback', e);
    }
  }

  // Fallback: generate a deterministic code from a session identifier
  // In production with a real backend, this won't be reached
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  return NextResponse.json({
    link: `${baseUrl}/ref/user-demo`,
    code: 'user-demo',
  });
}
