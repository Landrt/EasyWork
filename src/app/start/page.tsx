"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApi } from '@/lib/api';

export default function StartPage() {
  const router = useRouter();
  const { fetch: apiFetch } = useApi();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => setTemplates(data.templates || []))
      .catch(err => console.error("Error fetching templates:", err));
  }, []);

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
          <h1 className="text-display-lg font-display-lg text-ink mb-4">Comment souhaitez-vous commencer ?</h1>
          <p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl mx-auto">Choisissez un modèle professionnel ou importez un document existant pour structurer votre parcours avec précision et autorité.</p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">

          {/* Import Option */}
          <div
            className="bg-surface border border-parchment-border rounded hover:border-clay-accent transition-colors duration-300 p-8 flex flex-col items-center justify-center text-center cursor-pointer group"
            onClick={() => router.push('/import')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter') router.push('/import'); }}
          >
            <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-6 group-hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-3xl text-ink">upload_file</span>
            </div>
            <h2 className="text-headline-md font-headline-md text-ink mb-2">Importer un document</h2>
            <p className="text-body-md font-body-md text-on-surface-variant mb-6">Mettez à jour un CV existant. Notre IA analysera et extraira vos données pour les structurer selon les standards ATS.</p>
            <span className="px-6 py-3 bg-transparent border border-clay-accent text-ink text-label-sm font-label-sm uppercase rounded group-hover:bg-surface-container-lowest transition-colors">
              Importer PDF / Word
            </span>
          </div>

          {/* Template Gallery */}
          <div className="bg-surface border border-parchment-border rounded p-8 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-headline-md font-headline-md text-ink mb-1">Galerie de modèles</h2>
                <p className="text-body-md font-body-md text-on-surface-variant">
                  {selectedTemplate
                    ? `Modèle sélectionné : ${templates.find(t => t.id === selectedTemplate)?.name || selectedTemplate}`
                    : "Cliquez sur un modèle pour commencer"}
                </p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant">grid_view</span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar mb-6">
              {templates.length > 0 ? (
                templates.map(tpl => (
                  <button
                    key={tpl.id}
                    className={"relative group border-2 rounded overflow-hidden template-card w-full text-left" + (selectedTemplate === tpl.id ? ' selected' : ' border-parchment-border')}
                    onClick={() => setSelectedTemplate(tpl.id)}
                    disabled={creating}
                    aria-label={`Sélectionner le modèle ${tpl.name}`}
                  >
                    <img className="w-full h-auto object-cover group-hover:opacity-90 transition-opacity aspect-[21/29]" alt={tpl.name} src={tpl.url} />
                    <div className={"absolute inset-0 transition-colors flex items-center justify-center" + (selectedTemplate === tpl.id ? ' bg-ink/30' : ' bg-ink/0 group-hover:bg-ink/40')}>
                      <span className={"text-on-primary text-label-sm font-label-sm uppercase tracking-wider bg-ink px-4 py-2 rounded transition-opacity" + (selectedTemplate === tpl.id ? ' opacity-100' : ' opacity-0 group-hover:opacity-100')}>
                        {selectedTemplate === tpl.id ? '✓ Sélectionné' : 'Sélectionner'}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-surface/90 border-t border-parchment-border px-3 py-2">
                      <p className="text-label-sm font-label-sm text-ink truncate">{tpl.name}</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="col-span-2 lg:col-span-3 py-12 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[32px] mb-2 opacity-50">imagesmode</span>
                  <p>Aucun modèle trouvé dans le dossier templates.</p>
                </div>
              )}
            </div>

            {/* CTA button below the gallery */}
            <button
              className="w-full py-3 px-6 bg-success-green text-on-primary text-label-md font-label-md uppercase rounded hover:bg-tertiary-container transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              disabled={!selectedTemplate || creating}
              onClick={handleCreateCv}
            >
              {creating ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  Création en cours...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  {selectedTemplate ? `Continuer avec ${templates.find(t => t.id === selectedTemplate)?.name || selectedTemplate}` : 'Sélectionnez un modèle'}
                </>
              )}
            </button>
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
