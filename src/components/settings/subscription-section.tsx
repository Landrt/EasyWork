'use client'

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Trophy, Clock, CheckCircle2, ShieldCheck, Award } from "lucide-react";
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PricingCard, type Plan } from '../pricing/pricing-card';
import { useRouter } from 'next/navigation';
import { getSubscriptionStatus, createPaddleCheckoutSession } from '@/utils/actions/paddle/actions';
import { hasActiveProAccess } from '@/lib/types';
import { toast } from 'sonner';

const plans: Plan[] = [
  {
    id: 'free',
    title: 'Découverte',
    subtitle: 'Pour démarrer, évaluer son CV et tester la plateforme',
    priceId: 'free',
    price: '0 €',
    period: 'gratuit',
    features: [
      '1 CV de base complet',
      'Templates standards (3 modèles)',
      'Score ATS global indicatif',
      'Export PDF standard',
      'QRO standard',
    ]
  },
  {
    id: 'sprint',
    title: 'Sprint Candidature',
    subtitle: 'Recherche ciblée, rapide et intensive sans abonnement',
    priceId: 'sprint',
    price: '13 €',
    period: 'paiement unique / 14 jours',
    badge: 'Recommandé · Sans abonnement',
    highlight: true,
    features: [
      'CVs adaptés illimités à plusieurs offres',
      'Analyse ATS détaillée par mot-clé (manquants, pertinence)',
      'Moteur d\'adaptation IA anti-hallucination',
      'Export PDF & DOCX professionnel',
      '1 lettre de motivation ciblée incluse',
      'Mode réflexion QRO avancé',
      'Expire automatiquement après 14 jours',
    ]
  },
  {
    id: 'monthly',
    title: 'Recherche Active',
    subtitle: 'Candidats en transition longue ou veille active',
    priceId: 'monthly',
    price: '22 €',
    period: '/mois sans engagement',
    badge: 'Flexible',
    features: [
      'Tout le contenu du Sprint Candidature',
      'Génération illimitée de lettres de motivation',
      'Cockpit & Suivi des candidatures intégré',
      'Exports illimités (PDF & DOCX)',
      'Accès continu et mises à jour prioritaires',
      'Résiliation en 1 clic sans préavis',
    ]
  },
  {
    id: 'lifetime',
    title: 'Accès Fondateur',
    subtitle: 'Early adopters & professionnels exigeants',
    priceId: 'lifetime',
    price: '69 €',
    period: 'paiement unique à vie',
    badge: 'Édition Limitée · 200 places',
    features: [
      'Accès permanent à vie à toutes les fonctionnalités',
      'Toutes les futures fonctionnalités incluses',
      'CVs, lettres & exports illimités à vie',
      'Quota limité (200 places réelles)',
      'Support prioritaire EasyWork',
      'Aucun renouvellement ni frais cachés',
    ]
  }
];

interface Profile {
  subscription_plan: string | null;
  subscription_status: string | null;
  current_period_end: string | null;
  trial_end: string | null;
  paddle_subscription_id?: string | null;
  paddle_transaction_id?: string | null;
}

export function SubscriptionSection() {
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    async function fetchSubscriptionStatus() {
      try {
        const data = await getSubscriptionStatus();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching subscription status:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    }

    fetchSubscriptionStatus();
  }, []);

  const rawPlan = profile?.subscription_plan?.toLowerCase() || 'free';
  const planType = rawPlan === 'pro' ? 'monthly' : rawPlan;
  const subscription_status = profile?.subscription_status;
  const current_period_end = profile?.current_period_end;
  
  const isPaidActive = hasActiveProAccess(rawPlan, current_period_end);
  const isCanceling = subscription_status === 'canceled';

  const handleManageSubscription = () => {
    router.push('/subscription');
  };

  const handleCheckout = async (plan: Plan) => {
    if (!plan.priceId || plan.id === 'free') return;

    try {
      setIsCheckingOut(true);
      toast.info(`Initialisation du paiement sécurisé Paddle [${plan.title}]...`);
      const session = await createPaddleCheckoutSession({
        planType: plan.id as 'sprint' | 'monthly' | 'lifetime',
      });

      if (session?.checkoutUrl) {
        window.location.href = session.checkoutUrl;
      } else {
        toast.error('Impossible d\'initialiser le paiement Paddle.');
      }
    } catch (error) {
      console.error('Paddle payment error:', error);
      toast.error('Erreur lors de la préparation du paiement.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Calculate days remaining for canceling or sprint plan
  const daysRemaining = current_period_end
    ? Math.max(0, Math.ceil((new Date(current_period_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  if (isLoadingProfile) {
    return (
      <div className="space-y-16 relative min-h-[400px] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-16 w-16 bg-muted rounded-2xl" />
          <div className="h-8 w-48 bg-muted rounded-full" />
          <div className="h-4 w-64 bg-muted rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 relative">
      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className={cn(
          "p-8 text-center rounded border border-[#E5E1D8] bg-white relative overflow-hidden shadow-none"
        )}>
          <div className="relative space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-[#E5E1D8] bg-[#f5f3ef] text-xs font-semibold text-[#127749] tracking-wide uppercase">
              <ShieldCheck className="h-3.5 w-3.5" />
              {isPaidActive 
                ? (planType === 'lifetime' ? 'Accès Fondateur Actif' : planType === 'sprint' ? `Sprint 14j Actif (${daysRemaining}j)` : 'Recherche Active')
                : 'Formule Découverte Active'}
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1B18]">
              {isPaidActive
                ? (planType === 'lifetime' ? 'Membre Fondateur à Vie' : planType === 'sprint' ? `Sprint Candidature : ${daysRemaining} jours restants` : 'Formule Recherche Active')
                : 'Formule Découverte Active'}
            </h2>

            <p className="text-sm text-[#494740]">
              {isPaidActive
                ? 'Vous profitez du moteur IA anti-hallucination, de CVs adaptés illimités et du diagnostic ATS complet.'
                : 'Passez au Sprint 14 jours (13 € en paiement unique) pour postuler activement sans engagement récurrent.'}
            </p>

            <div className="flex justify-center pt-2">
              <Button
                onClick={handleManageSubscription}
                className="h-10 px-6 rounded text-xs font-medium bg-[#1C1B18] text-[#fbf9f5] hover:bg-[#30312e] border border-[#1C1B18]"
              >
                Voir les détails de mon accès
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {plans.map((plan) => (
          <PricingCard
            key={plan.title}
            plan={plan}
            isCurrentPlan={plan.id === planType}
            isLoading={isCheckingOut}
            onAction={handleCheckout}
            buttonText={plan.id === planType ? 'Formule Actuelle' : undefined}
          />
        ))}
      </div>
    </div>
  );
}