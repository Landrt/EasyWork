"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased selection:bg-clay-accent selection:text-ink">
      {/* Header */}
      <header className="bg-background border-b border-parchment-border docked full-width top-0 z-50">
        <nav className="flex justify-between items-center w-full px-margin-desktop py-4 max-w-max-width mx-auto">
          <div className="flex items-center gap-2">
            <img alt="CV x ATS Logo" className="h-8 w-8 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2jSZo_WJD6zaK11HHLffLGWZea23FAVEOpbJAMFrHsoOFuLgu6GBmBHVoS2SAcROnS-3BaDqCZh8vbfn26V-jC751-nI1ijm88D3nnCw6clb7Ij2vxKA5VQyEpCF-HLgjFvmntoatzbJEYnLMiNIGDvW-CCqr09cfu4xDm8RWhBS5P2n90SQL_b-71wRUr5PCmorXg7KUqTpEs6Ge5XxNuY4DAzFqAswGu1Szpwu9S3R_G_2NVuCy" />
            <span className="text-headline-md font-headline-md font-bold text-ink">EasyWork</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link className="text-on-surface-variant font-label-sm text-label-sm hover:text-primary transition-colors duration-200 uppercase tracking-widest" href="/pricing">Voir les tarifs</Link>
            <Link className="text-on-surface-variant font-label-sm text-label-sm hover:text-primary transition-colors duration-200 uppercase tracking-widest" href="/login">Connexion</Link>
            <Link className="bg-success-green text-on-primary px-6 py-3 rounded text-label-sm font-label-sm uppercase tracking-widest hover:bg-tertiary transition-colors min-h-[44px] flex items-center justify-center" href="/signup">Créer mon CV</Link>
          </div>
          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-ink p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span className="material-symbols-outlined" data-icon="menu">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </nav>
        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background border-t border-parchment-border px-margin-desktop py-4 flex flex-col gap-4">
            <Link className="text-on-surface-variant font-label-sm text-label-sm uppercase" href="/pricing" onClick={() => setMobileMenuOpen(false)}>Voir les tarifs</Link>
            <Link className="text-on-surface-variant font-label-sm text-label-sm uppercase" href="/login" onClick={() => setMobileMenuOpen(false)}>Connexion</Link>
            <Link className="bg-success-green text-on-primary px-6 py-3 rounded font-label-sm text-label-sm text-center uppercase" href="/signup" onClick={() => setMobileMenuOpen(false)}>Créer mon CV</Link>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="w-full max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-24 md:py-32 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <h1 className="font-display-lg text-display-lg text-ink">Votre CV mérite d&apos;être lu par un humain, pas seulement par une machine.</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Nous combinons une mise en page d&apos;une élégance éditoriale avec une optimisation algorithmique rigoureuse (ATS). Soyez sûr de passer les filtres automatisés sans sacrifier l&apos;esthétique professionnelle qui convaincra le recruteur.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link className="bg-success-green text-on-primary px-8 py-4 rounded font-label-md text-label-md flex items-center justify-center min-h-[44px] hover:bg-tertiary transition-colors" href="/signup">Créer mon CV gratuitement</Link>
              <Link className="bg-transparent border border-clay-accent text-ink px-8 py-4 rounded font-label-md text-label-md flex items-center justify-center min-h-[44px] hover:bg-surface-container-high transition-colors" href="#exemple">Voir un exemple</Link>
            </div>
          </div>
          <div className="flex-1 relative">
            {/* Decorative Mockup Element */}
            <div className="w-full aspect-[3/4] bg-surface border border-parchment-border shadow-sm p-8 flex flex-col gap-6 transform rotate-2 hover:rotate-0 transition-transform duration-500 relative overflow-hidden">
              <div className="w-1/3 h-2 bg-parchment-border rounded-full"></div>
              <div className="w-3/4 h-8 bg-ink rounded-sm"></div>
              <div className="w-1/2 h-4 bg-clay-accent rounded-sm"></div>
              <div className="flex-grow flex flex-col gap-4 mt-8">
                <div className="w-full h-3 bg-surface-variant rounded-full"></div>
                <div className="w-5/6 h-3 bg-surface-variant rounded-full"></div>
                <div className="w-full h-3 bg-surface-variant rounded-full"></div>
                <div className="w-4/5 h-3 bg-surface-variant rounded-full"></div>
              </div>
              {/* ATS Score Indicator */}
              <div className="absolute bottom-8 right-8 bg-surface-container-lowest border border-success-green px-4 py-2 rounded flex items-center gap-2">
                <span className="material-symbols-outlined text-success-green" data-icon="check_circle" data-weight="fill">check_circle</span>
                <span className="font-label-sm text-label-sm text-success-green uppercase">ATS Pass: 98%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="w-full bg-surface-container-low border-y border-parchment-border py-16">
          <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop text-center">
            <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-8">Formaté pour être compatible avec les principaux systèmes ATS</h3>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale">
              <span className="font-headline-md text-headline-md font-bold text-ink">Workday</span>
              <span className="font-headline-md text-headline-md font-bold text-ink">Taleo</span>
              <span className="font-headline-md text-headline-md font-bold text-ink">Greenhouse</span>
              <span className="font-headline-md text-headline-md font-bold text-ink">Lever</span>
            </div>
          </div>
        </section>

        {/* Feature Bento Grid */}
        <section className="w-full max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-24">
          <h2 className="font-headline-lg text-headline-lg text-ink text-center mb-16">L&apos;approche Éditoriale.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="md:col-span-2 bg-surface border border-parchment-border p-8 hover:border-clay-accent transition-colors flex flex-col justify-between min-h-[320px]">
              <div>
                <span className="material-symbols-outlined text-ink text-3xl mb-4" data-icon="edit_document">edit_document</span>
                <h3 className="font-headline-md text-headline-md text-ink mb-4">Analyse Syntaxique Intelligente</h3>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                  Notre éditeur identifie les mots-clés manquants par rapport à votre secteur d&apos;activité, sans forcer la sur-optimisation artificielle.
                </p>
              </div>
              {/* Fake AI suggestion box */}
              <div className="mt-8 bg-surface-container-high p-4 border border-parchment-border rounded-sm">
                <span className="font-caption text-caption text-ink uppercase mb-2 block">Note de l&apos;éditeur</span>
                <p className="font-body-md text-body-md text-on-surface-variant text-sm italic">
                  &quot;Envisagez de remplacer &apos;géré une équipe&apos; par &apos;dirigé une équipe cross-fonctionnelle de 10 personnes&apos; pour un meilleur impact.&quot;
                </p>
              </div>
            </div>
            {/* Card 2 */}
            <div className="md:col-span-1 bg-surface border border-parchment-border p-8 hover:border-clay-accent transition-colors flex flex-col justify-between min-h-[320px]">
              <div>
                <span className="material-symbols-outlined text-ink text-3xl mb-4" data-icon="format_align_left">format_align_left</span>
                <h3 className="font-headline-md text-headline-md text-ink mb-4">Typographie Premium</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Basé sur les standards de l&apos;édition imprimée. Des hiérarchies claires pour une lisibilité maximale.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="w-full max-w-2xl mx-auto px-margin-mobile md:px-margin-desktop py-24 text-center">
          <h2 className="font-headline-lg text-headline-lg text-ink mb-6">Prêt à imprimer votre carrière ?</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-10">
            Construisez un CV qui respecte les règles des machines et capte l&apos;attention des humains.
          </p>
          <Link className="inline-flex bg-success-green text-on-primary px-8 py-4 rounded font-label-md text-label-md items-center justify-center min-h-[44px] hover:bg-tertiary transition-colors" href="/signup">Créer mon CV gratuitement</Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low border-t border-parchment-border full-width bottom">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-margin-desktop py-12 max-w-max-width mx-auto">
          <div className="mb-6 md:mb-0">
            <span className="text-headline-md font-headline-md font-bold text-ink block mb-2">EasyWork</span>
            <span className="font-caption text-caption text-on-surface-variant">© 2026 EasyWork. Editorial Professionalism.</span>
          </div>
          <div className="flex gap-8">
            <Link className="text-on-surface-variant font-label-sm text-label-sm hover:text-primary transition-colors" href="#legal">Mentions Légales</Link>
            <Link className="text-on-surface-variant font-label-sm text-label-sm hover:text-primary transition-colors" href="#rgpd">RGPD</Link>
            <Link className="text-on-surface-variant font-label-sm text-label-sm hover:text-primary transition-colors" href="#support">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
