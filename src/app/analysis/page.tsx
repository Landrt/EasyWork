"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CandidateNavbar from '@/components/CandidateNavbar';

export default function AnalysisPage() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCv, setActiveCv] = useState<any>(null);
  const [activeCvTitle, setActiveCvTitle] = useState('Votre CV en cours');

  useEffect(() => {
    // 1. Récupérer le CV actuellement édité ou importé
    const stored = sessionStorage.getItem('current_cv') || sessionStorage.getItem('importedProfile');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setActiveCv(parsed);
        const title = parsed.header?.title || parsed.title || parsed.header?.name || 'CV actif';
        setActiveCvTitle(title);
        return;
      } catch (e) {}
    }

    // 2. Sinon, interroger l'API pour récupérer le dernier CV ou profil candidat
    const loadBackendCv = async () => {
      try {
        const backendBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
        const res = await fetch(`${backendBase}/cvs?limit=1`, { credentials: 'include' });
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && list.length > 0) {
            const latest = list[0];
            setActiveCv(latest);
            setActiveCvTitle(latest.title || 'CV Principal');
            return;
          }
        }

        // Repli sur le profil candidat
        const pRes = await fetch(`${backendBase}/profile`, { credentials: 'include' });
        if (pRes.ok) {
          const prof = await pRes.json();
          setActiveCv(prof);
          setActiveCvTitle(prof.headline || 'Profil candidat');
        }
      } catch (e) {}
    };

    loadBackendCv();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) {
      setError('Veuillez coller une description de poste.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Analyse IA avec le CV RÉEL du candidat
      const res = await fetch('/api/ai/analyze-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription,
          cvData: activeCv
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'analyse.');
      }

      // Stocker les résultats réels pour la page de matching
      sessionStorage.setItem('matchingResult', JSON.stringify(data));
      sessionStorage.setItem('jobDescription', jobDescription);
      sessionStorage.setItem('analyzedCvTitle', activeCvTitle);
      router.push('/matching');
    } catch (e: any) {
      setError(e.message || 'Une erreur est survenue lors de l\'analyse.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md">
      <CandidateNavbar />

      <main className="flex-grow w-full max-w-3xl mx-auto px-margin-mobile md:px-gutter py-12 md:py-16">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-display-lg font-display-lg text-ink">Quelle offre visez-vous ?</h1>
            <p className="text-body-lg font-body-lg text-on-surface-variant max-w-xl mx-auto">
              Collez la description de l'offre d'emploi pour mesurer l'adéquation exacte de votre CV face aux exigences du recruteur.
            </p>

            {/* Badge CV analysé */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-low border border-parchment-border text-xs text-ink font-medium">
              <span className="material-symbols-outlined text-[16px] text-success-green">verified</span>
              <span>Analyse sur votre CV : <strong>{activeCvTitle}</strong></span>
            </div>
          </div>

          <div className="bg-surface-container-low border border-parchment-border rounded p-6 shadow-sm">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="block text-label-sm font-label-sm uppercase text-on-surface-variant" htmlFor="job-description">
                  Description de l'offre
                </label>
                <textarea 
                  className="w-full border-b border-parchment-border bg-transparent focus:border-ink focus:ring-0 text-body-md font-body-md text-ink placeholder:text-outline-variant resize-y p-4 border-l border-r border-t rounded" 
                  id="job-description" 
                  name="job-description" 
                  placeholder="Collez le texte complet de l'offre d'emploi ici (missions, profil recherché, compétences requises)..." 
                  rows={12}
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                ></textarea>
              </div>

              {error && <p className="text-error text-sm">{error}</p>}

              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-parchment-border pt-4 gap-4 sm:gap-0">
                <button 
                  className="text-primary text-label-md font-label-md flex items-center gap-2 hover:opacity-80 transition-opacity" 
                  type="button" 
                  onClick={() => { navigator.clipboard.readText().then(text => setJobDescription(text)).catch(() => {}); }}
                >
                  <span className="material-symbols-outlined" data-icon="qr_code_scanner">qr_code_scanner</span>
                  Coller depuis le presse-papier
                </button>
                <button 
                  className="bg-success-green text-on-primary text-label-md font-label-md px-6 py-3 rounded min-h-[44px] flex items-center justify-center gap-2 hover:bg-tertiary-container transition-colors w-full sm:w-auto disabled:opacity-60" 
                  type="submit" 
                  disabled={loading}
                >
                  <span>{loading ? 'Analyse de votre CV en cours...' : 'Analyser avec mon CV'}</span>
                  <span className="material-symbols-outlined">radar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
