'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Clock, Sparkles, Trophy } from 'lucide-react';
import { PricingCard, type Plan } from './pricing-card';
import { createFlutterwavePaymentSession } from '@/utils/actions/flutterwave/actions';
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

interface CancelingPlanDisplayProps {
  initialProfile: {
    subscription_plan: string | null;
    subscription_status: string | null;
    current_period_end: string | null;
    trial_end: string | null;
    flutterwave_transaction_id?: string | null;
    flutterwave_tx_ref?: string | null;
  } | null;
}

export function CancelingPlanDisplay({ initialProfile }: CancelingPlanDisplayProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const daysRemaining = initialProfile?.current_period_end
    ? Math.max(0, Math.ceil((new Date(initialProfile.current_period_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const handleReactivate = async (plan: Plan) => {
    if (!plan.priceId || plan.id === 'free') return;

    try {
      setIsLoading(true);
      toast.info(`Initialisation du paiement Flutterwave [${plan.title}]...`);
      const session = await createFlutterwavePaymentSession({
        planType: plan.id as 'sprint' | 'monthly' | 'lifetime',
      });

      if (session?.checkoutUrl) {
        window.location.href = session.checkoutUrl;
      } else {
        toast.error('Impossible d\'initialiser le paiement Flutterwave.');
      }
    } catch (error) {
      console.error('Flutterwave reactivation error:', error);
      toast.error('Erreur lors de la réactivation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      {/* Warning / Grace period banner */}
      <Card className="p-8 sm:p-10 rounded border border-amber-200 bg-amber-50/50 mb-10 relative overflow-hidden shadow-none">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-amber-300 bg-amber-100/70 text-xs font-semibold text-amber-800 tracking-wide uppercase">
            <Clock className="h-3.5 w-3.5 text-amber-700" />
            Accès en cours de clôture
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1B18]">
            Il vous reste {daysRemaining} jour{daysRemaining > 1 ? 's' : ''} d&apos;accès actif
          </h1>
          <p className="text-sm sm:text-base text-[#494740] font-sans leading-relaxed">
            Votre abonnement ne sera pas renouvelé automatiquement. Vous pouvez prolonger à tout moment via le Sprint 14 jours (13 €) ou sécuriser un accès Fondateur à vie (69 €).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-left">
            <div className="p-3.5 rounded border border-amber-200 bg-white">
              <Sparkles className="h-4 w-4 text-amber-700 mb-1.5" />
              <h4 className="font-serif font-semibold text-xs text-[#1C1B18]">Vos CVs restent sauvegardés</h4>
              <p className="text-[11px] text-[#494740] mt-0.5">Toutes vos candidatures restent consultables et téléchargeables au format standard.</p>
            </div>
            <div className="p-3.5 rounded border border-amber-200 bg-white">
              <Trophy className="h-4 w-4 text-amber-700 mb-1.5" />
              <h4 className="font-serif font-semibold text-xs text-[#1C1B18]">Zéro mauvaise surprise</h4>
              <p className="text-[11px] text-[#494740] mt-0.5">Optez pour un Sprint 14 jours sans aucun prélèvement récurrent.</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {plans.map((plan) => (
          <PricingCard
            key={plan.title}
            plan={plan}
            isCurrentPlan={false}
            isLoading={isLoading}
            onAction={handleReactivate}
            buttonText={plan.id === 'free' ? undefined : `Prendre cette formule (${plan.price})`}
          />
        ))}
      </div>
    </div>
  );
}