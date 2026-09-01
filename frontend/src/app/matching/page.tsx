"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface MatchingResult {
  jobTitle: string;
  score: number;
  scoreLabel: string;
  strengths: { skill: string; detail: string }[];
  gaps: { skill: string; detail: string }[];
  keywords: string[];
}

export default function MatchingPage() {
  const router = useRouter();
  const [result, setResult] = useState<MatchingResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('matchingResult');
    if (stored) {
      try {
        setResult(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse matching result');
      }
    }
    setLoading(false);
  }, []);

  // Calculate stroke offset for the score gauge (283 = full circle circumference)
  const strokeOffset = result ? 283 - (283 * result.score) / 100 : 283;
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md">
      <style dangerouslySetInnerHTML={{__html: `
        .material-symbols-outlined {
            font-family: 'Material Symbols Outlined';
            font-weight: normal;
            font-style: normal;
            font-size: 24px;
            display: inline-block;
            line-height: 1;
            text-transform: none;
            letter-spacing: normal;
            word-wrap: normal;
            white-space: nowrap;
            direction: ltr;
        }
      `}} />

      {/* TopNavBar */}
      <nav className="bg-surface border-b border-parchment-border docked full-width top-0 sticky z-50">
        <div className="flex justify-between items-center w-full px-margin-desktop py-4 max-w-max-width mx-auto">
          <div className="flex items-center gap-8">
            <Link className="text-headline-md font-headline-md font-bold text-ink" href="/">EasyWork</Link>
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <Link className="text-primary font-bold border-b-2 border-primary pb-1 text-label-sm font-label-sm" href="/dashboard">Mes CV</Link>
              <Link className="text-on-surface-variant hover:text-primary transition-colors duration-200 text-label-sm font-label-sm" href="/profile">Mon profil</Link>
              <Link className="text-on-surface-variant hover:text-primary transition-colors duration-200 text-label-sm font-label-sm" href="/settings">Réglages</Link>
              <Link className="text-on-surface-variant hover:text-primary transition-colors duration-200 text-label-sm font-label-sm" href="/affiliate">Affilié</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-8 h-8 rounded-full overflow-hidden border border-parchment-border hover:border-clay-accent transition-colors" onClick={() => router.push('/settings')}>
              <img alt="Photo de profil utilisateur" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMoPC5zkTPtro4pkZdTpwOiIHgD516CgBPfJJPRSjf9LkmnJ0A1YQtgFWiOLCNC2Kpe8pGHiQKoKSy1RfEC3f70zF6M9yqVXuW8BjOy3BSiLdZcEHcoXLoJ2H53SkZ6XxK3UhkKf2UMdrykG7QYJJEWX9ICgBV1G61G2BkqN25Bri8hLuyWtGk8Y0TwRJZldQs3uFRtTBajCTfyt1_aS6E9gGDdA9VjIQekshd9SbtADvVBMhgQlxq"/>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <header className="mb-12">
          <h1 className="text-headline-lg font-headline-lg text-ink mb-2">Analyse de Matching ATS</h1>
          <p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl">
            {loading ? 'Chargement...' : result 
              ? `Comparaison de votre profil avec les exigences du poste "${result.jobTitle}".`
              : 'Aucune analyse disponible. Revenez à la page précédente pour analyser une offre.'
            }
          </p>
        </header>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <span className="material-symbols-outlined animate-spin text-[48px] text-clay-accent">autorenew</span>
          </div>
        )}

        {!loading && !result && (
          <div className="text-center py-16 flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-[64px] text-on-surface-variant opacity-40">analytics</span>
            <p className="text-body-lg text-on-surface-variant">Aucun résultat d'analyse trouvé.</p>
            <button className="bg-ink text-on-primary px-6 py-3 rounded text-label-md font-label-md" onClick={() => router.push('/analysis')}>
              Analyser une offre
            </button>
          </div>
        )}

        {!loading && result && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            {/* Left Pane: ATS Score */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* ATS Score Card */}
              <div className="bg-surface p-6 border border-parchment-border rounded">
                <h2 className="text-label-sm font-label-sm uppercase text-on-surface-variant mb-6 tracking-wider">Score de Matching ATS</h2>
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="relative w-48 h-48 flex items-center justify-center mb-4">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle className="text-surface-container-high" cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeWidth="2"></circle>
                      <circle 
                        className="text-primary transition-all duration-1000 ease-out" 
                        cx="50" cy="50" fill="none" r="45" 
                        stroke="currentColor" 
                        strokeDasharray="283" 
                        strokeDashoffset={strokeOffset} 
                        strokeWidth="4"
                      ></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-display-lg font-display-lg text-ink">{result.score}<span className="text-headline-md font-headline-md">%</span></span>
                    </div>
                  </div>
                  <p className="text-body-md font-body-md text-on-surface-variant text-center">{result.scoreLabel}</p>
                </div>
              </div>

              {/* Action / Paywall */}
              <div className="bg-surface-container-low p-6 border border-clay-accent rounded relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2">
                  <span className="material-symbols-outlined text-clay-accent" style={{fontVariationSettings: "'FILL' 1"}}>workspace_premium</span>
                </div>
                <h3 className="text-headline-md font-headline-md text-ink mb-3">Débloquer l&apos;Analyse Complète</h3>
                <p className="text-body-md font-body-md text-on-surface-variant mb-6">Passez au plan Premium pour voir tous les mots-clés manquants et générer des puces optimisées par l&apos;IA.</p>
                <button className="w-full bg-success-green text-on-primary py-3 px-6 rounded hover:opacity-90 transition-colors text-label-md font-label-md" onClick={() => router.push('/pricing')}>
                  Optimiser mon CV avec l&apos;IA
                </button>
              </div>
            </div>

            {/* Right Pane: Strengths & Gaps */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Job Context */}
              <div className="bg-surface p-6 border border-parchment-border rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-label-sm font-label-sm uppercase text-on-surface-variant mb-1">Poste Ciblé</h3>
                  <p className="text-body-lg font-body-lg text-ink">{result.jobTitle}</p>
                </div>
                <button className="text-label-md font-label-md text-on-surface-variant underline hover:text-primary transition-colors" onClick={() => router.push('/analysis')}>
                  Analyser une autre offre
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Points forts */}
                <div className="bg-surface p-6 border border-parchment-border rounded">
                  <div className="flex items-center gap-2 mb-6 border-b border-parchment-border pb-4">
                    <span className="material-symbols-outlined text-success-green">check_circle</span>
                    <h3 className="text-headline-md font-headline-md text-ink">Points forts</h3>
                  </div>
                  <ul className="space-y-4">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-success-green mt-0.5 text-[20px]">check</span>
                        <div>
                          <p className="text-body-md font-body-md text-ink font-medium">{s.skill}</p>
                          <p className="text-caption font-caption text-on-surface-variant">{s.detail}</p>
                        </div>
                      </li>
                    ))}
                    {result.strengths.length === 0 && (
                      <p className="text-caption text-on-surface-variant">Aucun point fort identifié.</p>
                    )}
                  </ul>
                </div>

                {/* Manques */}
                <div className="bg-surface p-6 border border-parchment-border rounded">
                  <div className="flex items-center gap-2 mb-6 border-b border-parchment-border pb-4">
                    <span className="material-symbols-outlined text-error">warning</span>
                    <h3 className="text-headline-md font-headline-md text-ink">Manques</h3>
                  </div>
                  <ul className="space-y-4 relative">
                    {result.gaps.slice(0, 2).map((g, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-error mt-0.5 text-[20px]">close</span>
                        <div>
                          <p className="text-body-md font-body-md text-ink font-medium">{g.skill}</p>
                          <p className="text-caption font-caption text-on-surface-variant">{g.detail}</p>
                        </div>
                      </li>
                    ))}
                    {/* Blurred for paywall */}
                    {result.gaps.slice(2).map((g, i) => (
                      <li key={i} className="flex items-start gap-3 opacity-40 blur-[2px] select-none pointer-events-none">
                        <span className="material-symbols-outlined text-error mt-0.5 text-[20px]">close</span>
                        <div>
                          <p className="text-body-md font-body-md text-ink font-medium">{g.skill}</p>
                          <p className="text-caption font-caption text-on-surface-variant">{g.detail}</p>
                        </div>
                      </li>
                    ))}
                    {result.gaps.length > 2 && (
                      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-surface to-transparent flex items-end justify-center pb-2">
                        <span className="text-caption font-caption text-primary font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">lock</span>
                          Premium
                        </span>
                      </div>
                    )}
                    {result.gaps.length === 0 && (
                      <p className="text-caption text-on-surface-variant">Aucun manque critique détecté !</p>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low border-t border-parchment-border mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-margin-desktop py-12 max-w-max-width mx-auto gap-6 md:gap-0">
          <div className="text-headline-md font-headline-md font-bold text-ink">EasyWork</div>
          <div className="flex items-center gap-6">
            <Link className="text-on-surface-variant hover:text-primary transition-colors text-label-sm font-label-sm" href="/legal">Mentions Légales</Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors text-label-sm font-label-sm" href="/privacy">RGPD</Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors text-label-sm font-label-sm" href="/support">Support</Link>
          </div>
          <div className="text-on-surface-variant text-body-md font-body-md">
            © 2026 EasyWork. Editorial Professionalism.
          </div>
        </div>
      </footer>
    </div>
  );
}
