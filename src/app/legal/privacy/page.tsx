import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ShieldCheck, Lock, Eye, Database, Sparkles, Trash2, Mail } from 'lucide-react';

export const metadata = {
  title: 'Politique de Confidentialité | EasyWork',
  description: 'Protection des données personnelles, traitement par intelligence artificielle et engagements de confidentialité d\'EasyWork.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-2">
        <Link 
          href="/" 
          className="inline-flex items-center text-xs font-medium text-[#7A776D] hover:text-[#1C1B18] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Retour à l&apos;accueil
        </Link>
        <h1 className="text-3xl font-serif font-bold text-[#1C1B18]">
          Politique de Confidentialité & Protection des Données
        </h1>
        <p className="text-xs text-[#7A776D]">
          Dernière mise à jour : 14 septembre 2026 • EasyWork SaaS
        </p>
      </div>

      <Card className="p-8 bg-white border-[#E5E1D8] shadow-xs space-y-8 text-xs text-[#494740] leading-relaxed">
        {/* Introduction */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#127749]" />
            <h2 className="font-serif font-bold text-sm text-[#1C1B18]">
              Engagement Fondamental de Confidentialité
            </h2>
          </div>
          <p>
            Chez <strong>EasyWork</strong>, nous savons que votre CV et vos documents de candidature contiennent des informations personnelles et professionnelles hautement sensibles. La protection de votre vie privée et la sécurité de vos données constituent notre priorité absolue.
          </p>
          <p>
            Cette politique de confidentialité détaille la manière dont nous collectons, utilisons, protégeons et supprimons vos informations lorsque vous utilisez notre plateforme, nos services d&apos;optimisation pour les systèmes ATS (Applicant Tracking Systems) et nos moteurs de rédaction assistée par intelligence artificielle.
          </p>
        </section>

        {/* Article 1 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-[#C9A96E]" />
            <h2 className="font-serif font-bold text-sm text-[#1C1B18]">
              1. Données Personnelles Collectées
            </h2>
          </div>
          <p>
            Nous ne collectons que les informations strictement nécessaires à la fourniture de nos services :
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Données d&apos;identification et de compte :</strong> nom, prénom, adresse e-mail, identifiant de compte et mot de passe chiffré.
            </li>
            <li>
              <strong>Données professionnelles et de profil :</strong> numéro de téléphone, ville/pays de résidence, liens professionnels (LinkedIn, portfolio, GitHub), historique professionnel, parcours de formation, diplômes, certifications et compétences techniques.
            </li>
            <li>
              <strong>Contenu des documents de candidature :</strong> textes rédigés dans vos CVs, lettres de motivation générées, descriptions de poste ou offres d&apos;emploi collées pour analyse sémantique.
            </li>
            <li>
              <strong>Données de transaction :</strong> historique des achats, forfaits souscrits, identifiants anonymisés de paiement transmis par nos prestataires de facturation (PayUnit / Paddle). Nous ne stockons jamais vos numéros de cartes bancaires complets ni vos codes secrets Mobile Money.
            </li>
            <li>
              <strong>Données techniques :</strong> logs de connexion sécurisés, adresse IP anonymisée et témoins de connexion (cookies de session et cookies de parrainage d&apos;une durée de 60 jours).
            </li>
          </ul>
        </section>

        {/* Article 2 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-[#C9A96E]" />
            <h2 className="font-serif font-bold text-sm text-[#1C1B18]">
              2. Finalités et Utilisation de vos Données
            </h2>
          </div>
          <p>Vos données sont exclusivement traitées pour :</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Créer, formater et adapter vos CVs en fonction des offres d&apos;emploi ciblées.</li>
            <li>Calculer votre score de correspondance ATS et identifier les compétences manquantes clés.</li>
            <li>Rédiger des lettres de motivation contextuelles et personnalisées.</li>
            <li>Gérer l&apos;accès à votre espace personnel et la validité de vos forfaits (Sprint, Mensuel, Fondateur).</li>
            <li>Attribuer les commissions du programme partenaire aux affiliés vous ayant recommandé.</li>
            <li>Assurer le support technique et prévenir les abus ou tentatives de piratage.</li>
          </ul>
        </section>

        {/* Article 3 */}
        <section className="space-y-3 bg-[#fbf9f5] p-4 rounded-lg border border-[#E5E1D8]">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#127749]" />
            <h2 className="font-serif font-bold text-sm text-[#1C1B18]">
              3. Traitement par l&apos;Intelligence Artificielle & Garantie Zéro Entraînement
            </h2>
          </div>
          <p className="font-semibold text-[#1C1B18]">
            Nous appliquons une politique stricte de non-réutilisation de vos données :
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Aucun entraînement public :</strong> Vos CVs, expériences et lettres de motivation ne sont <strong>jamais</strong> utilisés pour entraîner, enrichir ou ré-entraîner des modèles publics d&apos;intelligence artificielle (OpenAI, Anthropic, Google ou DeepSeek).
            </li>
            <li>
              <strong>Traitement par API d&apos;entreprise chiffrée :</strong> Les requêtes d&apos;analyse sémantique sont transmises via des canaux chiffrés (TLS 1.3) à des endpoints d&apos;API professionnels soumis à des accords de confidentialité d&apos;entreprise garantissant la suppression immédiate des données après traitement.
            </li>
            <li>
              <strong>Confidentialité totale du candidat :</strong> Aucun recruteur ni utilisateur tiers ne peut accéder à vos documents sans votre partage explicite.
            </li>
          </ul>
        </section>

        {/* Article 4 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#C9A96E]" />
            <h2 className="font-serif font-bold text-sm text-[#1C1B18]">
              4. Sous-traitants & Hébergement Sécurisé
            </h2>
          </div>
          <p>
            Nous sélectionnons rigoureusement des partenaires d&apos;infrastructure certifiés aux normes internationales de sécurité :
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Base de données & Authentification :</strong> Supabase Inc. (infrastructure PostgreSQL isolée, chiffrée au repos AES-256 et politiques Row-Level Security strictes).</li>
            <li><strong>Hébergement & CDN :</strong> Vercel Inc. (infrastructure distribuée protégée contre les attaques DDoS).</li>
            <li><strong>Passerelles de paiement :</strong> PayUnit / Paddle (conformité PCI-DSS de niveau 1).</li>
          </ul>
        </section>

        {/* Article 5 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-[#b91c1c]" />
            <h2 className="font-serif font-bold text-sm text-[#1C1B18]">
              5. Vos Droits & Suppression Immédiate en 1 Clic
            </h2>
          </div>
          <p>
            Conformément aux réglementations sur la protection des données personnelles (RGPD, Convention de l&apos;Union Africaine sur la cybersécurité et la protection des données, lois nationales applicables), vous disposez des droits suivants :
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Droit d&apos;accès et de rectification :</strong> Vous pouvez modifier vos informations à tout moment depuis votre tableau de bord.</li>
            <li><strong>Droit à l&apos;effacement définitif :</strong> Vous pouvez supprimer individuellement n&apos;importe quel CV ou demander la suppression intégrale et irréversible de votre compte directement dans l&apos;onglet <em>Paramètres &gt; Zone de Danger</em>. Toutes vos données sont alors immédiatement purgées de nos serveurs.</li>
            <li><strong>Droit à la portabilité :</strong> Vous pouvez exporter vos CVs à tout moment au format PDF ou DOCX.</li>
          </ul>
        </section>

        {/* Article 6 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-[#C9A96E]" />
            <h2 className="font-serif font-bold text-sm text-[#1C1B18]">
              6. Contact & Délégué à la Protection des Données
            </h2>
          </div>
          <p>
            Pour toute question relative à cette politique de confidentialité, ou pour exercer vos droits, vous pouvez contacter notre équipe support à l&apos;adresse suivante :{' '}
            <a href="mailto:contact@easywork.com" className="text-[#127749] underline font-medium">
              contact@easywork.com
            </a>.
          </p>
        </section>
      </Card>
    </div>
  );
}
