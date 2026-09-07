'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Trophy, CheckCircle2, ShieldCheck, AlertTriangle, Clock, Award } from 'lucide-react';
import { PricingCard, type Plan } from './pricing-card';
import { cancelSubscription, createFlutterwavePaymentSession } from '@/utils/actions/flutterwave/actions';
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

interface ProPlanDisplayProps {
  initialProfile: {
    subscription_plan: string | null;
    subscription_status: string | null;
    current_period_end: string | null;
    trial_end: string | null;
    flutterwave_transaction_id?: string | null;
    flutterwave_tx_ref?: string | null;
  } | null;
}

export function ProPlanDisplay({ initialProfile }: ProPlanDisplayProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  const rawPlan = initialProfile?.subscription_plan?.toLowerCase() || 'sprint';
  const planType = rawPlan === 'pro' ? 'monthly' : rawPlan;
  
  const isLifetime = planType === 'lifetime';
  const isSprint = planType === 'sprint';
  const isMonthly = planType === 'monthly';

  const daysRemaining = initialProfile?.current_period_end
    ? Math.max(0, Math.ceil((new Date(initialProfile.current_period_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 14;

  const periodEndFormatted = initialProfile?.current_period_end
    ? new Date(initialProfile.current_period_end).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const handleCancelSubscription = async () => {
    try {
      setIsLoading(true);
      await cancelSubscription();
      toast.success('Votre abonnement mensuel a été résilié. Vous conservez l\'accès jusqu\'au terme de la période.');
      setShowCancelConfirm(false);
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Une erreur est survenue lors de la résiliation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchOrExtend = async (plan: Plan) => {
    if (!plan.priceId || plan.id === 'free') return;
    try {
      setIsLoading(true);
      toast.info(`Initialisation de l'accès [${plan.title}]...`);
      const session = await createFlutterwavePaymentSession({
        planType: plan.id as 'sprint' | 'monthly' | 'lifetime',
      });
      if (session?.checkoutUrl) {
        window.location.href = session.checkoutUrl;
      }
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la redirection Flutterwave.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      {/* Editorial Status Banner */}
      <Card className="p-8 sm:p-10 rounded border border-[#E5E1D8] bg-[#ffffff] mb-10 relative overflow-hidden shadow-none">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-[#E5E1D8] bg-[#f5f3ef] text-xs font-semibold text-[#127749] tracking-wide uppercase">
            <ShieldCheck className="h-3.5 w-3.5" />
            {isLifetime
              ? 'Accès Fondateur Permanent à Vie (Actif)'
              : isSprint
              ? `Sprint Candidature 14 jours (Actif · ${daysRemaining}j restants)`
              : 'Formule Recherche Active (Abonnement Mensuel)'}
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1B18]">
            {isLifetime
              ? 'Vous êtes Membre Fondateur à Vie EasyWork'
              : isSprint
              ? `Votre Sprint Candidature est en cours : ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} restant${daysRemaining > 1 ? 's' : ''}`
              : 'Votre formule Recherche Active est active'}
          </h1>

          <p className="text-sm sm:text-base text-[#494740] font-sans leading-relaxed">
            {isLifetime
              ? 'Vous bénéficiez d\'un accès illimité à vie sans aucune date d\'expiration ni renouvellement.'
              : isSprint
              ? 'Votre session de candidatures intensives est active. Aucun abonnement ne sera prélevé : ce pass expirera tout seul sans démarche requise.'
              : 'Vous disposez de l\'accès complet avec suivi continu des candidatures et lettres illimitées.'}
          </p>

          {periodEndFormatted && !isLifetime && (
            <p className="text-xs text-[#716e65]">
              {isSprint ? 'Fin automatique du Sprint le : ' : 'Prochain renouvellement prévu le : '}
              <span className="font-semibold text-[#1C1B18]">{periodEndFormatted}</span>
              {initialProfile?.flutterwave_tx_ref && ` (Réf: ${initialProfile.flutterwave_tx_ref})`}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
            <div className="p-3.5 rounded border border-[#E5E1D8] bg-[#fbf9f5]">
              <CheckCircle2 className="h-4 w-4 text-[#127749] mb-1.5" />
              <h4 className="font-serif font-semibold text-xs text-[#1C1B18]">CVs ciblés illimités</h4>
              <p className="text-[11px] text-[#494740] mt-0.5">Adaptez sans restriction chaque CV à l&apos;offre d&apos;emploi visée.</p>
            </div>
            <div className="p-3.5 rounded border border-[#E5E1D8] bg-[#fbf9f5]">
              <Sparkles className="h-4 w-4 text-[#127749] mb-1.5" />
              <h4 className="font-serif font-semibold text-xs text-[#1C1B18]">Audit ATS par mot-clé</h4>
              <p className="text-[11px] text-[#494740] mt-0.5">Visibilité totale sur les correspondances et compétences manquantes.</p>
            </div>
            <div className="p-3.5 rounded border border-[#E5E1D8] bg-[#fbf9f5]">
              <Award className="h-4 w-4 text-[#127749] mb-1.5" />
              <h4 className="font-serif font-semibold text-xs text-[#1C1B18]">Exports PDF & DOCX</h4>
              <p className="text-[11px] text-[#494740] mt-0.5">Téléchargement immédiat haute résolution prêt pour les recruteurs.</p>
            </div>
          </div>

          {/* Cancellation only for monthly recurring */}
          {isMonthly && (
            <div className="pt-6 border-t border-[#E5E1D8] mt-6 flex flex-col items-center">
              {!showCancelConfirm ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCancelConfirm(true)}
                  className="text-xs text-[#716e65] hover:text-red-700 hover:border-red-300"
                >
                  Résilier le renouvellement mensuel
                </Button>
              ) : (
                <div className="p-4 rounded border border-red-200 bg-red-50/60 max-w-md w-full text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 text-red-800 text-xs font-semibold">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span>Confirmer l&apos;arrêt du renouvellement mensuel ?</span>
                  </div>
                  <p className="text-[11px] text-red-700">
                    Vos accès resteront actifs jusqu&apos;au {periodEndFormatted || 'terme du mois en cours'}.
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isLoading}
                      onClick={() => setShowCancelConfirm(false)}
                      className="text-xs"
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={isLoading}
                      onClick={handleCancelSubscription}
                      className="text-xs"
                    >
                      {isLoading ? 'Résiliation...' : 'Confirmer la résiliation'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Grid of all plans for switching or viewing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {plans.map((plan) => {
          const isCurrent = plan.id === planType;
          return (
            <PricingCard
              key={plan.title}
              plan={plan}
              isCurrentPlan={isCurrent}
              isLoading={isLoading}
              onAction={handleSwitchOrExtend}
              buttonText={isCurrent ? 'Votre Formule Active' : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}