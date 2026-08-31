import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const base = process.env.NEXT_PUBLIC_API_URL;

  if (base) {
    try {
      const res = await fetch(`${base}/affiliate/stats`, {
        headers: { cookie: request.headers.get('cookie') || '' },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) return NextResponse.json(data);
    } catch (e) {
      console.error('Backend unreachable for affiliate stats', e);
    }
  }

  // Fallback: empty stats (no mocked data)
  return NextResponse.json({
    availableBalance: 0,
    clicks30d: 0,
    signups30d: 0,
    conversionRate: 0,
    commissions: [],
  });
}
