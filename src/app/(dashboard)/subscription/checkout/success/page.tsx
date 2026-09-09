import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const SuccessPage = () => {
  return (
    <div className="text-center space-y-6 p-8 max-w-xl mx-auto my-12">
      <div className="flex justify-center">
        <div className="h-16 w-16 rounded border border-[#E5E1D8] bg-[#efeeea] flex items-center justify-center">
          <CheckCircle2 className="h-9 w-9 text-[#127749]" />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-bold text-[#1C1B18]">
          Paiement validé avec succès
        </h1>
        <p className="text-sm text-[#494740] font-sans">
          Votre abonnement a été activé via Paddle (Merchant of Record). Vous bénéficiez désormais de l&apos;ensemble des fonctionnalités avancées d&apos;EasyWork Pro.
        </p>
      </div>
      
      <div className="p-6 bg-white rounded border border-[#E5E1D8] text-left space-y-3">
        <h3 className="font-serif font-semibold text-sm text-[#1C1B18]">Vos avantages actifs :</h3>
        <div className="space-y-2 text-xs text-[#1C1B18]">
          <p className="flex items-center gap-2"><span className="text-[#127749]">✓</span> Adaptation IA stricte zéro-hallucination</p>
          <p className="flex items-center gap-2"><span className="text-[#127749]">✓</span> Diagnostic ATS approfondi avec résolutions guidées</p>
          <p className="flex items-center gap-2"><span className="text-[#127749]">✓</span> Cockpit de candidature complet & export PDF illimité</p>
        </div>
      </div>

      <div className="pt-2">
        <Button asChild className="w-full h-11 bg-[#1C1B18] text-[#fbf9f5] hover:bg-[#30312e] rounded border border-[#1C1B18]">
          <Link href="/" className="inline-flex items-center justify-center gap-2">
            <span>Accéder à mon tableau de bord</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default SuccessPage;
