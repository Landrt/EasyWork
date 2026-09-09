import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/server';
import { paddle } from '@/utils/paddle/client';
import { SubscriptionPlanType } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const headersList = await headers();
    const signature = headersList.get('paddle-signature');
    const secretKey = process.env.PADDLE_WEBHOOK_SECRET_KEY;

    const rawBody = await req.text();

    // En production, vérification cryptographique obligatoire de la signature Paddle
    const isProd = process.env.NODE_ENV === 'production';
    if (isProd || (secretKey && signature)) {
      const isValid = paddle.verifyWebhookSignature(rawBody, signature, secretKey);
      if (!isValid) {
        console.warn('❌ Webhook Paddle : Signature invalide ou non authentique.');
        return NextResponse.json({ error: 'Signature webhook Paddle invalide' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event_type;
    const eventData = payload.data;

    console.log(`🔔 Webhook Paddle reçu: [${eventType}] - ID: ${payload.event_id}`);

    const supabase = await createServiceClient();

    // =========================================================================
    // 1. ÉVÉNEMENT : TRANSACTION COMPLÉTÉE (transaction.completed / transaction.paid)
    // =========================================================================
    if (eventType === 'transaction.completed' || eventType === 'transaction.paid') {
      const transactionId = String(eventData.id);
      const customData = eventData.custom_data || {};
      const customerEmail = eventData.customer?.email;

      let userId = customData.userId;

      // Si l'ID utilisateur n'est pas dans custom_data, rechercher par email
      if (!userId && customerEmail) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('email', customerEmail)
          .maybeSingle();

        if (profile?.user_id) {
          userId = profile.user_id;
        }
      }

      if (userId) {
        // Déterminer la formule
        let planType: SubscriptionPlanType = 'sprint';
        const metaPlan = customData.plan as SubscriptionPlanType | undefined;
        const totalAmount = parseFloat(eventData.details?.totals?.total || '0');

        if (metaPlan && ['sprint', 'monthly', 'lifetime'].includes(metaPlan)) {
          planType = metaPlan;
        } else if (totalAmount >= 60) {
          planType = 'lifetime';
        } else if (totalAmount >= 20) {
          planType = 'monthly';
        }

        const periodEnd = new Date();
        if (planType === 'sprint') {
          periodEnd.setDate(periodEnd.getDate() + 14);
        } else if (planType === 'monthly') {
          periodEnd.setMonth(periodEnd.getMonth() + 1);
        } else if (planType === 'lifetime') {
          periodEnd.setFullYear(periodEnd.getFullYear() + 80);
        }

        const subscriptionId = eventData.subscription_id ? String(eventData.subscription_id) : null;
        const customerId = eventData.customer_id ? String(eventData.customer_id) : null;

        // Mise à jour de l'abonnement
        await supabase.from('subscriptions').upsert(
          {
            user_id: userId,
            paddle_transaction_id: transactionId,
            paddle_subscription_id: subscriptionId,
            paddle_customer_id: customerId,
            payment_provider: 'paddle',
            subscription_plan: planType,
            subscription_status: 'active',
            current_period_end: periodEnd.toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

        // Enregistrement dans la table payments
        try {
          await supabase.from('payments').upsert(
            {
              user_id: userId,
              tx_ref: transactionId,
              paddle_transaction_id: transactionId,
              payment_provider: 'paddle',
              plan: planType,
              amount: totalAmount,
              currency: eventData.details?.totals?.currency_code || 'EUR',
              status: 'successful',
              payment_method: 'Paddle MoR',
              created_at: new Date().toISOString(),
            },
            { onConflict: 'tx_ref' }
          );
        } catch (payErr) {
          console.warn('[WEBHOOK PADDLE] Notice table payments:', payErr);
        }

        console.log(`✅ Accès utilisateur ${userId} activé pour la formule [${planType}] via Paddle.`);

        // =====================================================================
        // 2. ATTRIBUTION DE LA COMMISSION PARTENAIRE (30% Récurrent)
        // =====================================================================
        try {
          let referralCode = customData.referralCode;

          if (!referralCode) {
            const { data: userProf } = await supabase
              .from('profiles')
              .select('referred_by')
              .eq('user_id', userId)
              .maybeSingle();
            referralCode = userProf?.referred_by;
          }

          if (referralCode && totalAmount > 0) {
            const { data: affiliate } = await supabase
              .from('affiliates')
              .select('*')
              .eq('code', referralCode)
              .maybeSingle();

            if (affiliate && affiliate.status === 'active') {
              const commissionRate = Number(affiliate.commission_rate) || 30.0;
              const commissionAmount = Math.round((totalAmount * (commissionRate / 100)) * 100) / 100;

              // Mettre à jour les totaux affilié
              await supabase
                .from('affiliates')
                .update({
                  total_conversions: (affiliate.total_conversions || 0) + 1,
                  total_earned: Number((Number(affiliate.total_earned || 0) + commissionAmount).toFixed(2)),
                  pending_payout: Number((Number(affiliate.pending_payout || 0) + commissionAmount).toFixed(2)),
                  updated_at: new Date().toISOString(),
                })
                .eq('id', affiliate.id);

              console.log(`🎁 Commission Partenaire de ${commissionAmount}€ (30%) attribuée à ${affiliate.email} (${referralCode}) pour la transaction Paddle ${transactionId}`);
            }
          }
        } catch (affErr) {
          console.error('[WEBHOOK PADDLE] Erreur calcul commission partenaire:', affErr);
        }
      }
    }

    // =========================================================================
    // 3. ÉVÉNEMENT : ABONNEMENT CRÉÉ OU MIS À JOUR (subscription.created / subscription.updated)
    // =========================================================================
    if (eventType === 'subscription.created' || eventType === 'subscription.updated' || eventType === 'subscription.activated') {
      const subscriptionId = String(eventData.id);
      const customData = eventData.custom_data || {};
      const status = eventData.status; // 'active', 'past_due', 'paused', etc.

      let userId = customData.userId;
      if (!userId && eventData.customer_id) {
        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('paddle_customer_id', String(eventData.customer_id))
          .maybeSingle();
        userId = existingSub?.user_id;
      }

      if (userId) {
        const periodEnd = eventData.current_billing_period?.ends_at 
          ? new Date(eventData.current_billing_period.ends_at)
          : new Date(Date.now() + 30 * 24 * 3600 * 1000);

        await supabase
          .from('subscriptions')
          .update({
            paddle_subscription_id: subscriptionId,
            subscription_status: status === 'active' ? 'active' : status,
            current_period_end: periodEnd.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        console.log(`🔄 Abonnement Paddle ${subscriptionId} synchronisé pour l'utilisateur ${userId} (statut: ${status}).`);
      }
    }

    // =========================================================================
    // 4. ÉVÉNEMENT : ABONNEMENT RÉSILIÉ (subscription.canceled)
    // =========================================================================
    if (eventType === 'subscription.canceled') {
      const subscriptionId = String(eventData.id);

      await supabase
        .from('subscriptions')
        .update({
          subscription_status: 'canceled',
          updated_at: new Date().toISOString(),
        })
        .eq('paddle_subscription_id', subscriptionId);

      console.log(`🛑 Abonnement Paddle ${subscriptionId} résilié (accès maintenu jusqu'à l'échéance de la période payée).`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('❌ Erreur générale Webhook Paddle:', error);
    return NextResponse.json({ error: error?.message || 'Erreur interne du serveur' }, { status: 500 });
  }
}
