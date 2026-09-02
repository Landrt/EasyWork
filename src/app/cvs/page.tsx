"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApi } from '@/lib/api';

import CandidateNavbar from '@/components/CandidateNavbar';

export default function CvsPage() {
  const router = useRouter();
  const { fetch } = useApi();
  const [cvs, setCvs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCvs = () => {
    fetch('/cvs')
      .then(data => setCvs(data))
      .catch(err => console.error('Failed to fetch CVs:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCvs(); }, []);

  const handleDelete = async (cvId: number) => {
    const confirmed = window.confirm('Supprimer ce CV définitivement ?');
    if (!confirmed) return;
    try {
      await fetch(`/cvs/${cvId}`, { method: 'DELETE' });
      setCvs(prev => prev.filter(cv => cv.id !== cvId));
    } catch (e: any) {
      alert(`Erreur lors de la suppression : ${e.message}`);
    }
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <style dangerouslySetInnerHTML={{__html: `
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}} />

      <CandidateNavbar />

      {/* Main Content */}
      <main className="flex-grow w-full max-w-max-width mx-auto px-margin-desktop py-12">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-display-lg font-display-lg text-ink mb-2">Mes CV</h1>
            <p className="text-body-lg font-body-lg text-on-surface-variant">Gérez et optimisez vos documents professionnels.</p>
          </div>
          <button className="bg-success-green text-on-primary px-6 py-3 rounded text-label-md font-label-md hover:bg-tertiary-container transition-colors flex items-center gap-2" onClick={() => router.push("/start")}>
            <span className="material-symbols-outlined" style={{fontSize: "20px"}}>add</span>
            Nouveau CV
          </button>
        </div>

        {/* CV Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          
          {loading ? (
            <div className="col-span-full p-8 text-center text-on-surface-variant text-body-md">Chargement des CVs...</div>
          ) : cvs.length > 0 ? (
            cvs.map((cv) => (
              <div key={cv.id} className="border border-parchment-border bg-surface rounded hover:border-clay-accent transition-colors duration-300 group flex flex-col h-full">
                <div className="p-4 border-b border-parchment-border bg-surface-container-low flex justify-between items-start">
                  <div>
                    <h3 className="text-headline-md font-headline-md text-ink mb-1">{cv.title || 'CV sans titre'}</h3>
                    <p className="text-caption font-caption text-on-surface-variant">Créé le {new Date(cv.created_at || Date.now()).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="p-4 flex-grow">
                  <div className="h-48 w-full bg-surface-container mb-4 rounded border border-parchment-border relative overflow-hidden flex items-center justify-center">
                    <span className="text-on-surface-variant material-symbols-outlined" style={{fontSize: "48px"}}>description</span>
                  </div>
                </div>
                <div className="p-4 border-t border-parchment-border bg-surface flex justify-between items-center">
                  <Link href={`/editor/${cv.id}`} className="text-primary hover:text-ink text-label-sm font-label-sm flex items-center gap-1 transition-colors">
                    <span className="material-symbols-outlined" style={{fontSize: "16px"}}>edit</span>
                    Modifier
                  </Link>
                  <div className="flex gap-3">
                    <button className="text-on-surface-variant hover:text-error text-label-sm font-label-sm flex items-center gap-1 transition-colors" title="Supprimer" onClick={() => handleDelete(cv.id)}>
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : null}

          {/* Empty State / Add New */}
          <button className="border border-dashed border-outline-variant bg-surface-bright rounded hover:border-primary hover:bg-surface-container-low transition-colors duration-300 flex flex-col items-center justify-center h-full min-h-[350px] p-8 group" onClick={() => router.push("/start")}>
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4 group-hover:bg-primary-fixed-dim transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant" style={{fontSize: "32px"}}>post_add</span>
            </div>
            <span className="text-headline-md font-headline-md text-ink mb-2">Créer un nouveau CV</span>
            <span className="text-body-md font-body-md text-on-surface-variant text-center">Partez de zéro ou dupliquez un existant.</span>
          </button>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low border-t border-parchment-border full-width bottom mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-margin-desktop py-12 max-w-max-width mx-auto">
          <div className="text-headline-md font-headline-md font-bold text-ink mb-4 md:mb-0">EasyWork</div>
          <div className="text-body-md font-body-md text-on-surface-variant mb-4 md:mb-0">
            © 2026 EasyWork. Editorial Professionalism.
          </div>
          <nav className="flex gap-6">
            <Link className="text-on-surface-variant hover:text-primary transition-colors text-label-sm font-label-sm" href="/legal">Mentions Légales</Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors text-label-sm font-label-sm" href="/privacy">RGPD</Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors text-label-sm font-label-sm" href="/support">Support</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
