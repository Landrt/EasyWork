import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CreatorStory() {
  return (
    <div className="py-16 border-y border-white/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-violet-500/5 via-blue-500/5 to-indigo-500/5 rounded-3xl p-8 sm:p-12 border border-violet-200/40 shadow-xl backdrop-blur-xl">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100/80 text-violet-700 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              La Mission EasyWork
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
              Pourquoi nous avons conçu EasyWork
            </h2>
            
            <div className="space-y-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
              <p>
                Le marché du recrutement a radicalement changé : plus de 75 % des candidatures sont filtrées par des algorithmes ATS avant même d&apos;atteindre un regard humain. Obtenir un entretien requiert un niveau de personnalisation et de précision que peu de candidats peuvent maintenir à grande échelle.
              </p>
              <p>
                EasyWork est né d&apos;une conviction : chaque candidat mérite d&apos;avoir un copilote intelligent capable d&apos;analyser ses véritables forces, d&apos;aligner son profil sur les attentes précises des recruteurs et de maximiser son taux de conversion en entretiens.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <Link href="/partner">
                <Button variant="outline" className="border-violet-200 hover:bg-violet-50 text-violet-700">
                  Découvrir le Programme Partenaire
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 