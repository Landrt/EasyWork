"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApi } from '@/lib/api';
import { TEMPLATES } from '@/components/templates';

export default function StartPage() {
  const router = useRouter();
  const { fetch: apiFetch } = useApi();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const handleCreateCv = async () => {
    if (!selectedTemplate) return;
    setCreating(true);
    try {
      if (process.env.NEXT_PUBLIC_API_URL) {
        const cv = await apiFetch('/cvs', {
          method: 'POST',
          body: JSON.stringify({
            title: 'Mon CV',
            template: selectedTemplate,
          }),
        });
        router.push(`/onboarding?cvId=${cv.id}&template=${selectedTemplate}`);
        return;
      }
      throw new Error("No backend");
    } catch {
      router.push(`/onboarding?template=${selectedTemplate}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: var(--color-parchment-border); border-radius: 4px; }
        .template-card { transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s; }
        .template-card:hover { transform: translateY(-2px); border-color: var(--color-clay-accent); }
        .template-card.selected { border-color: var(--color-success-green); box-shadow: 0 0 0 2px var(--color-success-green); }
      `}} />

      {/* TopNavBar */}
      <nav className="bg-surface border-b border-parchment-border docked full-width top-0 z-50">
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-max-width mx-auto">
          <Link className="text-headline-md font-headline-md font-bold text-ink hover:text-primary transition-colors duration-200" href="/">
            EasyWork
          </Link>
          <div className="hidden md:flex space-x-8">
            <Link className="text-label-sm font-label-sm text-primary font-bold border-b-2 border-primary pb-1" href="/dashboard">Mes CV</Link>
            <Link className="text-label-sm font-label-sm text-on-surface-variant hover:text-primary transition-colors duration-200" href="/profile">Mon profil</Link>
            <Link className="text-label-sm font-label-sm text-on-surface-variant hover:text-primary transition-colors duration-200" href="/settings">Réglages</Link>
            <Link className="text-label-sm font-label-sm text-on-surface-variant hover:text-primary transition-colors duration-200" href="/affiliate">Affilié</Link>
          </div>
          <div className="flex items-center gap-4">
            <button className="md:hidden text-on-surface-variant hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
            <img alt="Photo de profil utilisateur" className="w-10 h-10 rounded-full border border-parchment-border hidden md:block object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzO5fPLdAwmk6v5LjB53aP35xD_XSWYIqdXbmNUsQA7sirYHYamrQ-uP4SrYUXl4uP7CQpn9y18Oc3PWsgJSU01zNBMkXNQ-B1MvWx-Zcv5aTF9-wi-KSTYIV-WAPBocTnnFbhYcYR2PTINVHgGtRuy5sogM1gYlc6yn3y6kIki-sVD5Vir9cX060UWzmB-ifo6AXhSJJGznvpg5vrdFRZvMjfuiDt4TEJZtvEFHty0y71mg62ixHj"/>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-surface border-t border-parchment-border px-margin-mobile py-4 flex flex-col gap-4">
            <Link className="text-label-sm font-label-sm text-on-surface-variant uppercase" href="/dashboard" onClick={() => setMobileMenuOpen(false)}>Mes CV</Link>
            <Link className="text-label-sm font-label-sm text-on-surface-variant uppercase" href="/profile" onClick={() => setMobileMenuOpen(false)}>Mon profil</Link>
            <Link className="text-label-sm font-label-sm text-on-surface-variant uppercase" href="/affiliate" onClick={() => setMobileMenuOpen(false)}>Affilié</Link>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-24">
        <div className="text-center mb-16">
          <h1 className="text-display-lg font-display-lg text-ink mb-4">Choisissez un modèle de CV</h1>
          <p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl mx-auto">Sélectionnez un modèle professionnel pour structurer votre parcours avec précision et autorité.</p>
        </div>

        {/* Template Gallery Full Width */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="bg-surface border border-parchment-border rounded p-8 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-headline-md font-headline-md text-ink mb-1">Galerie de modèles</h2>
                <p className="text-body-md font-body-md text-on-surface-variant">
                  {selectedTemplate
                    ? `Modèle sélectionné : ${TEMPLATES.find(t => t.id === selectedTemplate)?.name || selectedTemplate}`
                    : "Cliquez sur un modèle pour commencer"}
                </p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-[32px]">grid_view</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar mb-8">
              {TEMPLATES.length > 0 ? (
                TEMPLATES.map(tpl => (
                  <button
                    key={tpl.id}
                    className={"relative group rounded-xl overflow-hidden template-card w-full text-left transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] " + (selectedTemplate === tpl.id ? ' ring-4 ring-ink ring-offset-2 border-transparent' : ' border-2 border-parchment-border hover:border-clay-accent')}
                    onClick={() => setSelectedTemplate(tpl.id)}
                    disabled={creating}
                    aria-label={`Sélectionner le modèle ${tpl.name}`}
                  >
                    <div className="w-full h-auto aspect-[21/29] bg-surface-container overflow-hidden">
                      {tpl.previewUrl ? (
                        <img 
                          src={tpl.previewUrl} 
                          alt={tpl.name}
                          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4">
                           <span className="material-symbols-outlined text-[48px] opacity-20 mb-2">article</span>
                           <span className="text-on-surface-variant text-center font-serif opacity-50">{tpl.name}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className={"absolute inset-0 transition-all duration-300 flex items-center justify-center " + (selectedTemplate === tpl.id ? ' bg-ink/10' : ' bg-ink/0 group-hover:bg-ink/30')}>
                      <span className={"text-on-primary text-label-sm font-label-sm uppercase tracking-wider bg-ink px-5 py-2.5 rounded-full shadow-lg transition-all duration-300 transform " + (selectedTemplate === tpl.id ? ' opacity-100 scale-100' : ' opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100')}>
                        {selectedTemplate === tpl.id ? '✓ Sélectionné' : 'Choisir ce modèle'}
                      </span>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-md border-t border-parchment-border px-4 py-3 transition-colors group-hover:bg-surface">
                      <p className="text-label-md font-label-md text-ink truncate text-center">{tpl.name}</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="col-span-2 md:col-span-3 lg:col-span-4 py-20 text-center text-on-surface-variant border border-dashed border-parchment-border rounded">
                  <span className="material-symbols-outlined text-[48px] mb-4 opacity-50">imagesmode</span>
                  <p className="text-body-lg font-body-lg">Aucun modèle trouvé dans le dossier templates.</p>
                </div>
              )}
            </div>

            {/* CTA button below the gallery */}
            <div className="flex justify-center border-t border-parchment-border pt-8 mt-auto">
              <button
                className="w-full max-w-md py-4 px-6 bg-success-green text-on-primary text-label-lg font-label-lg uppercase rounded hover:bg-tertiary-container transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                disabled={!selectedTemplate || creating}
                onClick={handleCreateCv}
              >
                {creating ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
                    Création en cours...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
                    {selectedTemplate ? `Continuer avec ${TEMPLATES.find(t => t.id === selectedTemplate)?.name || selectedTemplate}` : 'Sélectionnez un modèle'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low border-t border-parchment-border w-full mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-8 md:py-12 max-w-max-width mx-auto">
          <div className="text-headline-md font-headline-md font-bold text-ink mb-4 md:mb-0">
            EasyWork
          </div>
          <div className="flex flex-wrap justify-center gap-6 mb-4 md:mb-0">
            <Link className="text-label-sm font-label-sm text-on-surface-variant hover:text-primary transition-colors" href="/legal">Mentions Légales</Link>
            <Link className="text-label-sm font-label-sm text-on-surface-variant hover:text-primary transition-colors" href="/privacy">RGPD</Link>
            <Link className="text-label-sm font-label-sm text-on-surface-variant hover:text-primary transition-colors" href="/support">Support</Link>
          </div>
          <div className="text-body-md font-body-md text-on-surface-variant text-center md:text-right">
            © 2026 EasyWork. Editorial Professionalism.
          </div>
        </div>
      </footer>
    </div>
  );
}
