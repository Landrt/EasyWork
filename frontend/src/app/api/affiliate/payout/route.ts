import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const base = process.env.NEXT_PUBLIC_API_URL;

  if (base) {
    try {
      const body = await request.json().catch(() => ({}));
      const res = await fetch(`${base}/affiliate/payout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: request.headers.get('cookie') || '',
        },
        body: JSON.stringify(body),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) return NextResponse.json(data);
      return NextResponse.json(data, { status: res.status });
    } catch (e) {
      console.error('Backend unreachable for payout', e);
    }
  }

  return NextResponse.json(
    { error: 'Backend non connecté. Configurez NEXT_PUBLIC_API_URL dans .env.local.' },
    { status: 503 }
  );
}
