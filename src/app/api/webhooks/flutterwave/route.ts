import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/server';
import { flutterwave } from '@/utils/flutterwave/client';
import { SubscriptionPlanType } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const headersList = await headers();
    const signature = headersList.get('verif-hash');
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;

    // En production, le secret hash est obligatoire et doit strictement correspondre
    const isProd = process.env.NODE_ENV === 'production';
    if ((isProd && !secretHash) || (secretHash && signature !== secretHash)) {
      console.warn('❌ Flutterwave Webhook: Invalid or missing signature hash');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    const payload = await req.json();
    console.log('🔔 Flutterwave Webhook received:', payload.event);

    const supabase = await createServiceClient();

    // =========================================================================
    // 1. ÉVÉNEMENT : PAIEMENT RÉUSSI (charge.completed)
    // =========================================================================
    if (payload.event === 'charge.completed' && payload.data?.status === 'successful') {
      const transactionId = String(payload.data.id);
      const txRef = String(payload.data.tx_ref || '');

      // Vérifier la transaction sur les serveurs de Flutterwave (anti-spoofing)
      const verifiedData = await flutterwave.verifyTransaction(transactionId);
      
      if (verifiedData && verifiedData.status === 'successful') {
        const userId = payload.data.meta?.userId || payload.data.customer?.email;

        if (userId) {
          // A. Déterminer la formule souscrite
          let planType: SubscriptionPlanType = 'sprint';
          const metaPlan = (payload.data.meta?.plan || verifiedData.meta?.plan) as SubscriptionPlanType | undefined;
          
          if (metaPlan && ['sprint', 'monthly', 'lifetime'].includes(metaPlan)) {
            planType = metaPlan;
          } else if (txRef.includes('monthly') || verifiedData.amount === 22) {
            planType = 'monthly';
          } else if (txRef.includes('lifetime') || verifiedData.amount === 69) {
            planType = 'lifetime';
          }

          const periodEnd = new Date();
          if (planType === 'sprint') {
            periodEnd.setDate(periodEnd.getDate() + 14);
          } else if (planType === 'monthly') {
            periodEnd.setMonth(periodEnd.getMonth() + 1);
          } else if (planType === 'lifetime') {
            periodEnd.setFullYear(periodEnd.getFullYear() + 80);
          }

          // Mise à jour de l'abonnement
          await supabase.from('subscriptions').upsert(
            {
              user_id: userId,
              flutterwave_transaction_id: transactionId,
              flutterwave_tx_ref: txRef,
              flutterwave_customer_id: String(payload.data.customer?.id || ''),
              subscription_plan: planType,
              subscription_status: 'active',
              current_period_end: periodEnd.toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          );

          // Enregistrement dans la table des paiements
          try {
            await supabase.from('payments').upsert(
              {
                user_id: userId,
                tx_ref: txRef,
                flw_id: transactionId,
                plan: planType,
                amount: verifiedData.amount,
                currency: verifiedData.currency || 'USD',
                status: 'successful',
                payment_method: payload.data.payment_type || 'Carte Bancaire',
                created_at: new Date().toISOString(),
              },
              { onConflict: 'tx_ref' }
            );
          } catch (payErr) {
            console.warn('[WEBHOOK] Notice on payments insert:', payErr);
          }

          console.log(`✅ Subscription upgraded to [${planType}] via Webhook for user ${userId}`);

          // ===================================================================
          // B. ATTRIBUTION COMMISSION PARTENAIRE (30% Récurrent à Vie)
          // ===================================================================
          try {
            // 1. Vérifier si le client payeur a un parrain enregistré
            const { data: profile } = await supabase
              .from('profiles')
              .select('referred_by_partner_id, email, user_id')
              .eq('user_id', userId)
              .maybeSingle();

            if (profile?.referred_by_partner_id) {
              // 2. Récupérer le partenaire
              const { data: partner } = await supabase
                .from('affiliates')
                .select('id, user_id, email, commission_rate, is_active, total_earned, total_conversions')
                .eq('id', profile.referred_by_partner_id)
                .maybeSingle();

              // Vérifications de sécurité : Partenaire actif + Bloquer l'auto-affiliation
              if (partner && partner.is_active !== false) {
                const isSelfReferral = 
                  (partner.user_id && partner.user_id === userId) ||
                  (partner.email && profile.email && partner.email.toLowerCase() === profile.email.toLowerCase());

                if (!isSelfReferral) {
                  // Idempotence stricte : Vérifier si cette transaction a déjà été commissionnée
                  const { data: existingComm } = await supabase
                    .from('affiliate_commissions')
                    .select('id')
                    .eq('flutterwave_tx_ref', txRef)
                    .maybeSingle();

                  if (!existingComm) {
                    const rate = Number(partner.commission_rate) || 30.0;
                    const commissionAmount = Math.round((verifiedData.amount * (rate / 100)) * 100) / 100;
                    const releaseDate = new Date();
                    releaseDate.setDate(releaseDate.getDate() + 30); // Période de gel de 30 jours façon AdSense

                    // Insertion de la commission avec statut 'pending' (gelée 30j)
                    await supabase.from('affiliate_commissions').insert({
                      affiliate_id: partner.id,
                      payer_user_id: userId,
                      flutterwave_tx_ref: txRef,
                      order_amount: verifiedData.amount,
                      commission_rate: rate,
                      commission_amount: commissionAmount,
                      currency: verifiedData.currency || 'USD',
                      status: 'pending',
                      release_at: releaseDate.toISOString(),
                      details: { plan: planType, payment_type: payload.data.payment_type },
                    });

                    // Mise à jour des compteurs globaux du partenaire (total_earned & total_conversions)
                    // Note : available_balance n'est PAS augmenté tant que le gel de 30j n'est pas expiré
                    await supabase
                      .from('affiliates')
                      .update({
                        total_earned: Number(partner.total_earned || 0) + commissionAmount,
                        total_conversions: Number(partner.total_conversions || 0) + 1,
                        updated_at: new Date().toISOString(),
                      })
                      .eq('id', partner.id);

                    console.log(`💰 Commission de ${commissionAmount} USD générée pour le partenaire ${partner.id} (Gelée 30j jusqu'au ${releaseDate.toLocaleDateString()})`);
                  } else {
                    console.log(`ℹ️ Commission déjà créditée pour txRef ${txRef} (Idempotence respectée)`);
                  }
                } else {
                  console.warn(`⚠️ Auto-affiliation bloquée : l'acheteur ${userId} est le partenaire`);
                }
              } else {
                console.log(`ℹ️ Partenaire inactif : aucune commission créditée.`);
              }
            }
          } catch (affErr) {
            console.error('❌ Erreur lors de l\'attribution de commission:', affErr);
          }
        }
      }
    }

    // =========================================================================
    // 2. ÉVÉNEMENT : REMBOURSEMENT / CHARGEBACK (charge.refunded)
    // =========================================================================
    if (
      payload.event === 'charge.refunded' || 
      payload.event === 'refund.completed' ||
      (payload.event === 'charge.completed' && payload.data?.status === 'refunded')
    ) {
      const txRef = String(payload.data?.tx_ref || payload.data?.transaction_ref || '');
      console.log(`⚠️ Traitement d'un remboursement pour la transaction : ${txRef}`);

      if (txRef) {
        // 1. Marquer le paiement comme remboursé dans la table payments
        try {
          await supabase
            .from('payments')
            .update({ status: 'refunded' })
            .eq('tx_ref', txRef);
        } catch {
          // Continuer
        }

        // 2. Retrouver la commission d'affiliation associée
        const { data: commission } = await supabase
          .from('affiliate_commissions')
          .select('*')
          .eq('flutterwave_tx_ref', txRef)
          .maybeSingle();

        if (commission && commission.status !== 'canceled') {
          const partnerId = commission.affiliate_id;
          const commAmount = Number(commission.commission_amount);

          const { data: partner } = await supabase
            .from('affiliates')
            .select('id, available_balance, pending_debt, total_earned')
            .eq('id', partnerId)
            .maybeSingle();

          if (partner) {
            if (commission.status === 'pending') {
              // CAS A : La commission est encore en période de gel (pending)
              // On la passe simplement à 'canceled'. Le solde disponible n'en souffre pas.
              await supabase
                .from('affiliate_commissions')
                .update({ 
                  status: 'canceled',
                  details: { ...(commission.details || {}), canceled_reason: 'client_refund' }
                })
                .eq('id', commission.id);

              await supabase
                .from('affiliates')
                .update({
                  total_earned: Math.max(0, Number(partner.total_earned) - commAmount),
                  updated_at: new Date().toISOString(),
                })
                .eq('id', partnerId);

              console.log(`🛡️ Commission pending ${commission.id} annulée suite au remboursement du client.`);
            } else if (commission.status === 'available' || commission.status === 'paid') {
              // CAS B : La commission a déjà été débloquée ou payée
              // Idempotence de l'ajustement de remboursement
              const refundRef = `refund_${txRef}`;
              const { data: existingAdj } = await supabase
                .from('affiliate_commissions')
                .select('id')
                .eq('flutterwave_tx_ref', refundRef)
                .maybeSingle();

              if (!existingAdj) {
                // Créer un enregistrement d'ajustement négatif dans l'historique
                await supabase.from('affiliate_commissions').insert({
                  affiliate_id: partnerId,
                  payer_user_id: commission.payer_user_id,
                  flutterwave_tx_ref: refundRef,
                  order_amount: commission.order_amount,
                  commission_rate: commission.commission_rate,
                  commission_amount: -commAmount,
                  currency: commission.currency || 'USD',
                  status: 'canceled',
                  release_at: new Date().toISOString(),
                  details: { reason: 'chargeback_adjustment', original_tx_ref: txRef },
                });

                // Décrémenter le solde disponible sans JAMAIS passer sous 0
                const currentBalance = Number(partner.available_balance || 0);
                let newBalance = 0;
                let newDebt = Number(partner.pending_debt || 0);

                if (currentBalance >= commAmount) {
                  newBalance = currentBalance - commAmount;
                } else {
                  // Solde insuffisant : on met le solde à 0 et la différence devient une dette en attente
                  newBalance = 0;
                  const deficit = commAmount - currentBalance;
                  newDebt += deficit;
                }

                await supabase
                  .from('affiliates')
                  .update({
                    available_balance: newBalance,
                    pending_debt: newDebt,
                    total_earned: Math.max(0, Number(partner.total_earned) - commAmount),
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', partnerId);

                console.log(`🛡️ Ajustement négatif appliqué au partenaire ${partnerId}. Solde: ${newBalance} USD, Dette restante: ${newDebt} USD`);
              }
            }
          }
        }
      }
    }

    // =========================================================================
    // 3. ÉVÉNEMENT : RÉSULTAT DE VIREMENT / RETRAIT (transfer.completed)
    // =========================================================================
    if (payload.event === 'transfer.completed') {
      const transferData = payload.data;
      const transferRef = String(transferData?.reference || '');
      const transferStatus = String(transferData?.status || '').toUpperCase();

      console.log(`💸 Virement Flutterwave ${transferRef} terminé avec le statut : ${transferStatus}`);

      if (transferRef) {
        const { data: payout } = await supabase
          .from('affiliate_payouts')
          .select('*')
          .eq('flutterwave_reference', transferRef)
          .maybeSingle();

        if (payout) {
          if (transferStatus === 'SUCCESSFUL') {
            await supabase
              .from('affiliate_payouts')
              .update({
                status: 'successful',
                flutterwave_transfer_id: String(transferData?.id || ''),
                updated_at: new Date().toISOString(),
              })
              .eq('id', payout.id);

            console.log(`✅ Retrait ${payout.id} confirmé et complété.`);
          } else if (transferStatus === 'FAILED' || transferStatus === 'REVERSED') {
            // ÉCHEC DU VIREMENT : On marque le payout en 'failed' ET on recrédite automatiquement le partenaire
            await supabase
              .from('affiliate_payouts')
              .update({
                status: 'failed',
                updated_at: new Date().toISOString(),
              })
              .eq('id', payout.id);

            const { data: partner } = await supabase
              .from('affiliates')
              .select('id, available_balance')
              .eq('id', payout.affiliate_id)
              .maybeSingle();

            if (partner) {
              const restoredBalance = Number(partner.available_balance || 0) + Number(payout.amount);
              await supabase
                .from('affiliates')
                .update({
                  available_balance: restoredBalance,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', partner.id);

              console.log(`↩️ Échec du virement Flutterwave. ${payout.amount} USD recrédités sur le solde du partenaire ${partner.id}.`);
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Flutterwave webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
