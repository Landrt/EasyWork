import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { ArrowLeft, FileText, CheckCircle2, AlertTriangle, CreditCard, RefreshCw, Award, Scale, HelpCircle } from 'lucide-react';

export const metadata = {
  title: 'Conditions Générales d\'Utilisation & de Vente (CGU/CGV) | EasyWork',
  description: 'Conditions régissant l\'accès, l\'utilisation et les modalités de facturation de la plateforme SaaS EasyWork.',
};

export default function TermsOfServicePage() {
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
          Conditions Générales d&apos;Utilisation & de Vente (CGU / CGV)
        </h1>
        <p className="text-xs text-[#7A776D]">
          Dernière mise à jour : 14 septembre 2026 • EasyWork SaaS
        </p>
      </div>

      <Card className="p-8 bg-white border-[#E5E1D8] shadow-xs space-y-8 text-xs text-[#494740] leading-relaxed">
        {/* Préambule */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#127749]" />
            <h2 className="font-serif font-bold text-sm text-[#1C1B18]">
              Préambule & Acceptation des Conditions
            </h2>
          </div>
          <p>
            Les présentes Conditions Générales d&apos;Utilisation et de Vente (ci-après les « CGU/CGV ») régissent l&apos;ensemble des relations contractuelles entre la plateforme <strong>EasyWork</strong> (ci-après « EasyWork », « nous » ou « la Plateforme ») et toute personne physique ou morale créant un compte ou souscrivant un forfait sur le site (ci-après « l&apos;Utilisateur » ou « vous »).
          </p>
          <p>
            La création d&apos;un compte ou l&apos;achat d&apos;un forfait implique l&apos;acceptation pleine, entière et sans réserve des présentes conditions.
          </p>
        </section>

        {/* Article 1 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#C9A96E]" />
            <h2 className="font-serif font-bold text-sm text-[#1C1B18]">
              Article 1 : Description des Services
            </h2>
          </div>
          <p>
            EasyWork est une solution logicielle en ligne (SaaS) dédiée à l&apos;optimisation des candidatures professionnelles comprenant notamment :
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Un éditeur dynamique de Curriculum Vitae (CV) avec mise en page optimisée pour la lisibilité humaine et machine.</li>
            <li>Un algorithme d&apos;audit de score ATS (Applicant Tracking System) analysant la correspondance sémantique entre le profil et les fiches de poste.</li>
            <li>Des moteurs d&apos;assistance rédactionnelle par intelligence artificielle pour valoriser les réalisations professionnelles.</li>
            <li>Un générateur de lettres de motivation ciblées et un cockpit de suivi de candidatures.</li>
            <li>L&apos;exportation des documents aux formats standardisés PDF et DOCX.</li>
          </ul>
        </section>

        {/* Article 2 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-[#C9A96E]" />
            <h2 className="font-serif font-bold text-sm text-[#1C1B18]">
              Article 2 : Formules d&apos;Accès & Modalités Tarifaires
            </h2>
          </div>
          <p>EasyWork propose plusieurs formules claires et transparentes :</p>
          <div className="space-y-3 pt-1">
            <div className="p-3.5 rounded border border-[#E5E1D8] bg-[#fbf9f5]">
              <h3 className="font-serif font-bold text-xs text-[#1C1B18]">1. Formule Découverte (0 € / Gratuit)</h3>
              <p className="mt-1">Permet la création d&apos;un CV de base et le test indicatif de la plateforme avec des fonctionnalités standards limitées.</p>
            </div>
            <div className="p-3.5 rounded border border-[#E5E1D8] bg-[#fbf9f5]">
              <h3 className="font-serif font-bold text-xs text-[#1C1B18]">2. Sprint Candidature (13 € TTC - Paiement Unique)</h3>
              <p className="mt-1">Pass intensif d&apos;une durée de <strong>14 jours calendaires</strong> donnant accès aux CVs illimités, audits ATS détaillés et exports professionnels. <strong>Aucun prélèvement récurrent</strong> : ce pass s&apos;éteint automatiquement après 14 jours sans démarche requise.</p>
            </div>
            <div className="p-3.5 rounded border border-[#E5E1D8] bg-[#fbf9f5]">
              <h3 className="font-serif font-bold text-xs text-[#1C1B18]">3. Recherche Active (22 € TTC / mois - Sans Engagement)</h3>
              <p className="mt-1">Abonnement mensuel renouvelable par tacite reconduction tous les 30 jours, comprenant lettres illimitées, cockpit complet et mises à jour prioritaires. <strong>Résiliable à tout moment en 1 clic</strong> depuis les paramètres du compte.</p>
            </div>
            <div className="p-3.5 rounded border border-[#E5E1D8] bg-[#fbf9f5]">
              <h3 className="font-serif font-bold text-xs text-[#1C1B18]">4. Accès Fondateur (69 € TTC - Paiement Unique à Vie)</h3>
              <p className="mt-1">Accès permanent à vie à l&apos;ensemble de la plateforme et de ses fonctionnalités futures, strictement réservé aux 200 premières souscriptions sans aucun renouvellement ni frais ultérieurs.</p>
            </div>
          </div>
        </section>

        {/* Article 3 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-[#C9A96E]" />
            <h2 className="font-serif font-bold text-sm text-[#1C1B18]">
              Article 3 : Résiliation de l&apos;Abonnement Mensuel
            </h2>
          </div>
          <p>
            Pour la formule <strong>Recherche Active</strong> à 22 € / mois, l&apos;Utilisateur peut interrompre son abonnement à tout moment, sans préavis ni pénalité, en cliquant sur le bouton <em>« Résilier mon abonnement »</em> dans la rubrique <em>Abonnement</em> de ses paramètres.
          </p>
          <p>
            La résiliation prend effet au terme de la période mensuelle en cours déjà réglée. L&apos;Utilisateur conserve l&apos;accès complet à ses outils jusqu&apos;à la date d&apos;échéance, après quoi aucun nouveau prélèvement ne sera effectué.
          </p>
        </section>

        {/* Article 4 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-[#C9A96E]" />
            <h2 className="font-serif font-bold text-sm text-[#1C1B18]">
              Article 4 : Droit de Rétractation & Produits Numériques Immédiats
            </h2>
          </div>
          <p>
            Conformément aux dispositions relatives à la fourniture de contenus et services numériques non fournis sur un support matériel, l&apos;Utilisateur reconnaît et accepte expressément que l&apos;exécution du service débute immédiatement après confirmation du paiement.
          </p>
          <p>
            En conséquence, l&apos;accès immédiat aux fonctionnalités de génération IA et d&apos;exportation de CVs entraîne la renonciation expresse de l&apos;Utilisateur à son droit de rétractation pour la période ou le pass souscrit.
          </p>
        </section>

        {/* Article 5 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-[#127749]" />
            <h2 className="font-serif font-bold text-sm text-[#1C1B18]">
              Article 5 : Propriété Intellectuelle & Droits sur vos CVs
            </h2>
          </div>
          <p className="font-semibold text-[#1C1B18]">
            L&apos;Utilisateur est et demeure le propriétaire exclusif à 100 % de tous les CVs, textes, lettres de motivation et contenus générés ou importés sur la Plateforme.
          </p>
          <p>
            EasyWork ne revendique aucun droit de propriété sur vos candidatures. EasyWork concède uniquement à l&apos;Utilisateur un droit d&apos;accès personnel, mondial, non exclusif et révocable d&apos;utilisation des outils logiciels, des modèles visuels et de l&apos;interface.
          </p>
        </section>

        {/* Article 6 */}
        <section className="space-y-3 bg-[#fbf9f5] p-4 rounded-lg border border-[#E5E1D8]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <h2 className="font-serif font-bold text-sm text-[#1C1B18]">
              Article 6 : Clause de Non-Garantie d&apos;Embauche & Limitation de Responsabilité
            </h2>
          </div>
          <p className="font-medium text-[#1C1B18]">
            EasyWork est un outil d&apos;aide technologique et d&apos;optimisation documentaire. EasyWork n&apos;est en aucun cas un cabinet de recrutement, une agence d&apos;intérim ou un employeur.
          </p>
          <p>
            En conséquence, EasyWork <strong>ne garantit en aucun cas</strong> l&apos;obtention d&apos;un entretien, d&apos;une réponse positive ou d&apos;un contrat de travail. La décision d&apos;invitation ou d&apos;embauche relève exclusivement de l&apos;appréciation discrétionnaire des recruteurs tiers et des employeurs indépendants.
          </p>
          <p>
            L&apos;Utilisateur demeure seul responsable de l&apos;exactitude, de la sincérité et de la véracité des faits, diplômes et compétences mentionnés dans ses documents.
          </p>
        </section>

        {/* Article 7 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-[#C9A96E]" />
            <h2 className="font-serif font-bold text-sm text-[#1C1B18]">
              Article 7 : Contact & Règlement des Différends
            </h2>
          </div>
          <p>
            Pour toute réclamation ou question relative à votre compte ou à une transaction, vous pouvez vous adresser directement à notre service client à l&apos;adresse électronique suivante :{' '}
            <a href="mailto:contact@easywork.com" className="text-[#127749] underline font-medium">
              contact@easywork.com
            </a>.
          </p>
          <p>
            En cas de litige, les parties s&apos;engagent à rechercher prioritairement une solution amiable avant toute action judiciaire.
          </p>
        </section>
      </Card>
    </div>
  );
}
