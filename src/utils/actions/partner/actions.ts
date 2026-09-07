'use server';

import { createClient, createServiceClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { flutterwave } from '@/utils/flutterwave/client';

export interface PartnerCommissionItem {
  id: string;
  orderAmount: number;
  commissionAmount: number;
  currency: string;
  status: 'pending' | 'available' | 'paid' | 'canceled';
  releaseAt: string;
  createdAt: string;
  details?: Record<string, any>;
}

export interface PartnerPayoutItem {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'successful' | 'failed';
  reference: string;
  payoutMethod: string;
  createdAt: string;
}

export interface PartnerDashboardData {
  isPartner: boolean;
  partner?: {
    id: string;
    code: string;
    name: string;
    email: string;
    commissionRate: number;
    availableBalance: number;
    pendingAmount: number;
    pendingDebt: number;
    totalEarned: number;
    totalClicks: number;
    totalSignups: number;
    totalConversions: number;
    nextReleaseDate: string | null;
    codeModified: boolean;
    isActive: boolean;
    payoutMethod: 'mobile_money' | 'bank';
    payoutDetails: Record<string, string>;
    clickTrend: 'up' | 'down' | 'stable';
    clicks7d: number;
    clicksPrev7d: number;
    clickToSignupRate: number;
    clickToPaidRate: number;
    commissions: PartnerCommissionItem[];
    payouts: PartnerPayoutItem[];
  };
  userName?: string;
  userEmail?: string;
}

const RESERVED_SLUGS = [
  'admin', 'api', 'dashboard', 'partner', 'auth', 'login', 
  'signup', 'support', 'easywork', 'checkout', 'pricing', 
  'settings', 'resumes', 'profile', 'affiliate', 'webhook'
];

/**
 * 1. ÉVALUATION PARESSEUSE DES COMMISSIONS (Lazy Evaluation sans cron)
 * Libère les commissions dont les 30 jours de gel sont expirés,
 * apure la dette éventuelle ('pending_debt') et crédite le solde disponible.
 */
async function processMaturedCommissions(partnerId: string, supabase: any) {
  try {
    const now = new Date().toISOString();

    // 1. Trouver les commissions pending arrivées à échéance
    const { data: maturedCommissions } = await supabase
      .from('affiliate_commissions')
      .select('id, commission_amount')
      .eq('affiliate_id', partnerId)
      .eq('status', 'pending')
      .lte('release_at', now);

    if (maturedCommissions && maturedCommissions.length > 0) {
      const matureIds = maturedCommissions.map((c: any) => c.id);
      const totalMatured = maturedCommissions.reduce((sum: number, c: any) => sum + Number(c.commission_amount), 0);

      // Basculer le statut en 'available'
      await supabase
        .from('affiliate_commissions')
        .update({ status: 'available' })
        .in('id', matureIds);

      // Récupérer le partenaire pour gérer la dette éventuelle
      const { data: partner } = await supabase
        .from('affiliates')
        .select('available_balance, pending_debt')
        .eq('id', partnerId)
        .single();

      if (partner) {
        let currentBalance = Number(partner.available_balance || 0);
        let debt = Number(partner.pending_debt || 0);
        let remainingAfterDebt = totalMatured;

        if (debt > 0) {
          if (remainingAfterDebt >= debt) {
            remainingAfterDebt -= debt;
            debt = 0;
          } else {
            debt -= remainingAfterDebt;
            remainingAfterDebt = 0;
          }
        }

        const newBalance = currentBalance + remainingAfterDebt;

        await supabase
          .from('affiliates')
          .update({
            available_balance: newBalance,
            pending_debt: debt,
            updated_at: new Date().toISOString(),
          })
          .eq('id', partnerId);

        console.log(`⏱️ Lazy Evaluation : ${totalMatured} USD débloqués pour le partenaire ${partnerId}. Nouveau solde : ${newBalance} USD, dette restante : ${debt} USD`);
      }
    }
  } catch (err) {
    console.error('Erreur lors de la lazy evaluation des commissions:', err);
  }
}

/**
 * 2. RÉCUPÉRATION DU DASHBOARD PARTENAIRE (avec calculs de conversion & tendance 7j)
 */
export async function getPartnerData(): Promise<PartnerDashboardData> {
  try {
    const cookieStore = await cookies();
    const isDemoActive = cookieStore.get('partner_demo_active')?.value === 'true';
    const demoSlug = cookieStore.get('partner_demo_slug')?.value || 'arthur';

    const supabase = await createClient();
    let user = (await supabase.auth.getUser()).data?.user;

    if (!user && process.env.NODE_ENV !== 'production') {
      user = { id: 'demo-user-1', email: 'alexandre.martin@example.com' } as any;
    }

    if (!user) {
      // Mode secours / non connecté
      return {
        isPartner: false,
        userName: 'Visiteur',
        userEmail: '',
      };
    }

    // Si on est en dev local avec cookie demo actif
    if (isDemoActive && process.env.NODE_ENV !== 'production') {
      return {
        isPartner: true,
        partner: {
          id: 'demo-affiliate-1',
          code: demoSlug,
          name: 'Alexandre Martin',
          email: 'alexandre.martin@example.com',
          commissionRate: 30.0,
          availableBalance: 28.50,
          pendingAmount: 42.00,
          pendingDebt: 0.0,
          totalEarned: 147.60,
          totalClicks: 142,
          totalSignups: 19,
          totalConversions: 6,
          nextReleaseDate: 'Dans 8 jours',
          codeModified: false,
          isActive: true,
          payoutMethod: 'mobile_money',
          payoutDetails: { provider: 'Orange Money', phone: '+225 07 12 34 56 78', account_name: 'Alexandre Martin' },
          clickTrend: 'up',
          clicks7d: 84,
          clicksPrev7d: 58,
          clickToSignupRate: 13.4,
          clickToPaidRate: 4.2,
          commissions: [
            {
              id: 'c-1',
              orderAmount: 22.00,
              commissionAmount: 6.60,
              currency: 'USD',
              status: 'available',
              releaseAt: 'Débloqué',
              createdAt: '01 sept. 2026',
              details: { plan_name: 'Mensuel (22$)' },
            },
            {
              id: 'c-2',
              orderAmount: 69.00,
              commissionAmount: 20.70,
              currency: 'USD',
              status: 'pending',
              releaseAt: 'Dans 8 jours',
              createdAt: '05 sept. 2026',
              details: { plan_name: 'Fondateur (69$)' },
            },
            {
              id: 'c-3',
              orderAmount: 13.00,
              commissionAmount: 3.90,
              currency: 'USD',
              status: 'pending',
              releaseAt: 'Dans 12 jours',
              createdAt: '06 sept. 2026',
              details: { plan_name: 'Sprint 14j (13$)' },
            },
          ],
          payouts: [
            {
              id: 'p-1',
              amount: 25.00,
              currency: 'USD',
              status: 'successful',
              reference: 'EASY-TRF-98213',
              payoutMethod: 'mobile_money',
              createdAt: '28 août 2026',
            },
          ],
        },
      };
    }

    const serviceClient = await createServiceClient();

    // 1. Rechercher si l'utilisateur possède déjà un compte partenaire
    const { data: partner } = await serviceClient
      .from('affiliates')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!partner) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('user_id', user.id)
        .maybeSingle();

      const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || user.email?.split('@')[0] || 'Candidat';

      return {
        isPartner: false,
        userName: fullName,
        userEmail: user.email || '',
      };
    }

    // 2. Exécuter l'évaluation paresseuse (gel 30j expiré)
    await processMaturedCommissions(partner.id, serviceClient);

    // Recharger les données fraîches du partenaire
    const { data: freshPartner } = await serviceClient
      .from('affiliates')
      .select('*')
      .eq('id', partner.id)
      .single();

    const partnerRecord = freshPartner || partner;

    // 3. Charger l'historique des commissions
    const { data: commissions } = await serviceClient
      .from('affiliate_commissions')
      .select('*')
      .eq('affiliate_id', partnerRecord.id)
      .order('created_at', { ascending: false });

    // 4. Charger l'historique des retraits
    const { data: payouts } = await serviceClient
      .from('affiliate_payouts')
      .select('*')
      .eq('affiliate_id', partnerRecord.id)
      .order('created_at', { ascending: false });

    // 5. Calcul des métriques de clics et tendance 7 jours
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const { data: clicks7dRes } = await serviceClient
      .from('affiliate_clicks')
      .select('id', { count: 'exact', head: true })
      .eq('affiliate_id', partnerRecord.id)
      .gte('created_at', sevenDaysAgo.toISOString());

    const { data: clicksPrev7dRes } = await serviceClient
      .from('affiliate_clicks')
      .select('id', { count: 'exact', head: true })
      .eq('affiliate_id', partnerRecord.id)
      .gte('created_at', fourteenDaysAgo.toISOString())
      .lt('created_at', sevenDaysAgo.toISOString());

    const clicks7d = clicks7dRes ? (clicks7dRes as any).length || 0 : 0;
    const clicksPrev7d = clicksPrev7dRes ? (clicksPrev7dRes as any).length || 0 : 0;

    let clickTrend: 'up' | 'down' | 'stable' = 'stable';
    if (clicks7d > clicksPrev7d) clickTrend = 'up';
    else if (clicks7d < clicksPrev7d) clickTrend = 'down';

    // Commissions en attente (pending) et date de déblocage la plus proche
    const pendingComms = (commissions || []).filter((c: any) => c.status === 'pending');
    const pendingAmount = pendingComms.reduce((sum: number, c: any) => sum + Number(c.commission_amount), 0);
    
    let nextReleaseDate: string | null = null;
    if (pendingComms.length > 0) {
      const sortedDates = pendingComms
        .map((c: any) => new Date(c.release_at).getTime())
        .sort((a: number, b: number) => a - b);
      nextReleaseDate = new Date(sortedDates[0]).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    const totalClicks = Number(partnerRecord.total_clicks || 0);
    const totalSignups = Number(partnerRecord.total_signups || 0);
    const totalConversions = Number(partnerRecord.total_conversions || 0);

    const clickToSignupRate = totalClicks > 0 ? parseFloat(((totalSignups / totalClicks) * 100).toFixed(1)) : 0;
    const clickToPaidRate = totalClicks > 0 ? parseFloat(((totalConversions / totalClicks) * 100).toFixed(1)) : 0;

    const formattedCommissions: PartnerCommissionItem[] = (commissions || []).map((c: any) => ({
      id: c.id,
      orderAmount: Number(c.order_amount),
      commissionAmount: Number(c.commission_amount),
      currency: c.currency || 'USD',
      status: c.status,
      releaseAt: new Date(c.release_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
      createdAt: new Date(c.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
      details: c.details,
    }));

    const formattedPayouts: PartnerPayoutItem[] = (payouts || []).map((p: any) => ({
      id: p.id,
      amount: Number(p.amount),
      currency: p.currency || 'USD',
      status: p.status,
      reference: p.flutterwave_reference,
      payoutMethod: p.payout_method,
      createdAt: new Date(p.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
    }));

    return {
      isPartner: true,
      partner: {
        id: partnerRecord.id,
        code: partnerRecord.code,
        name: partnerRecord.name,
        email: partnerRecord.email,
        commissionRate: Number(partnerRecord.commission_rate || 30.0),
        availableBalance: Number(partnerRecord.available_balance || 0),
        pendingAmount,
        pendingDebt: Number(partnerRecord.pending_debt || 0),
        totalEarned: Number(partnerRecord.total_earned || 0),
        totalClicks,
        totalSignups,
        totalConversions,
        nextReleaseDate,
        codeModified: !!partnerRecord.code_modified,
        isActive: partnerRecord.is_active !== false,
        payoutMethod: partnerRecord.payout_method || 'mobile_money',
        payoutDetails: partnerRecord.payout_details || {},
        clickTrend,
        clicks7d,
        clicksPrev7d,
        clickToSignupRate,
        clickToPaidRate,
        commissions: formattedCommissions,
        payouts: formattedPayouts,
      },
    };
  } catch (err) {
    console.error('Erreur getPartnerData:', err);
    return {
      isPartner: false,
    };
  }
}

/**
 * 3. ONBOARDING 1-CLIC : ACTIVATION DU LIEN PARTENAIRE
 * Génère instantanément un slug propre (ex: arthur, arthur-2 en cas de collision).
 */
export async function activatePartnerAccount() {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient();
    let user = (await supabase.auth.getUser()).data?.user;

    if (!user && process.env.NODE_ENV !== 'production') {
      user = { id: 'demo-user-1', email: 'alexandre.martin@example.com' } as any;
    }

    if (!user) {
      throw new Error('Vous devez être connecté pour activer votre lien partenaire.');
    }

    let chosenSlug = 'arthur';

    try {
      const serviceClient = await createServiceClient();

      // Vérifier si un compte existe déjà
      const { data: existing } = await serviceClient
        .from('affiliates')
        .select('id, code')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        if (process.env.NODE_ENV !== 'production') {
          cookieStore.set('partner_demo_active', 'true', { path: '/' });
          cookieStore.set('partner_demo_slug', existing.code, { path: '/' });
        }
        revalidatePath('/partner');
        return { success: true, code: existing.code };
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('user_id', user.id)
        .maybeSingle();

      // Générer le slug de base à partir du prénom ou de l'email
      const rawName = profile?.first_name || user.email?.split('@')[0] || 'partenaire';
      let baseSlug = rawName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // retirer les accents
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      if (!baseSlug || baseSlug.length < 3 || RESERVED_SLUGS.includes(baseSlug)) {
        baseSlug = `partenaire-${Math.floor(100 + Math.random() * 900)}`;
      }

      chosenSlug = baseSlug;
      let collisionCount = 1;
      let isAvailable = false;

      while (!isAvailable) {
        const { data: found } = await serviceClient
          .from('affiliates')
          .select('id')
          .ilike('code', chosenSlug)
          .maybeSingle();

        if (!found) {
          isAvailable = true;
        } else {
          collisionCount++;
          chosenSlug = `${baseSlug}-${collisionCount}`;
        }
      }

      const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || rawName;

      // Créer le compte partenaire
      const { data: newPartner, error } = await serviceClient
        .from('affiliates')
        .insert({
          user_id: user.id,
          code: chosenSlug,
          name: fullName,
          email: user.email || '',
          commission_rate: 30.0,
          available_balance: 0.0,
          pending_debt: 0.0,
          total_clicks: 0,
          total_signups: 0,
          total_conversions: 0,
          total_earned: 0.0,
          is_active: true,
          code_modified: false,
          payout_method: 'mobile_money',
          payout_details: {},
        })
        .select('code')
        .single();

      if (error) {
        throw error;
      }

      if (process.env.NODE_ENV !== 'production') {
        cookieStore.set('partner_demo_active', 'true', { path: '/' });
        cookieStore.set('partner_demo_slug', newPartner?.code || chosenSlug, { path: '/' });
      }

      revalidatePath('/partner');
      return { success: true, code: newPartner?.code || chosenSlug };
    } catch (dbErr: any) {
      console.warn('Mode démo / Supabase inaccessible lors de activatePartnerAccount:', dbErr.message);
      if (process.env.NODE_ENV !== 'production') {
        cookieStore.set('partner_demo_active', 'true', { path: '/' });
        cookieStore.set('partner_demo_slug', chosenSlug, { path: '/' });
        revalidatePath('/partner');
        return { success: true, code: chosenSlug };
      }
      throw dbErr;
    }
  } catch (err: any) {
    console.error('Erreur activatePartnerAccount:', err);
    throw new Error(err.message || 'Impossible d\'activer votre compte partenaire.');
  }
}

/**
 * 4. PERSONNALISATION UNIQUE DU CODE PARTENAIRE
 */
export async function updatePartnerCustomCode(newCode: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Authentification requise.');

    const serviceClient = await createServiceClient();

    const { data: partner } = await serviceClient
      .from('affiliates')
      .select('id, code_modified')
      .eq('user_id', user.id)
      .single();

    if (!partner) throw new Error('Compte partenaire introuvable.');

    if (partner.code_modified) {
      throw new Error('Vous avez déjà modifié votre code personnalisé une fois.');
    }

    const cleanCode = newCode.trim().toLowerCase();

    // Validations strictes
    if (cleanCode.length < 3 || cleanCode.length > 30) {
      throw new Error('Le code doit comporter entre 3 et 30 caractères.');
    }

    if (!/^[a-z0-9-]+$/.test(cleanCode)) {
      throw new Error('Le code ne peut contenir que des lettres minuscules, des chiffres et des tirets.');
    }

    if (RESERVED_SLUGS.includes(cleanCode)) {
      throw new Error(`Le code "${cleanCode}" est réservé par EasyWork et ne peut pas être choisi.`);
    }

    // Vérifier unicité
    const { data: conflict } = await serviceClient
      .from('affiliates')
      .select('id')
      .ilike('code', cleanCode)
      .neq('id', partner.id)
      .maybeSingle();

    if (conflict) {
      throw new Error('Ce code est déjà utilisé par un autre partenaire. Veuillez en choisir un autre.');
    }

    await serviceClient
      .from('affiliates')
      .update({
        code: cleanCode,
        code_modified: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', partner.id);

    if (process.env.NODE_ENV !== 'production') {
      const cookieStore = await cookies();
      cookieStore.set('partner_demo_slug', cleanCode, { path: '/' });
    }

    revalidatePath('/partner');
    return { success: true, code: cleanCode };
  } catch (err: any) {
    console.error('Erreur updatePartnerCustomCode:', err);
    if (process.env.NODE_ENV !== 'production') {
      const cookieStore = await cookies();
      cookieStore.set('partner_demo_slug', newCode.trim().toLowerCase(), { path: '/' });
      revalidatePath('/partner');
      return { success: true, code: newCode.trim().toLowerCase() };
    }
    throw new Error(err.message || 'Erreur lors de la modification du code.');
  }
}

export async function resetPartnerDemoState() {
  const cookieStore = await cookies();
  cookieStore.delete('partner_demo_active');
  cookieStore.delete('partner_demo_slug');
  revalidatePath('/partner');
  return { success: true };
}

/**
 * 5. ENREGISTREMENT DES COORDONNÉES DE PAIEMENT (Mobile Money / Banque)
 */
export async function savePayoutDetails(data: {
  payoutMethod: 'mobile_money' | 'bank';
  details: Record<string, string>;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Authentification requise.');

    const serviceClient = await createServiceClient();

    await serviceClient
      .from('affiliates')
      .update({
        payout_method: data.payoutMethod,
        payout_details: data.details,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    revalidatePath('/partner');
    return { success: true };
  } catch (err: any) {
    console.error('Erreur savePayoutDetails:', err);
    throw new Error(err.message || 'Erreur lors de l\'enregistrement des coordonnées.');
  }
}

/**
 * 6. DEMANDE DE RETRAIT (SEUIL MINIMAL 20$ & DÉDUCTION ATOMIQUE)
 */
export async function requestPayout(requestedAmount?: number) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Authentification requise.');

    const serviceClient = await createServiceClient();

    const { data: partner } = await serviceClient
      .from('affiliates')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!partner) throw new Error('Compte partenaire introuvable.');

    // Lazy evaluation préalable pour débloquer les commissions arrivées à échéance
    await processMaturedCommissions(partner.id, serviceClient);

    const { data: freshPartner } = await serviceClient
      .from('affiliates')
      .select('available_balance, payout_method, payout_details, is_active')
      .eq('id', partner.id)
      .single();

    if (freshPartner?.is_active === false) {
      throw new Error('Votre compte partenaire est actuellement suspendu. Veuillez contacter le support.');
    }

    const available = Number(freshPartner?.available_balance || 0);
    const amountToWithdraw = requestedAmount ? Math.min(requestedAmount, available) : available;

    // Seuil minimal imposé : 20 USD
    if (available < 20) {
      const missing = (20 - available).toFixed(2);
      throw new Error(`Le seuil minimal de retrait est de 20$. Il vous manque ${missing}$ pour effectuer un retrait.`);
    }

    if (amountToWithdraw < 20) {
      throw new Error('Le montant minimum d\'un retrait est fixé à 20$.');
    }

    // Vérifier les coordonnées de paiement
    const details = freshPartner?.payout_details || {};
    const accountNumber = details.account_number || details.phone_number;
    const accountBank = details.bank_code || details.network || 'MPS';

    if (!accountNumber) {
      throw new Error('Veuillez renseigner vos coordonnées de paiement (Mobile Money ou Compte Bancaire) avant de demander un retrait.');
    }

    // DÉDUCTION ATOMIQUE DU SOLDE : available_balance = available_balance - amountToWithdraw
    // Si available_balance < amountToWithdraw (tentative concurrente), l'update échoue
    const newBalance = available - amountToWithdraw;
    const { error: updateErr } = await serviceClient
      .from('affiliates')
      .update({
        available_balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', partner.id)
      .gte('available_balance', amountToWithdraw);

    if (updateErr) {
      throw new Error('Solde insuffisant ou demande concurrente détectée.');
    }

    // Enregistrement de la demande dans affiliate_payouts
    const transferRef = `easywork-payout-${partner.id.slice(0, 8)}-${Date.now()}`;
    const { data: payoutRecord, error: payoutInsertErr } = await serviceClient
      .from('affiliate_payouts')
      .insert({
        affiliate_id: partner.id,
        amount: amountToWithdraw,
        currency: 'USD',
        flutterwave_reference: transferRef,
        status: 'pending',
        payout_method: freshPartner?.payout_method || 'mobile_money',
        account_details: details,
      })
      .select('id')
      .single();

    if (payoutInsertErr) {
      // Recréditer le solde en cas d'erreur DB
      await serviceClient
        .from('affiliates')
        .update({ available_balance: available })
        .eq('id', partner.id);
      throw new Error('Erreur lors de la création de la demande de retrait.');
    }

    // APPEL À L'API FLUTTERWAVE TRANSFERS CÔTÉ SERVEUR
    try {
      const transferResponse = await flutterwave.initiateTransfer({
        account_bank: accountBank,
        account_number: accountNumber,
        amount: amountToWithdraw,
        narration: `Retrait Partenaire EasyWork (${partner.code})`,
        currency: 'USD',
        reference: transferRef,
      });

      if (transferResponse?.id) {
        await serviceClient
          .from('affiliate_payouts')
          .update({ flutterwave_transfer_id: String(transferResponse.id) })
          .eq('id', payoutRecord.id);
      }
    } catch (transferErr: any) {
      console.error('Échec Flutterwave Transfer API:', transferErr);
      // En cas de rejet immédiat de l'API Flutterwave, recréditer le solde du partenaire
      await serviceClient
        .from('affiliates')
        .update({ available_balance: available })
        .eq('id', partner.id);

      await serviceClient
        .from('affiliate_payouts')
        .update({ status: 'failed' })
        .eq('id', payoutRecord.id);

      throw new Error(transferErr.message || 'La passerelle de paiement a rejeté le virement. Vos fonds ont été recrédités sur votre solde.');
    }

    revalidatePath('/partner');
    return { success: true, amount: amountToWithdraw, reference: transferRef };
  } catch (err: any) {
    console.error('Erreur requestPayout:', err);
    throw new Error(err.message || 'Échec de la demande de retrait.');
  }
}

