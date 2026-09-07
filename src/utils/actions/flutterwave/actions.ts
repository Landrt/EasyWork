'use server';

import { createClient, createServiceClient } from '@/utils/supabase/server';
import { Subscription, SubscriptionPlanType, hasActiveProAccess } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { flutterwave } from '@/utils/flutterwave/client';

export interface FlutterwavePaymentOptions {
  planType?: 'sprint' | 'monthly' | 'lifetime';
  amount?: number;
  currency?: string;
  redirectPath?: string;
}

const PLAN_CONFIG = {
  sprint: {
    price: 13,
    title: 'EasyWork - Sprint Candidature (14 jours)',
    description: '14 jours de CVs ciblés illimités, diagnostic ATS & 1 lettre offerte (Paiement unique)',
    durationDays: 14,
  },
  monthly: {
    price: 22,
    title: 'EasyWork - Recherche Active',
    description: 'Abonnement mensuel sans engagement, lettres de motivation illimitées & suivi',
    durationDays: 30,
  },
  lifetime: {
    price: 69,
    title: 'EasyWork - Accès Fondateur à Vie',
    description: 'Accès illimité permanent à vie, sans aucun renouvellement (Édition limitée)',
    durationDays: 365 * 100, // Permanent
  },
};

/**
 * Creates a Flutterwave hosted checkout session for the selected tier
 */
export async function createFlutterwavePaymentSession(options?: FlutterwavePaymentOptions) {
  let user: { id: string; email?: string; user_metadata?: { full_name?: string } } = {
    id: 'demo-user-1',
    email: 'alexandre.martin@example.com',
    user_metadata: { full_name: 'Alexandre Martin' },
  };

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      user = data.user;
    }
  } catch {
    // Fallback mode local demo
  }

  const planType = options?.planType || 'sprint';
  const config = PLAN_CONFIG[planType] || PLAN_CONFIG.sprint;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const txRef = `easywork-${planType}-${user.id}-${Date.now()}`;
  const amount = options?.amount || config.price;
  const currency = options?.currency || 'EUR';
  const redirectUrl = `${siteUrl}/subscription/checkout-return`;

  const session = await flutterwave.initializePayment({
    tx_ref: txRef,
    amount,
    currency,
    redirect_url: redirectUrl,
    customer: {
      email: user.email || 'user@easywork.com',
      name: user.user_metadata?.full_name || 'Membre EasyWork',
    },
    customizations: {
      title: config.title,
      description: config.description,
      logo: `${siteUrl}/easywork-logo.png`,
    },
    meta: {
      userId: user.id,
      plan: planType,
    },
  });

  return {
    checkoutUrl: session.link,
    tx_ref: session.tx_ref,
    plan: planType,
  };
}

/**
 * Verifies Flutterwave payment and updates user subscription
 */
export async function verifyFlutterwavePayment(transactionId: string, txRef?: string) {
  console.log(`\n💳 Verifying Flutterwave payment for transaction: ${transactionId}`);
  
  const verification = await flutterwave.verifyTransaction(transactionId);
  if (!verification || verification.status !== 'successful') {
    throw new Error('Le paiement Flutterwave n\'a pas pu être validé.');
  }

  let userId = 'demo-user-1';
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      userId = user.id;
    }
  } catch {
    // Local demo
  }

  // Detect plan type from meta or txRef or amount
  let planType: SubscriptionPlanType = 'sprint';
  const metaPlan = verification.meta?.plan as SubscriptionPlanType | undefined;
  if (metaPlan && ['sprint', 'monthly', 'lifetime'].includes(metaPlan)) {
    planType = metaPlan;
  } else if (txRef?.includes('monthly') || verification.amount === 22) {
    planType = 'monthly';
  } else if (txRef?.includes('lifetime') || verification.amount === 69) {
    planType = 'lifetime';
  }

  const periodEnd = new Date();
  if (planType === 'sprint') {
    periodEnd.setDate(periodEnd.getDate() + 14);
  } else if (planType === 'monthly') {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  } else if (planType === 'lifetime') {
    periodEnd.setFullYear(periodEnd.getFullYear() + 80); // Permanent
  }

  const subscriptionData: Partial<Subscription> = {
    user_id: userId,
    flutterwave_transaction_id: String(verification.id),
    flutterwave_tx_ref: txRef || verification.tx_ref,
    flutterwave_customer_id: String(verification.customer.id),
    subscription_plan: planType,
    subscription_status: 'active',
    current_period_end: periodEnd.toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const serviceClient = await createServiceClient();
    await serviceClient.from('subscriptions').upsert(
      {
        ...subscriptionData,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
  } catch (error) {
    console.warn('Could not persist subscription to Supabase, continuing in local mode:', error);
  }

  revalidatePath('/');
  revalidatePath('/subscription');
  revalidatePath('/settings');

  return {
    success: true,
    plan: planType,
    transactionId: verification.id,
  };
}

/**
 * Retrieves the current subscription plan for the authenticated user
 */
export async function getSubscriptionPlan(returnId?: boolean) {
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
        const resolvedPlan = isActive ? data.subscription_plan : 'free';
        
        if (returnId) {
          return { plan: resolvedPlan, id: user.id };
        }
        return resolvedPlan;
      }
    }
  } catch {
    // Fallback mode local
  }

  if (returnId) {
    return { plan: 'sprint', id: 'demo-user-1' };
  }
  return 'sprint';
}

/**
 * Checks detailed subscription details
 */
export async function checkSubscriptionPlan() {
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
        };
      }
    }
  } catch {
    // Fallback mode local
  }

  return {
    plan: 'sprint',
    status: 'active',
    currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
  };
}

/**
 * Helper to get subscription status for subscription page
 */
export async function getSubscriptionStatus() {
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
          flutterwave_transaction_id,
          flutterwave_tx_ref
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data) {
        return data;
      }
    }
  } catch {
    // Fallback mode local
  }

  // Demo active 14-day Sprint
  const demoPeriodEnd = new Date(Date.now() + 12 * 24 * 60 * 60 * 1000); // 12 days left
  return {
    subscription_plan: 'sprint' as SubscriptionPlanType,
    subscription_status: 'active',
    current_period_end: demoPeriodEnd.toISOString(),
    trial_end: null,
    flutterwave_transaction_id: 'flw-demo-active',
    flutterwave_tx_ref: 'easywork-sprint-demo',
  };
}

/**
 * Cancels active recurring subscription (for monthly)
 */
export async function cancelSubscription() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase
        .from('subscriptions')
        .update({ subscription_status: 'canceled' })
        .eq('user_id', user.id);
    }
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
  }

  revalidatePath('/');
  revalidatePath('/subscription');
  revalidatePath('/settings');
}

/**
 * Toggles subscription plan for testing/development
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
      .upsert({
        user_id: userId,
        subscription_plan: newPlan,
        subscription_status: 'active',
        current_period_end: newPlan === 'free' ? null : periodEnd.toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });
  } catch (error) {
    console.warn('Could not persist toggle to Supabase, continuing in local mode:', error);
  }

  revalidatePath('/');
  revalidatePath('/subscription');
  revalidatePath('/settings');
  return newPlan;
}
