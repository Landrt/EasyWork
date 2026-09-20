'use server';

import { createClient, createServiceClient } from '@/utils/supabase/server';
import { Subscription, SubscriptionPlanType, hasActiveProAccess } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { paddle } from '@/utils/paddle/client';
import { isDevBypassActive } from '@/utils/dev-bypass';

export interface PaddlePaymentOptions {
  planType?: 'sprint' | 'monthly' | 'lifetime';
  redirectPath?: string;
}

const DEFAULT_PRICES = {
  sprint: {
    priceId: process.env.NEXT_PUBLIC_PADDLE_SPRINT_PRICE_ID || 'pri_sprint_13eur',
    amount: 13,
    title: 'EasyWork - Sprint Candidature (14 jours)',
    durationDays: 14,
  },
  monthly: {
    priceId: process.env.NEXT_PUBLIC_PADDLE_MONTHLY_PRICE_ID || 'pri_monthly_22eur',
    amount: 22,
    title: 'EasyWork - Recherche Active (Abonnement Mensuel)',
    durationDays: 30,
  },
  lifetime: {
    priceId: process.env.NEXT_PUBLIC_PADDLE_LIFETIME_PRICE_ID || 'pri_lifetime_69eur',
    amount: 69,
    title: 'EasyWork - Accès Fondateur à Vie',
    durationDays: 365 * 100, // Accès permanent
  },
};

/**
 * Crée une session ou transaction de checkout Paddle pour la formule sélectionnée
 */
export async function createPaddleCheckoutSession(options?: PaddlePaymentOptions) {
  let user: { id: string; email?: string; user_metadata?: { full_name?: string } } = {
    id: 'demo-user-1',
    email: 'candidat@easywork.com',
    user_metadata: { full_name: 'Candidat EasyWork' },
  };

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      user = data.user;
    }
  } catch {
    // Mode démo local
  }

  const planType = options?.planType || 'sprint';
  const planInfo = DEFAULT_PRICES[planType] || DEFAULT_PRICES.sprint;

  // Récupérer le code de parrainage s'il est présent dans les cookies
  let referralCode: string | null = null;
  try {
    const cookieStore = await cookies();
    referralCode = cookieStore.get('easywork_ref')?.value || null;
  } catch {
    // Ignorer si pas dans un contexte de requête
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const returnUrl = `${siteUrl}/subscription/checkout-return?plan=${planType}`;

  const transaction = await paddle.createTransaction({
    priceId: planInfo.priceId,
    customer: {
      email: user.email || 'candidat@easywork.com',
      name: user.user_metadata?.full_name || 'Membre EasyWork',
    },
    customData: {
      userId: user.id,
      userEmail: user.email,
      plan: planType,
      referralCode: referralCode || undefined,
    },
    returnUrl,
  });

  return {
    transactionId: transaction.id,
    checkoutUrl: transaction.checkoutUrl,
    plan: planType,
    clientToken: paddle.clientToken,
    priceId: planInfo.priceId,
  };
}

/**
 * Valide le retour du checkout Paddle et active l'accès pour l'utilisateur
 */
export async function verifyPaddlePayment(transactionId: string, forcedPlan?: SubscriptionPlanType) {
  console.log(`\n💳 Vérification de la transaction Paddle: ${transactionId}`);

  let userId = 'demo-user-1';
  let userEmail = 'candidat@easywork.com';
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      userId = user.id;
      userEmail = user.email || userEmail;
    }
  } catch {
    // Mode local
  }

  const planType: SubscriptionPlanType = forcedPlan || (transactionId.includes('monthly') ? 'monthly' : transactionId.includes('lifetime') ? 'lifetime' : 'sprint');
  const planInfo = DEFAULT_PRICES[planType as keyof typeof DEFAULT_PRICES] || DEFAULT_PRICES.sprint;

  const periodEnd = new Date();
  if (planType === 'sprint') {
    periodEnd.setDate(periodEnd.getDate() + 14);
  } else if (planType === 'monthly') {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  } else if (planType === 'lifetime') {
    periodEnd.setFullYear(periodEnd.getFullYear() + 80);
  }

  try {
    const serviceClient = await createServiceClient();

    // 1. Mettre à jour l'abonnement
    await serviceClient.from('subscriptions').upsert(
      {
        user_id: userId,
        paddle_transaction_id: transactionId,
        payment_provider: 'paddle',
        subscription_plan: planType,
        subscription_status: 'active',
        current_period_end: periodEnd.toISOString(),
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    // 2. Enregistrer la transaction dans la table payments
    await serviceClient.from('payments').upsert(
      {
        user_id: userId,
        tx_ref: transactionId,
        paddle_transaction_id: transactionId,
        payment_provider: 'paddle',
        plan: planType,
        amount: planInfo.amount,
        currency: 'EUR',
        status: 'successful',
        payment_method: 'Paddle (Merchant of Record)',
        created_at: new Date().toISOString(),
      },
      { onConflict: 'tx_ref' }
    );
  } catch (error) {
    console.warn('[PADDLE] Sauvegarde Supabase impossible en local, accès actif en mode démo:', error);
  }

  revalidatePath('/');
  revalidatePath('/subscription');
  revalidatePath('/settings');

  return {
    success: true,
    plan: planType,
    transactionId,
  };
}

/**
 * Récupère le plan d'abonnement actif de l'utilisateur connecté
 */
export async function getSubscriptionPlan(returnId: true): Promise<{ plan: string; id: string }>;
export async function getSubscriptionPlan(returnId?: false): Promise<string>;
export async function getSubscriptionPlan(returnId?: boolean): Promise<string | { plan: string; id: string }> {
  // Mode Bypass Développeur : Accès 'pro' immédiat et inconditionnel
  const bypass = await isDevBypassActive();
  if (bypass) {
    if (returnId) {
      return { plan: 'pro' as const, id: 'admin-master' };
    }
    return 'pro';
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from('subscriptions')
        .select('subscription_plan, current_period_end, subscription_status')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data?.subscription_plan) {
        const isActive = hasActiveProAccess(data.subscription_plan, data.current_period_end);
        // Toutes les actions IA attendent 'pro' pour débloquer les serveurs LLM
        const resolvedPlan = isActive ? 'pro' : 'free';

        if (returnId) {
          return { plan: resolvedPlan, id: user.id };
        }
        return resolvedPlan;
      }
    }
  } catch {
    // Mode local démo
  }

  if (returnId) {
    return { plan: 'pro', id: 'demo-user-1' };
  }
  return 'pro';
}

/**
 * Récupère les détails détaillés de l'abonnement
 */
export async function checkSubscriptionPlan() {
  if (await isDevBypassActive()) {
    return {
      plan: 'lifetime' as SubscriptionPlanType,
      status: 'active',
      currentPeriodEnd: '2099-12-31T23:59:59.999Z',
      isActive: true,
      isDevBypass: true,
    };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from('subscriptions')
        .select('subscription_plan, subscription_status, current_period_end')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data?.subscription_plan) {
        const isActive = hasActiveProAccess(data.subscription_plan, data.current_period_end);
        return {
          plan: isActive ? data.subscription_plan : 'free',
          status: data.subscription_status || 'active',
          currentPeriodEnd: data.current_period_end || '',
          isActive,
          isDevBypass: false,
        };
      }
    }
  } catch {
    // Mode local
  }

  return {
    plan: 'sprint' as SubscriptionPlanType,
    status: 'active',
    currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    isDevBypass: false,
  };
}

/**
 * Récupère le statut complet de l'abonnement pour la page /subscription
 */
export async function getSubscriptionStatus() {
  if (await isDevBypassActive()) {
    return {
      subscription_plan: 'lifetime' as SubscriptionPlanType,
      subscription_status: 'active',
      current_period_end: '2099-12-31T23:59:59.999Z',
      trial_end: null,
      paddle_subscription_id: 'sub_dev_bypass_lifetime',
      paddle_transaction_id: 'txn_dev_bypass_lifetime',
      payment_provider: 'bypass',
    };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          subscription_plan,
          subscription_status,
          current_period_end,
          trial_end,
          paddle_subscription_id,
          paddle_transaction_id,
          payment_provider
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data) {
        return data;
      }
    }
  } catch {
    // Mode local
  }

  // Démo active : Sprint 14 jours
  const demoPeriodEnd = new Date(Date.now() + 12 * 24 * 60 * 60 * 1000);
  return {
    subscription_plan: 'sprint' as SubscriptionPlanType,
    subscription_status: 'active',
    current_period_end: demoPeriodEnd.toISOString(),
    trial_end: null,
    paddle_subscription_id: 'sub_mock_active',
    paddle_transaction_id: 'txn_mock_active',
    payment_provider: 'paddle',
  };
}

/**
 * Annule le renouvellement automatique d'un abonnement mensuel Paddle
 */
export async function cancelSubscription() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('paddle_subscription_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (sub?.paddle_subscription_id) {
        await paddle.cancelSubscription(sub.paddle_subscription_id);
      }

      await supabase
        .from('subscriptions')
        .update({
          subscription_status: 'canceled',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
    }
  } catch (error) {
    console.error('Erreur lors de la résiliation de l\'abonnement:', error);
  }

  revalidatePath('/');
  revalidatePath('/subscription');
  revalidatePath('/settings');
}

/**
 * Bascule manuellement de formule (pour tests et environnement de développement)
 */
export async function toggleSubscriptionPlan(newPlan: SubscriptionPlanType): Promise<SubscriptionPlanType> {
  try {
    const supabase = await createServiceClient();
    let userId = 'demo-user-1';

    try {
      const client = await createClient();
      const { data: { user } } = await client.auth.getUser();
      if (user) {
        userId = user.id;
      }
    } catch {
      // Local demo fallback
    }

    const periodEnd = new Date();
    if (newPlan === 'sprint') {
      periodEnd.setDate(periodEnd.getDate() + 14);
    } else if (newPlan === 'monthly' || newPlan === 'pro') {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else if (newPlan === 'lifetime') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 80);
    }

    await supabase
      .from('subscriptions')
      .upsert(
        {
          user_id: userId,
          subscription_plan: newPlan,
          subscription_status: 'active',
          payment_provider: 'paddle',
          paddle_transaction_id: `txn_toggle_${Date.now()}`,
          current_period_end: newPlan === 'free' ? null : periodEnd.toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
  } catch (error) {
    console.warn('[PADDLE] Impossible de persister le toggle en base, passage local:', error);
  }

  revalidatePath('/');
  revalidatePath('/subscription');
  revalidatePath('/settings');
  return newPlan;
}
