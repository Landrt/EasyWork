"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AnalysisPage() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) {
      setError('Veuillez coller une description de poste.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Try backend first
      const backendBase = process.env.NEXT_PUBLIC_API_URL;
      if (backendBase) {
        try {
          const res = await fetch(`${backendBase}/ats/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ job_description: jobDescription }),
          });
          if (res.ok) {
            const data = await res.json();
            sessionStorage.setItem('matchingResult', JSON.stringify(data));
            sessionStorage.setItem('jobDescription', jobDescription);
            router.push('/matching');
            return;
          }
        } catch (backendErr) {
          console.warn('Backend unavailable, falling back to Deepseek AI');
        }
      }

      // Fallback: Deepseek AI analysis
      const res = await fetch('/api/ai/analyze-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'analyse.');
      }

      // Store results in sessionStorage to pass to matching page
      sessionStorage.setItem('matchingResult', JSON.stringify(data));
      sessionStorage.setItem('jobDescription', jobDescription);
      router.push('/matching');
    } catch (e: any) {
      setError(e.message || 'Une erreur est survenue. Vérifiez votre clé API Deepseek dans .env.local.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md">
      {/* Top Navigation (Context: Transactional/Task - Suppressed standard nav, using a simplified header) */}
      <header className="border-b border-parchment-border bg-background w-full">
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-max-width mx-auto">
          <Link className="text-headline-md font-headline-md font-bold text-ink" href="/">EasyWork</Link>
          <button className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2" onClick={() => window.history.back()}>
            <span className="material-symbols-outlined" data-icon="close">close</span>
            <span className="text-label-md font-label-md hidden md:inline">Annuler</span>
          </button>
        </div>
      </header>

      <main className="flex-grow w-full max-w-3xl mx-auto px-margin-mobile md:px-gutter py-12 md:py-24">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-display-lg font-display-lg text-ink">Quelle offre visez-vous ?</h1>
            <p className="text-body-lg font-body-lg text-on-surface-variant max-w-xl mx-auto">Collez la description de l&apos;offre d&apos;emploi ci-dessous pour que nous puissions adapter votre CV aux attentes du recruteur.</p>
          </div>

          <div className="bg-surface-container-low border border-parchment-border rounded p-6 shadow-sm">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="block text-label-sm font-label-sm uppercase text-on-surface-variant" htmlFor="job-description">Description de l&apos;offre</label>
                <textarea 
                  className="w-full border-b border-parchment-border bg-transparent focus:border-ink focus:ring-0 text-body-md font-body-md text-ink placeholder:text-outline-variant resize-y p-4 border-l border-r border-t rounded" 
                  id="job-description" 
                  name="job-description" 
                  placeholder="Collez le texte complet de l'offre d'emploi ici..." 
                  rows={12}
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                ></textarea>
              </div>
              {error && <p className="text-error text-sm">{error}</p>}
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-parchment-border pt-4 gap-4 sm:gap-0">
                <button className="text-primary text-label-md font-label-md flex items-center gap-2 hover:opacity-80 transition-opacity" type="button" onClick={() => { navigator.clipboard.readText().then(text => setJobDescription(text)).catch(() => {}); }}>
                  <span className="material-symbols-outlined" data-icon="qr_code_scanner">qr_code_scanner</span>
                  Coller depuis le presse-papier
                </button>
                <button className="bg-success-green text-on-primary text-label-md font-label-md px-6 py-3 rounded min-h-[44px] flex items-center justify-center gap-2 hover:bg-tertiary-container transition-colors w-full sm:w-auto disabled:opacity-60" type="submit" disabled={loading}>
                  <span>{loading ? 'Analyse en cours...' : 'Analyser l\'offre'}</span>
                  <span className="material-symbols-outlined" data-icon="arrow_forward">arrow_forward</span>
                </button>
              </div>
            </form>
          </div>

          <div className="flex justify-center">
            <div className="bg-surface border border-parchment-border rounded p-4 flex items-start gap-4 max-w-lg">
              <span className="material-symbols-outlined text-clay-accent" data-icon="lightbulb">lightbulb</span>
              <div>
                <h4 className="text-label-md font-label-md text-ink mb-1">Conseil d&apos;expert</h4>
                <p className="text-caption font-caption text-on-surface-variant">Notre IA identifiera les mots-clés ATS et les compétences requises pour structurer votre CV de manière optimale. Plus la description est complète, plus l&apos;analyse sera précise.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-parchment-border bg-surface-container-low w-full mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-8 max-w-max-width mx-auto text-caption font-caption text-on-surface-variant">
          <p>© 2026 EasyWork. Editorial Professionalism.</p>
        </div>
      </footer>
    </div>
  );
}
