import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ShieldCheck, Handshake, DollarSign, Clock, AlertTriangle } from 'lucide-react';

export const metadata = {
  title: 'Conditions Générales du Programme Partenaire | EasyWork',
  description: 'Conditions générales d\'utilisation et règles du programme d\'affiliation récurrent EasyWork.',
};

export default function TermsPartnersPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-2">
        <Link 
          href="/partner" 
          className="inline-flex items-center text-xs font-medium text-[#7A776D] hover:text-[#1C1B18] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Retour à l&apos;Espace Partenaire
        </Link>
        <h1 className="text-3xl font-serif font-bold text-[#1C1B18]">
          Conditions Générales du Programme Partenaire
        </h1>
        <p className="text-xs text-[#7A776D]">
          Dernière mise à jour : 7 septembre 2026 • EasyWork SaaS
        </p>
      </div>

      <Card className="p-8 bg-white border-[#E5E1D8] shadow-xs space-y-8 text-xs text-[#494740] leading-relaxed">
        {/* Article 1 */}
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <Handshake className="h-4 w-4 text-[#C9A96E]" />
            <h2 className="font-serif font-bold text-sm text-[#1C1B18]">
              Article 1 : Objet du Programme
            </h2>
          </div>
          <p>
            Le Programme Partenaire EasyWork permet à tout utilisateur inscrit de recommander la plateforme EasyWork au moyen d&apos;un lien de tracking unique ou d&apos;un code d&apos;affiliation personnel, et de percevoir une commission récurrente sur les paiements éligibles réalisés par les filleuls attribués.
          </p>
        </section>

        {/* Article 2 */}
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-[#C9A96E]" />
            <h2 className="font-serif font-bold text-sm text-[#1C1B18]">
              Article 2 : Taux de Commission et Récurrence à Vie
            </h2>
          </div>
          <p>
            Le Partenaire bénéficie d&apos;un taux de commission standard de <strong>30 %</strong> calculé sur le montant net hors taxes encaissé par EasyWork sur les formules éligibles (Sprint 14 jours, Abonnement Mensuel, Accès Fondateur).
          </p>
          <p>
            La commission est <strong>récurrente à vie</strong> : elle s&apos;applique lors de la première souscription ainsi que sur l&apos;ensemble des renouvellements successifs d&apos;abonnement effectués par le filleul tant qu&apos;il demeure abonné et que le compte Partenaire demeure actif.
          </p>
        </section>

        {/* Article 3 */}
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <h2 className="font-serif font-bold text-sm text-[#1C1B18]">
              Article 3 : Interdiction Stricte de l&apos;Auto-Parrainage
            </h2>
          </div>
          <p>
            L&apos;auto-parrainage est formellement prohibé. Un Partenaire ne peut en aucun cas utiliser son propre lien d&apos;affiliation, son code, ou une adresse email lui appartenant pour souscrire un abonnement ou bénéficier d&apos;une commission sur son propre compte utilisateur.
          </p>
          <p>
            Tout contournement détecté (par identifiant, adresse IP, numéro de paiement ou similarité d&apos;identité) entraîne l&apos;annulation immédiate des commissions indues et la suspension définitive du compte partenaire.
          </p>
        </section>

        {/* Article 4 */}
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <h2 className="font-serif font-bold text-sm text-[#1C1B18]">
              Article 4 : Période de Gel (30 jours) et Remboursements
            </h2>
          </div>
          <p>
            Afin de prémunir le système contre les fraudes bancaires, les rétrofacturations (chargebacks) et les demandes de remboursement client, chaque commission générée est placée en statut d&apos;attente (<strong>période de gel de 30 jours calendaires</strong>).
          </p>
          <p>
            À l&apos;issue de ce délai de 30 jours, la commission passe automatiquement au statut disponible pour retrait. En cas de remboursement du client durant ou après ce délai :
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Si la commission est encore en attente, elle est immédiatement annulée.</li>
            <li>Si la commission a déjà été débloquée, elle est déduite du solde disponible du Partenaire (sans solde négatif, le déficit éventuel étant imputé sur les futurs déblocages).</li>
          </ul>
        </section>

        {/* Article 5 */}
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <h2 className="font-serif font-bold text-sm text-[#1C1B18]">
              Article 5 : Seuil Minimal et Modalités de Retrait
            </h2>
          </div>
          <p>
            Les retraits de commissions disponibles sont débloqués dès que le solde atteint le seuil minimal de <strong>20,00 USD</strong>.
          </p>
          <p>
            Les versements sont opérés par virement direct sur Mobile Money (Orange Money, MTN MoMo, Wave, etc.), virement bancaire ou PayPal sur le compte préalablement renseigné et vérifié par le Partenaire.
          </p>
        </section>

        {/* Article 6 */}
        <section className="space-y-2">
          <h2 className="font-serif font-bold text-sm text-[#1C1B18]">
            Article 6 : Durée des Cookies et Attribution
          </h2>
          <p>
            Le cookie de suivi d&apos;affiliation déposé lors du premier clic a une durée de validité de <strong>60 jours</strong>. Tout compte utilisateur créé par le visiteur dans cette fenêtre temporelle est définitivement et irrévocablement rattaché au Partenaire.
          </p>
        </section>
      </Card>
    </div>
  );
}

