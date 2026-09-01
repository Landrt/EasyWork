"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CV {
  id: string;
  title: string;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [recentCvs, setRecentCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState('');

  useEffect(() => {
    const fetchCvs = async () => {
      setLoading(true);
      try {
        const backendBase = process.env.NEXT_PUBLIC_API_URL;
        if (backendBase) {
          const res = await fetch(`${backendBase}/cvs?limit=3`, { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            setRecentCvs(data);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Backend unavailable for CVs, checking localStorage');
      }

      // Fallback to localStorage
      const localCvs = localStorage.getItem('my_cvs');
      if (localCvs) {
        try {
          setRecentCvs(JSON.parse(localCvs));
        } catch (e) {}
      } else {
        // Dummy data just to show something if nothing exists locally yet
        setRecentCvs([
          { id: 'cv-1', title: 'Marketing Manager Tech', created_at: new Date().toISOString() }
        ]);
      }
      setLoading(false);
    };

    fetchCvs();
  }, []);

  const handleAnalyzeJob = () => {
    if (!jobDescription.trim()) return;
    sessionStorage.setItem('jobDescription', jobDescription);
    router.push('/analysis');
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <style dangerouslySetInnerHTML={{__html: `
          .card-hover { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
          .card-hover:hover { border-color: var(--color-clay-accent); box-shadow: inset 0 0 0 2px rgba(184, 177, 165, 0.1); }
      `}} />

      {/* TopNavBar */}
      <header className="bg-surface border-b border-parchment-border w-full flex-none relative z-10">
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-max-width mx-auto">
          <div className="text-headline-md font-headline-md font-bold text-ink">
            <Link href="/">EasyWork</Link>
          </div>
          <nav className={`md:flex space-x-8 items-center h-full ${mobileNavOpen ? 'flex flex-col absolute top-full left-0 w-full bg-surface border-b border-parchment-border p-4 space-y-4 space-x-0' : 'hidden'}`}>
            <Link className="text-primary font-bold border-b-2 border-primary pb-1 text-label-sm font-label-sm uppercase tracking-wider h-full flex items-center pt-1" href="/dashboard">Mes CV</Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors text-label-sm font-label-sm uppercase tracking-wider opacity-80 hover:opacity-100" href="/profile">Mon profil</Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors text-label-sm font-label-sm uppercase tracking-wider opacity-80 hover:opacity-100" href="/settings">Réglages</Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors text-label-sm font-label-sm uppercase tracking-wider opacity-80 hover:opacity-100" href="/affiliate">Affilié</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <button className="md:hidden text-on-surface-variant" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
              <span className="material-symbols-outlined">{mobileNavOpen ? 'close' : 'menu'}</span>
            </button>
            <div className="w-10 h-10 rounded-full border border-parchment-border overflow-hidden bg-surface-variant hidden md:block">
              <span className="material-symbols-outlined w-full h-full flex items-center justify-center text-on-surface-variant">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-16">
        <div className="mb-12">
          <h1 className="text-display-lg font-display-lg text-ink mb-2">Tableau de bord</h1>
          <p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl">Gérez votre profil professionnel. Créez de nouveaux documents, analysez-les par rapport aux offres d'emploi, et suivez vos candidatures.</p>
        </div>

        {/* Mission Control Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-16">
          {/* Create New CV */}
          <Link className="group bg-surface-container-low border border-parchment-border rounded p-6 flex flex-col items-start card-hover h-full min-h-[200px] justify-between relative overflow-hidden" href="/start">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-[64px]">post_add</span>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center mb-6 shadow-sm">
                <span className="material-symbols-outlined">add</span>
              </div>
              <h2 className="text-headline-md font-headline-md text-ink mb-2">Créer un CV</h2>
              <p className="text-body-md font-body-md text-on-surface-variant">Démarrez avec l'assistant IA ou un template vierge.</p>
            </div>
            <div className="mt-6 flex items-center text-primary font-label-md text-label-md group-hover:translate-x-1 transition-transform">
              Commencer <span className="material-symbols-outlined ml-1 text-sm">arrow_forward</span>
            </div>
          </Link>
          
          {/* Import CV */}
          <Link className="group bg-surface-container-lowest border border-parchment-border rounded p-6 flex flex-col items-start card-hover h-full min-h-[200px] justify-between" href="/import">
            <div>
              <div className="w-12 h-12 rounded-full border border-clay-accent bg-transparent text-ink flex items-center justify-center mb-6">
                <span className="material-symbols-outlined">upload_file</span>
              </div>
              <h2 className="text-headline-md font-headline-md text-ink mb-2">Importer un CV</h2>
              <p className="text-body-md font-body-md text-on-surface-variant">Uploadez un PDF existant pour extraire vos données automatiquement.</p>
            </div>
            <div className="mt-6 flex items-center text-ink font-label-md text-label-md group-hover:translate-x-1 transition-transform">
              Uploader un fichier <span className="material-symbols-outlined ml-1 text-sm">arrow_forward</span>
            </div>
          </Link>

          {/* Match with Job */}
          <div className="bg-surface-bright border border-parchment-border rounded p-6 flex flex-col h-full min-h-[200px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-headline-lg-mobile font-headline-lg-mobile text-ink">Analyse d'Offre ATS</h2>
              <span className="material-symbols-outlined text-clay-accent">radar</span>
            </div>
            <p className="text-body-md font-body-md text-on-surface-variant mb-6 flex-grow">Collez une description de poste pour analyser immédiatement votre compatibilité.</p>
            <div className="relative w-full flex gap-2">
              <input 
                className="w-full bg-transparent border-b border-parchment-border focus:border-ink py-2 text-body-md font-body-md text-ink placeholder-on-surface-variant outline-none transition-colors" 
                placeholder="Collez l'offre ici..." 
                type="text"
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAnalyzeJob()}
              />
              <button 
                className="text-ink hover:text-primary px-2" 
                onClick={handleAnalyzeJob}
                disabled={!jobDescription.trim()}
              >
                <span className="material-symbols-outlined">search</span>
              </button>
            </div>
          </div>
        </section>

        {/* Recent CVs List */}
        <section>
          <div className="flex justify-between items-end mb-6 pb-2 border-b border-parchment-border">
            <h2 className="text-headline-lg font-headline-lg text-ink">Documents Récents</h2>
          </div>
          <div className="flex flex-col space-y-4">
            {loading ? (
              <div className="p-8 text-center text-on-surface-variant flex flex-col items-center">
                <span className="material-symbols-outlined animate-spin text-[32px] text-clay-accent mb-2">autorenew</span>
                Chargement...
              </div>
            ) : recentCvs.length > 0 ? (
              recentCvs.map((cv) => (
                <div key={cv.id} className="bg-surface-container-lowest border border-parchment-border rounded p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between card-hover gap-4">
                  <div className="flex items-center gap-4 md:w-1/3">
                    <div className="w-10 h-14 bg-surface-variant border border-outline-variant flex items-center justify-center shrink-0 shadow-sm relative">
                      <span className="material-symbols-outlined text-on-surface-variant text-[20px]">description</span>
                    </div>
                    <div>
                      <h3 className="text-headline-md font-headline-md text-ink text-lg leading-tight mb-1">{cv.title || 'CV sans titre'}</h3>
                      <p className="text-caption font-caption text-on-surface-variant">Dernière modif : {new Date(cv.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end pt-4 md:pt-0 mt-2 md:mt-0">
                    <button className="h-10 px-3 flex items-center justify-center border border-parchment-border text-on-surface-variant rounded hover:bg-surface-container-low transition-colors" title="Dupliquer">
                      <span className="material-symbols-outlined text-[18px]">content_copy</span>
                    </button>
                    <button className="h-10 px-3 flex items-center justify-center border border-parchment-border text-error rounded hover:bg-error-container transition-colors" title="Supprimer">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                    <Link href={`/editor/${cv.id}`} className="h-10 px-6 flex items-center gap-2 bg-ink text-on-primary rounded hover:opacity-90 transition-opacity text-label-md font-label-md">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      Éditer
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-on-surface-variant bg-surface border border-dashed border-parchment-border rounded">
                Aucun document récent. <Link href="/start" className="text-primary hover:underline">Créez votre premier CV !</Link>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low border-t border-parchment-border mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-margin-desktop py-12 max-w-max-width mx-auto">
          <div className="text-headline-md font-headline-md font-bold text-ink mb-6 md:mb-0">EasyWork</div>
          <div className="flex flex-wrap justify-center gap-6 mb-6 md:mb-0">
            <Link className="text-on-surface-variant text-label-sm font-label-sm hover:text-primary transition-colors" href="/legal">Mentions Légales</Link>
            <Link className="text-on-surface-variant text-label-sm font-label-sm hover:text-primary transition-colors" href="/privacy">RGPD</Link>
            <Link className="text-on-surface-variant text-label-sm font-label-sm hover:text-primary transition-colors" href="/support">Support</Link>
          </div>
          <div className="text-body-md font-body-md text-on-surface-variant text-sm">
            © 2026 EasyWork. Editorial Professionalism.
          </div>
        </div>
      </footer>
    </div>
  );
}
