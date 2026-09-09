import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AuthDialog } from "@/components/auth/auth-dialog";

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: PricingFeature[];
  buttonText: string;
  gradient: string;
  badge?: string;
  popular?: boolean;
}

const tiers: PricingTier[] = [
  {
    name: "Sprint Candidature",
    price: "13 €",
    period: "paiement unique / 14 jours",
    description: "Recherche ciblée, rapide et intensive sans aucun abonnement",
    gradient: "from-emerald-600/90 to-teal-600/90",
    badge: "Recommandé · Sans abonnement",
    popular: true,
    features: [
      { text: "CVs adaptés illimités aux offres ciblées", included: true },
      { text: "Analyse ATS détaillée par mot-clé", included: true },
      { text: "Moteur IA anti-hallucination", included: true },
      { text: "1 lettre de motivation sur-mesure", included: true },
      { text: "Exports PDF & DOCX professionnels", included: true },
      { text: "Expire seul après 14 jours (0 prélèvement)", included: true },
    ],
    buttonText: "Démarrer le Sprint (13 €)",
  },
  {
    name: "Recherche Active",
    price: "22 €",
    period: "/mois sans engagement",
    description: "Pour candidats en veille continue ou transition approfondie",
    gradient: "from-violet-600/90 to-indigo-600/90",
    badge: "Flexible",
    features: [
      { text: "Tout le contenu du Sprint Candidature", included: true },
      { text: "Génération illimitée de lettres de motivation", included: true },
      { text: "Cockpit & suivi des candidatures", included: true },
      { text: "Exports illimités (PDF & DOCX)", included: true },
      { text: "Accès continu & mises à jour prioritaires", included: true },
      { text: "Résiliation en 1 clic sans préavis", included: true },
    ],
    buttonText: "Choisir Recherche Active (22 €)",
  },
  {
    name: "Accès Fondateur",
    price: "69 €",
    period: "paiement unique à vie",
    description: "Early adopters & professionnels exigeants sans renouvellement",
    gradient: "from-amber-600/90 to-orange-600/90",
    badge: "Édition Limitée · 200 places",
    features: [
      { text: "Accès complet et permanent à vie", included: true },
      { text: "Toutes les futures fonctionnalités incluses", included: true },
      { text: "CVs, lettres & exports illimités à vie", included: true },
      { text: "Quota strict (200 places au total)", included: true },
      { text: "Support prioritaire dédié", included: true },
      { text: "Aucun abonnement ni frais cachés", included: true },
    ],
    buttonText: "Décrocher l'Accès Fondateur (69 €)",
  },
];

export function PricingSection() {
  return (
    <section className="pb-16 px-4 sm:px-6 lg:px-8 relative">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 w-full h-full -z-10">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-emerald-600/10 to-teal-600/10 blur-3xl top-0 -left-32 animate-[move_8s_ease-in-out_infinite]" />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-violet-600/10 to-indigo-600/10 blur-3xl bottom-0 -right-32 animate-[move_9s_ease-in-out_infinite]" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 bg-clip-text text-transparent pb-3">
            Tarifs Transparents, Zéro Mauvaise Surprise
          </h2>
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="flex flex-col items-center px-6 py-2 rounded-full bg-gradient-to-r from-violet-600/10 to-blue-600/10 border border-violet-600/20 shadow-lg shadow-violet-600/5">
              <span className="text-sm font-medium bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                ⭐️ Choisissez la formule adaptée à votre rythme de recherche
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xl">
              EasyWork vous offre la liberté de choisir entre un pass ponctuel sans abonnement, un accès mensuel résiliable en 1 clic ou un accès à vie.
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-stretch">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "relative rounded-2xl h-full transition-all duration-500 flex flex-col",
                tier.popular && "scale-105 md:-mt-4 z-10"
              )}
            >
              {tier.badge && (
                <div className={cn(
                  "absolute -top-4 left-0 right-0 mx-auto px-4 py-1 text-xs text-white text-center font-medium shadow-lg rounded-full w-fit",
                  tier.popular ? "bg-gradient-to-r from-emerald-600 to-teal-600" : "bg-gradient-to-r from-amber-600 to-orange-600"
                )}>
                  {tier.badge}
                </div>
              )}

              <div className="h-full flex flex-col justify-between rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-8 relative overflow-hidden group hover:shadow-2xl hover:shadow-violet-600/10 hover:-translate-y-1 transition-all duration-500">
                {/* Background gradient effect */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-[0.06] -z-10 transition-opacity duration-500",
                  tier.gradient,
                  "group-hover:opacity-[0.10]"
                )} />

                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-[#1C1B18]">{tier.name}</h3>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className={cn(
                        "text-5xl font-extrabold bg-gradient-to-r bg-clip-text text-transparent",
                        tier.gradient
                      )}>
                        {tier.price}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">{tier.period}</span>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{tier.description}</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className={cn(
                          "rounded-full p-0.5 bg-gradient-to-r mt-0.5 flex-shrink-0",
                          feature.included ? tier.gradient : "from-gray-200 to-gray-300"
                        )}>
                          <Check className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="text-xs text-[#1C1B18] leading-tight">
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <AuthDialog>
                  <Button
                    className={cn(
                      "w-full bg-gradient-to-r text-white shadow-md hover:shadow-lg transition-all duration-300 h-11 text-sm font-semibold rounded-lg",
                      tier.gradient
                    )}
                  >
                    {tier.buttonText}
                  </Button>
                </AuthDialog>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 