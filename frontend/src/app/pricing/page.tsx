"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen flex flex-col font-body-md text-body-md antialiased bg-background text-on-background">
      <style dangerouslySetInnerHTML={{__html: `
        .interactive-card:hover {
            border-color: var(--color-clay-accent);
            box-shadow: inset 0 0 0 2px rgba(229, 225, 216, 0.5);
        }
        .check-list li {
            position: relative;
            padding-left: 1.75rem;
            margin-bottom: 0.75rem;
        }
        .check-list li::before {
            content: 'check';
            font-family: 'Material Symbols Outlined';
            position: absolute;
            left: 0;
            top: -2px;
            color: var(--color-ink);
            font-size: 1.25rem;
        }
        .check-list.success-checks li::before {
            color: var(--color-success-green);
        }
      `}} />

      {/* TopNavBar */}
      <header className="bg-background dark:bg-background border-b border-parchment-border dark:border-outline-variant docked full-width top-0 z-50">
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-max-width mx-auto">
          <div className="text-headline-md font-headline-md font-bold text-ink dark:text-on-background">
            <Link href="/">EasyWork</Link>
          </div>
          <nav className="hidden md:flex gap-8 items-center">
            {/* Active Link */}
            <Link className="text-primary font-bold border-b-2 border-primary pb-1 text-label-sm font-label-sm uppercase hover:text-primary transition-colors duration-200" href="/pricing">
              Voir les tarifs
            </Link>
            {/* Inactive Link */}
            <Link className="text-on-surface-variant dark:text-on-surface-variant text-label-sm font-label-sm uppercase hover:text-primary transition-colors duration-200" href="/login">
              Connexion
            </Link>
          </nav>
          <Link href="/login" className="bg-success-green text-on-primary font-label-md text-label-md px-6 py-3 rounded hover:opacity-90 transition-opacity flex items-center gap-2">
            Créer mon CV
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-16 md:py-24">
        {/* Hero Section */}
        <section className="max-w-3xl mb-16 md:mb-24">
          <h1 className="font-display-lg text-display-lg text-ink mb-6 tracking-tight">L&apos;excellence éditoriale pour votre carrière.</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
            Des outils conçus pour les professionnels exigeants. Optimisez votre CV pour les systèmes ATS tout en conservant une esthétique irréprochable.
          </p>
        </section>

        {/* Pricing Grid */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-gutter mb-32">
          {/* Tier 1 */}
          <div className="col-span-1 md:col-span-4 bg-surface-container-lowest border border-parchment-border p-8 flex flex-col interactive-card transition-all duration-300">
            <div className="mb-8">
              <h2 className="font-headline-md text-headline-md text-ink mb-2">Découverte</h2>
              <div className="flex items-baseline gap-1">
                <span className="font-display-lg text-display-lg">0€</span>
              </div>
              <p className="font-caption text-caption text-outline mt-2">Pour commencer votre démarche.</p>
            </div>
            <ul className="check-list font-body-md text-body-md text-on-surface-variant flex-grow mb-8">
              <li>1 CV actif</li>
              <li>Accès aux templates basiques</li>
              <li>Score ATS global indicatif</li>
              <li>Export PDF standard</li>
            </ul>
            <button className="w-full border border-clay-accent bg-transparent text-ink font-label-md text-label-md uppercase tracking-wider py-3 rounded hover:bg-surface transition-colors mt-auto" onClick={() => router.push("/signup")}>
              Créer un compte gratuit
            </button>
          </div>

          {/* Tier 2 */}
          <div className="col-span-1 md:col-span-4 bg-surface-container border border-parchment-border p-8 flex flex-col interactive-card transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-success-green"></div>
            <div className="mb-8">
              <div className="flex justify-between items-start">
                <h2 className="font-headline-md text-headline-md text-ink mb-2">Sprint Candidature</h2>
                <span className="bg-surface-container-lowest text-success-green border border-parchment-border px-2 py-1 text-label-sm font-label-sm uppercase rounded-sm">Intensif</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-display-lg text-display-lg">9€</span>
                <span className="font-body-md text-body-md text-outline">/ 14 jours</span>
              </div>
              <p className="font-caption text-caption text-outline mt-2">Idéal pour une recherche ciblée et rapide.</p>
            </div>
            <ul className="check-list success-checks font-body-md text-body-md text-on-surface-variant flex-grow mb-8">
              <li>CV multiples illimités</li>
              <li>Export DOCX professionnel</li>
              <li>Génération d&apos;1 lettre de motivation ciblée</li>
              <li>Analyse ATS détaillée par mot-clé</li>
            </ul>
            <button className="w-full bg-success-green text-on-primary font-label-md text-label-md uppercase tracking-wider py-3 rounded hover:opacity-90 transition-opacity mt-auto" onClick={() => router.push("/signup")}>
              Démarrer le sprint
            </button>
          </div>

          {/* Tier 3 */}
          <div className="col-span-1 md:col-span-4 bg-primary-container text-on-primary-container border border-primary-container p-8 flex flex-col shadow-sm">
            <div className="mb-8">
              <h2 className="font-headline-md text-headline-md text-surface-container-lowest mb-2">Recherche Active</h2>
              <div className="flex items-baseline gap-1 text-surface-container-lowest">
                <span className="font-display-lg text-display-lg">15€</span>
                <span className="font-body-md text-body-md opacity-80">/ mois</span>
              </div>
              <p className="font-caption text-caption opacity-80 mt-2">L&apos;arsenal complet pour gérer votre carrière.</p>
            </div>
            <ul className="font-body-md text-body-md flex-grow mb-8 space-y-3">
              <li className="flex gap-3">
                <span className="material-symbols-outlined text-success-green">check_circle</span>
                <span>Tout de l&apos;offre Sprint</span>
              </li>
              <li className="flex gap-3">
                <span className="material-symbols-outlined text-success-green">check_circle</span>
                <span>Accès continu et mises à jour</span>
              </li>
              <li className="flex gap-3">
                <span className="material-symbols-outlined text-success-green">check_circle</span>
                <span>Lettres de motivation illimitées</span>
              </li>
              <li className="flex gap-3">
                <span className="material-symbols-outlined text-success-green">check_circle</span>
                <span>Suivi des candidatures intégré</span>
              </li>
            </ul>
            <button className="w-full bg-success-green text-on-primary font-label-md text-label-md uppercase tracking-wider py-3 rounded hover:brightness-110 transition-all mt-auto" onClick={() => router.push("/signup")}>
              S&apos;abonner
            </button>
          </div>

          {/* Tier 4 */}
          <div className="col-span-1 md:col-span-12 mt-4 bg-surface border border-clay-accent p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between interactive-card">
            <div className="max-w-2xl mb-6 md:mb-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-ink">workspace_premium</span>
                <h2 className="font-headline-md text-headline-md text-ink">Accès Fondateur</h2>
              </div>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Un paiement unique de <strong className="font-semibold text-ink">59€</strong> pour un accès à vie. Quantité limitée pour nos premiers utilisateurs exigeants.
              </p>
            </div>
            <button className="bg-transparent border border-ink text-ink font-label-md text-label-md uppercase tracking-wider px-8 py-3 rounded hover:bg-ink hover:text-on-primary transition-colors whitespace-nowrap" onClick={() => router.push("/signup")}>
              Obtenir l&apos;accès à vie
            </button>
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="max-w-5xl mx-auto mb-24">
          <h3 className="font-headline-lg text-headline-lg text-ink mb-12 text-center">Comparaison détaillée</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th className="w-2/5 pb-4 border-b border-ink font-label-sm text-label-sm uppercase text-outline tracking-wider">Fonctionnalité</th>
                  <th className="w-1/5 pb-4 border-b border-ink font-label-sm text-label-sm uppercase text-ink tracking-wider">Découverte</th>
                  <th className="w-1/5 pb-4 border-b border-ink font-label-sm text-label-sm uppercase text-ink tracking-wider text-success-green">Sprint</th>
                  <th className="w-1/5 pb-4 border-b border-ink font-label-sm text-label-sm uppercase text-ink tracking-wider">Recherche Active</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md text-on-surface-variant">
                <tr>
                  <td className="py-5 border-b border-parchment-border font-medium text-ink">Nombre de CV actifs</td>
                  <td className="py-5 border-b border-parchment-border">1</td>
                  <td className="py-5 border-b border-parchment-border">Illimité</td>
                  <td className="py-5 border-b border-parchment-border">Illimité</td>
                </tr>
                <tr>
                  <td className="py-5 border-b border-parchment-border font-medium text-ink">Templates professionnels</td>
                  <td className="py-5 border-b border-parchment-border">Limités (3)</td>
                  <td className="py-5 border-b border-parchment-border">Tous</td>
                  <td className="py-5 border-b border-parchment-border">Tous</td>
                </tr>
                <tr>
                  <td className="py-5 border-b border-parchment-border font-medium text-ink">Analyse ATS</td>
                  <td className="py-5 border-b border-parchment-border">Score global</td>
                  <td className="py-5 border-b border-parchment-border text-success-green font-medium">Détaillée (Mots-clés)</td>
                  <td className="py-5 border-b border-parchment-border">Détaillée (Mots-clés)</td>
                </tr>
                <tr>
                  <td className="py-5 border-b border-parchment-border font-medium text-ink">Formats d&apos;export</td>
                  <td className="py-5 border-b border-parchment-border">PDF</td>
                  <td className="py-5 border-b border-parchment-border">PDF, DOCX</td>
                  <td className="py-5 border-b border-parchment-border">PDF, DOCX</td>
                </tr>
                <tr>
                  <td className="py-5 border-b border-parchment-border font-medium text-ink">Génération Lettre de motivation</td>
                  <td className="py-5 border-b border-parchment-border text-outline">-</td>
                  <td className="py-5 border-b border-parchment-border">1 incluse</td>
                  <td className="py-5 border-b border-parchment-border">Illimitée</td>
                </tr>
                <tr>
                  <td className="py-5 border-b border-parchment-border font-medium text-ink">Durée d&apos;accès aux fonctionnalités premium</td>
                  <td className="py-5 border-b border-parchment-border text-outline">-</td>
                  <td className="py-5 border-b border-parchment-border text-success-green font-medium">14 jours</td>
                  <td className="py-5 border-b border-parchment-border">Abonnement actif</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low dark:bg-surface-container-lowest border-t border-parchment-border dark:border-outline-variant full-width bottom mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-12 max-w-max-width mx-auto gap-6 md:gap-0">
          <div className="text-headline-md font-headline-md font-bold text-ink">
            EasyWork
          </div>
          <nav className="flex gap-6 items-center">
            <Link className="text-on-surface-variant text-label-sm font-label-sm hover:text-primary transition-colors duration-300" href="/legal">Mentions Légales</Link>
            <Link className="text-on-surface-variant text-label-sm font-label-sm hover:text-primary transition-colors duration-300" href="/privacy">RGPD</Link>
            <Link className="text-on-surface-variant text-label-sm font-label-sm hover:text-primary transition-colors duration-300" href="/support">Support</Link>
          </nav>
          <div className="text-body-md font-body-md text-on-surface-variant">
            © 2026 EasyWork. Editorial Professionalism.
          </div>
        </div>
      </footer>
    </div>
  );
}
