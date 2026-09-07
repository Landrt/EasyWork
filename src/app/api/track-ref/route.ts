import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const referrer = searchParams.get('referrer') || req.headers.get('referer') || '';
  const source = searchParams.get('source') || '';

  if (!code) {
    return NextResponse.json({ error: 'Code manquant' }, { status: 400 });
  }

  try {
    const supabase = await createServiceClient();

    // 1. Retrouver l'affilié actif
    const { data: partner } = await supabase
      .from('affiliates')
      .select('id, total_clicks, is_active')
      .ilike('code', code.trim())
      .maybeSingle();

    if (partner && partner.is_active !== false) {
      // 2. Enregistrer le clic dans affiliate_clicks
      await supabase.from('affiliate_clicks').insert({
        affiliate_id: partner.id,
        referrer,
        source,
      });

      // 3. Incrémenter total_clicks sur affiliates
      await supabase
        .from('affiliates')
        .update({
          total_clicks: (partner.total_clicks || 0) + 1,
        })
        .eq('id', partner.id);

      return NextResponse.json({ tracked: true, partnerId: partner.id });
    }

    return NextResponse.json({ tracked: false, reason: 'Partenaire introuvable ou inactif' });
  } catch (error) {
    console.error('Erreur lors du tracking de clic:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

