'use client';

import { useState } from 'react';
import { PricingCard, type Plan } from './pricing-card';
import { Card } from '@/components/ui/card';
import { Sparkles, Compass, CheckCircle2, ShieldCheck, Clock, Award } from 'lucide-react';
import { createPaddleCheckoutSession } from '@/utils/actions/paddle/actions';
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
      'QRO standard (Question-Réponse)',
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
      'Quota limité (200 places réelles garanties)',
      'Support prioritaire EasyWork',
      'Aucun renouvellement ni frais cachés',
    ]
  }
];

interface FreePlanDisplayProps {
  initialProfile: {
    subscription_plan: string | null;
    subscription_status: string | null;
  } | null;
}

export function FreePlanDisplay({ initialProfile }: FreePlanDisplayProps) {
  const [loading, setLoading] = useState(false);
  const subscriptionPlan = initialProfile?.subscription_plan?.toLowerCase() || 'free';

  const handleCheckout = async (plan: Plan) => {
    if (!plan.priceId || plan.id === 'free') return;
    
    try {
      setLoading(true);
      toast.info(`Initialisation du paiement sécurisé Paddle pour [${plan.title}]...`);
      const session = await createPaddleCheckoutSession({
        planType: plan.id as 'sprint' | 'monthly' | 'lifetime',
      });

      if (session?.checkoutUrl) {
        window.location.href = session.checkoutUrl;
      } else {
        toast.error('Impossible de charger le paiement Paddle.');
      }
    } catch (error) {
      console.error('Paddle payment error:', error);
      toast.error('Erreur lors de la création de la session de paiement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      {/* Editorial Header Banner */}
      <Card className="p-8 sm:p-10 rounded border border-[#E5E1D8] bg-[#ffffff] mb-10 relative overflow-hidden shadow-none">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-[#E5E1D8] bg-[#f5f3ef] text-xs font-semibold text-[#494740] tracking-wide uppercase">
            <Compass className="h-3.5 w-3.5 text-[#127749]" />
            Tarification Équitable & Sans Friction
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1B18]">
            Une tarification pensée pour la réalité de votre recherche d&apos;emploi
          </h1>
          <p className="text-sm sm:text-base text-[#494740] font-sans leading-relaxed">
            La recherche d&apos;emploi est intense et temporaire. Pas d&apos;abonnement forcé : testez gratuitement, choisissez un <strong>Sprint 14 jours sans engagement</strong>, ou sécurisez votre accès permanent à vie.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
            <div className="p-3.5 rounded border border-[#E5E1D8] bg-[#fbf9f5]">
              <CheckCircle2 className="h-4 w-4 text-[#127749] mb-1.5" />
              <h4 className="font-serif font-semibold text-xs text-[#1C1B18]">Preuve avant paiement</h4>
              <p className="text-[11px] text-[#494740] mt-0.5">Évaluez gratuitement votre score ATS et le diagnostic de votre CV.</p>
            </div>
            <div className="p-3.5 rounded border border-[#E5E1D8] bg-[#fbf9f5]">
              <Clock className="h-4 w-4 text-[#127749] mb-1.5" />
              <h4 className="font-serif font-semibold text-xs text-[#1C1B18]">Sprint 14 jours (13 €)</h4>
              <p className="text-[11px] text-[#494740] mt-0.5">Paiement unique, expire automatiquement sans mauvaise surprise.</p>
            </div>
            <div className="p-3.5 rounded border border-[#E5E1D8] bg-[#fbf9f5]">
              <ShieldCheck className="h-4 w-4 text-[#127749] mb-1.5" />
              <h4 className="font-serif font-semibold text-xs text-[#1C1B18]">Système Truth Guard</h4>
              <p className="text-[11px] text-[#494740] mt-0.5">Zéro hallucination. L&apos;IA optimise sans inventer de faux diplômes.</p>
            </div>
          </div>
        </div>
      </Card>

      {/* 4 Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 items-stretch">
        {plans.map((plan) => (
          <PricingCard
            key={plan.title}
            plan={plan}
            isCurrentPlan={plan.id === subscriptionPlan}
            isLoading={loading}
            onAction={handleCheckout}
            buttonText={plan.id === subscriptionPlan ? 'Formule Actuelle' : undefined}
          />
        ))}
      </div>

      {/* Trust & Guarantee Banner */}
      <Card className="p-6 sm:p-8 rounded border border-[#E5E1D8] bg-[#fbf9f5] shadow-none">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded border border-[#E5E1D8] bg-white flex items-center justify-center flex-shrink-0">
              <Award className="h-6 w-6 text-[#127749]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#1C1B18]">
                Garantie Satisfait ou Remboursé 7 jours
              </h3>
              <p className="text-xs text-[#494740] mt-0.5">
                Remboursement sans condition sur simple demande si le copilote ne booste pas significativement la pertinence de vos candidatures.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#127749] bg-white px-4 py-2 rounded border border-[#E5E1D8]">
            <ShieldCheck className="h-4 w-4" />
            <span>Paiement sécurisé par Flutterwave</span>
          </div>
        </div>
      </Card>
    </div>
  );
}