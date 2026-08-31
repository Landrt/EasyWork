"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useApi } from '@/lib/api';

// Mock cv ID - in production this comes from the URL params
const MOCK_CV_ID = 1;

const EditorPage = () => {
  const { fetch: apiFetch } = useApi();
  const [zoom, setZoom] = useState(100);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  
  // AI Suggestions
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Template States
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templates, setTemplates] = useState<{id: string, name: string, url: string}[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Editor States
  const [editingSection, setEditingSection] = useState<string | null>(null);
  
  // Mock initial data - should be fetched from backend or session
  const [cvData, setCvData] = useState<any>({
    header: { name: 'Jean Dupont', title: 'Directeur Marketing Digital', location: 'Paris, France', email: 'jean.dupont@email.com', phone: '+33 6 12 34 56 78' },
    experience: [],
    education: [],
    skills: []
  });

  useEffect(() => {
    const stored = sessionStorage.getItem('importedProfile');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCvData({
          header: {
            name: parsed.name || '',
            title: parsed.title || 'Titre',
            location: parsed.location || '',
            email: parsed.email || '',
            phone: parsed.phone || ''
          },
          experience: parsed.experiences || [],
          education: parsed.education || [],
          skills: parsed.skills || []
        });
      } catch (e) {
        console.error('Failed to parse profile in Editor', e);
      }
    }
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates');
      const data = await res.json();
      if (data.templates) {
        setTemplates(data.templates);
      }
    } catch (e) {
      console.error('Failed to load templates', e);
    }
  };

  const openTemplateModal = () => {
    fetchTemplates();
    setShowTemplateModal(true);
  };

  const generateSuggestions = async () => {
    setIsGenerating(true);
    setAiError(null);
    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experience: cvData.experience })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur inconnue');
      
      setSuggestions(data.suggestions || []);
    } catch (e: any) {
      setAiError(e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAccept = (id: string, expId: number, pointIndex: number, newText: string) => {
    // Mettre à jour la suggestion
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, accepted: true } : s));
    
    // Mettre à jour le CV data
    const newExperience = [...cvData.experience];
    const expIndex = newExperience.findIndex(e => e.id === expId);
    if (expIndex !== -1 && newExperience[expIndex].highlights[pointIndex] !== undefined) {
      newExperience[expIndex].highlights[pointIndex] = newText;
      setCvData({ ...cvData, experience: newExperience });
    }
  };

  const handleDismiss = (id: string) => {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, dismissed: true } : s));
  };

  const handleExport = () => {
    setExportStatus('Préparation du PDF...');
    // Open print dialog — the browser generates the PDF from the CV preview
    setTimeout(() => {
      window.print();
      setExportStatus('✓ Utilisez "Enregistrer en PDF" dans la fenêtre d\'impression.');
      setTimeout(() => setExportStatus(null), 6000);
    }, 200);
  };

  return (
    <div className="bg-background text-on-background font-body-md h-screen flex flex-col overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .material-symbols-outlined.fill {
            font-variation-settings: 'FILL' 1;
        }
        
        /* Custom scrollbar for an editorial feel */
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background: #cac6bd;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #B8B1A5;
        }

        /* Subtle transition for interactive elements */
        .interactive-element {
            transition: all 0.2s ease-in-out;
        }
        
        .cv-page {
            aspect-ratio: 1 / 1.414; /* A4 aspect ratio */
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
        }

        /* ===== PRINT STYLES ===== */
        @media print {
          /* Cache tout sauf le CV */
          body * { visibility: hidden; }

          /* Affiche uniquement le contenu du CV */
          .cv-page, .cv-page * { visibility: visible; }

          /* Positionne le CV en haut à gauche */
          .cv-page {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 15mm !important;
            box-shadow: none !important;
            transform: none !important;
            min-height: auto !important;
          }

          @page {
            size: A4;
            margin: 0;
          }
        }
      `}} />

      {/* TopNavBar (Authenticated) */}
      <header className="bg-surface border-b border-parchment-border flex-shrink-0 z-50 relative">
        <div className="flex justify-between items-center w-full px-6 py-3 max-w-max-width mx-auto">
          <div className="flex items-center gap-8">
            <Link className="text-headline-md font-headline-md font-bold text-ink" href="/">EasyWork</Link>
            <nav className="hidden md:flex gap-6">
              <Link className="text-primary font-bold border-b-2 border-primary pb-1 text-label-sm font-label-sm uppercase tracking-wide" href="/dashboard">Mes CV</Link>
              <Link className="text-on-surface-variant hover:text-primary transition-colors duration-200 text-label-sm font-label-sm uppercase tracking-wide" href="/profile">Mon profil</Link>
              <Link className="text-on-surface-variant hover:text-primary transition-colors duration-200 text-label-sm font-label-sm uppercase tracking-wide" href="/settings">Réglages</Link>
              <Link className="text-on-surface-variant hover:text-primary transition-colors duration-200 text-label-sm font-label-sm uppercase tracking-wide" href="/affiliate">Affilié</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-transparent border border-clay-accent rounded hover:bg-surface-container-low transition-colors text-label-sm font-label-sm uppercase" onClick={openTemplateModal}>
              <span className="material-symbols-outlined text-[18px]">palette</span>
              Changer de template
            </button>
            {exportStatus && <span className="text-caption text-on-surface-variant">{exportStatus}</span>}
            <button className="flex items-center gap-2 px-4 py-2 bg-success-green text-on-primary rounded hover:bg-on-surface transition-colors text-label-sm font-label-sm uppercase" onClick={handleExport}>
              <span className="material-symbols-outlined text-[18px]">download</span>
              Exporter
            </button>
            <div className="h-8 w-8 rounded-full bg-surface-container-high border border-parchment-border overflow-hidden ml-2 cursor-pointer hover:opacity-80 transition-opacity">
              <img alt="Photo de profil utilisateur" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwrF56KP3zcCaPdWdh_Ua60n5HaItxM_Q3G5GpHbst5TggQyKj3gd-l0HTbWXEeSdQFiZlcmBEvukBE3imrme1CYDpMhdokKwBy83-_W5bj0-eXq7qlGbRbfQc5WdlgAbbe1aBnz6iUXe5zHPhuovjkNTbSy1JbrtHgppr0ImRALbSDyqmvK1eC0L0ELdemGYBXizriFNyEMdmG6Ai9VWYmvBkrOjiFgDPSf7r5ifLqIXYarTH9U_g"/>
            </div>
          </div>
        </div>
      </header>

      {/* Main Editor Layout */}
      <main className="flex-1 flex overflow-hidden bg-background">
        
        {/* Left Pane: Structure (3 cols) */}
        <aside className="w-full md:w-3/12 lg:w-[280px] flex-shrink-0 border-r border-parchment-border bg-surface flex flex-col h-full z-10 hidden md:flex">
          <div className="p-4 border-b border-parchment-border flex justify-between items-center bg-surface-container-low">
            <h2 className="text-label-md font-label-md uppercase tracking-wider text-on-surface">Structure du Document</h2>
            <button className="text-on-surface-variant hover:text-primary transition-colors" onClick={() => setEditingSection('add_new')}>
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Draggable Item 1 */}
            <div className="group flex items-center justify-between p-3 bg-surface border border-parchment-border rounded cursor-move hover:border-clay-accent transition-colors">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px] cursor-grab">drag_indicator</span>
                <div>
                  <p className="text-label-md font-label-md text-on-surface">En-tête</p>
                  <p className="text-caption font-caption text-on-surface-variant">Coordonnées & Titre</p>
                </div>
              </div>
              <button className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary" onClick={() => setEditingSection('header')}>
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
            </div>
            {/* Draggable Item 2 */}
            <div className="group flex items-center justify-between p-3 bg-surface-container-low border border-clay-accent rounded cursor-move shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px] cursor-grab">drag_indicator</span>
                <div>
                  <p className="text-label-md font-label-md text-on-surface">Expérience Professionnelle</p>
                  <p className="text-caption font-caption text-on-surface-variant">3 postes renseignés</p>
                </div>
              </div>
              <button className="text-primary transition-opacity hover:opacity-80" onClick={() => setEditingSection('experience')}>
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
            </div>
            {/* Draggable Item 3 */}
            <div className="group flex items-center justify-between p-3 bg-surface border border-parchment-border rounded cursor-move hover:border-clay-accent transition-colors">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px] cursor-grab">drag_indicator</span>
                <div>
                  <p className="text-label-md font-label-md text-on-surface">Formation</p>
                  <p className="text-caption font-caption text-on-surface-variant">2 diplômes</p>
                </div>
              </div>
              <button className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary" onClick={() => setEditingSection('education')}>
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
            </div>
            {/* Draggable Item 4 */}
            <div className="group flex items-center justify-between p-3 bg-surface border border-parchment-border rounded cursor-move hover:border-clay-accent transition-colors">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px] cursor-grab">drag_indicator</span>
                <div>
                  <p className="text-label-md font-label-md text-on-surface">Compétences</p>
                  <p className="text-caption font-caption text-on-surface-variant">Techniques & Soft skills</p>
                </div>
              </div>
              <button className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary" onClick={() => setEditingSection('skills')}>
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
            </div>
            <button className="w-full mt-4 py-3 border border-dashed border-clay-accent rounded text-on-surface-variant hover:text-primary hover:border-primary transition-colors flex justify-center items-center gap-2" onClick={() => setEditingSection('add_new')}>
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span className="text-label-sm font-label-sm uppercase">Ajouter une section</span>
            </button>
          </div>
          <div className="p-4 border-t border-parchment-border bg-surface-container-low">
            <div className="flex items-center justify-between mb-2">
              <span className="text-caption font-caption text-on-surface-variant uppercase tracking-wider">Score ATS</span>
              <span className="text-label-md font-label-md text-success-green">85/100</span>
            </div>
            <div className="h-[2px] w-full bg-parchment-border rounded-full overflow-hidden">
              <div className="h-full bg-success-green w-[85%]"></div>
            </div>
          </div>
        </aside>

        {/* Center Pane: Live Preview (6 cols) */}
        <section className="flex-1 overflow-y-auto bg-surface-container-low p-8 flex justify-center relative">
          {/* Zoom Controls */}
          <div className="absolute bottom-8 right-8 flex flex-col gap-2 z-20">
            <button
              className="w-10 h-10 bg-surface border border-parchment-border rounded flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors shadow-sm"
              onClick={() => setZoom(z => Math.min(z + 10, 200))}
            >
              <span className="material-symbols-outlined">zoom_in</span>
            </button>
            <span className="text-center text-caption text-on-surface-variant">{zoom}%</span>
            <button
              className="w-10 h-10 bg-surface border border-parchment-border rounded flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors shadow-sm"
              onClick={() => setZoom(z => Math.max(z - 10, 50))}
            >
              <span className="material-symbols-outlined">zoom_out</span>
            </button>
          </div>

          {/* The CV Document Preview */}
          <div className="cv-page bg-on-primary w-full max-w-[794px] h-fit p-12 relative" style={{
            transform: `scale(${zoom/100})`, 
            transformOrigin: 'top center',
            backgroundImage: selectedTemplate ? `url(${selectedTemplate})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '1123px' // A4 height at 794px width
          }}>
            {/* Active Section Highlight Overlay (simulated) */}
            <div className="absolute top-[180px] left-8 right-8 h-[240px] border border-clay-accent bg-clay-accent/5 rounded pointer-events-none z-10"></div>
            
            {/* CV Content */}
            <div className="border-b border-ink pb-6 mb-8 text-center relative z-0">
              <h1 className="text-display-lg font-display-lg text-ink mb-2">{cvData.header.name}</h1>
              <p className="text-body-lg font-body-lg text-on-surface-variant uppercase tracking-widest">{cvData.header.title}</p>
              <div className="flex justify-center gap-4 mt-4 text-caption font-caption text-on-surface-variant">
                <span>{cvData.header.location}</span> •
                <span>{cvData.header.email}</span> •
                <span>{cvData.header.phone}</span>
              </div>
            </div>

            <div className="mb-8 relative z-0">
              <h2 className="text-headline-md font-headline-md text-ink mb-4 border-b border-parchment-border pb-2 uppercase tracking-wide text-sm">Expérience Professionnelle</h2>
              {cvData.experience.map((exp: any) => (
                <div key={exp.id} className="mb-6">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-label-md font-label-md text-ink font-bold text-lg">{exp.title}</h3>
                    <span className="text-caption font-caption text-on-surface-variant italic">{exp.dates}</span>
                  </div>
                  <p className="text-body-md font-body-md text-on-surface-variant mb-2">{exp.company} • {exp.location}</p>
                  <ul className="list-disc pl-5 text-body-md font-body-md text-on-surface-variant space-y-1">
                    {exp.highlights.map((highlight: string, i: number) => (
                      <li key={i}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mb-8">
              <h2 className="text-headline-md font-headline-md text-ink mb-4 border-b border-parchment-border pb-2 uppercase tracking-wide text-sm">Formation</h2>
              {cvData.education.map((edu: any) => (
                <div key={edu.id} className="mb-4">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-label-md font-label-md text-ink font-bold">{edu.degree}</h3>
                    <span className="text-caption font-caption text-on-surface-variant italic">{edu.dates}</span>
                  </div>
                  <p className="text-body-md font-body-md text-on-surface-variant">{edu.school}</p>
                </div>
              ))}
            </div>

            {cvData.skills && cvData.skills.length > 0 && (
              <div className="mb-8">
                <h2 className="text-headline-md font-headline-md text-ink mb-4 border-b border-parchment-border pb-2 uppercase tracking-wide text-sm">Compétences</h2>
                <div className="flex flex-wrap gap-2">
                  {cvData.skills.map((skill: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-surface-container-high border border-parchment-border rounded-full text-label-md font-label-md text-ink">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Right Pane: AI Insights (3 cols) */}
        <aside className="w-full md:w-3/12 lg:w-[320px] flex-shrink-0 border-l border-parchment-border bg-surface flex flex-col h-full z-10 hidden lg:flex">
          <div className="p-4 border-b border-parchment-border flex justify-between items-center bg-surface-container-lowest">
            <div className="flex items-center gap-2 text-ink">
              <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
              <h2 className="text-label-md font-label-md uppercase tracking-wider">Assistant Éditorial</h2>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-container-lowest">
            <p className="text-caption font-caption text-on-surface-variant mb-2 px-1">Générez des suggestions d'optimisation (ATS) basées sur vos expériences.</p>
            
            <button 
              className="w-full py-2 bg-clay-accent text-on-surface rounded text-label-sm font-label-sm uppercase hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              onClick={generateSuggestions}
              disabled={isGenerating}
            >
              <span className="material-symbols-outlined text-[18px]">{isGenerating ? 'hourglass_top' : 'magic_button'}</span>
              {isGenerating ? 'Analyse en cours...' : 'Générer des suggestions'}
            </button>
            {aiError && <p className="text-caption text-error">{aiError}</p>}

            {suggestions.length === 0 && !isGenerating && !aiError && (
              <p className="text-caption font-caption text-on-surface-variant text-center py-8">Aucune suggestion pour le moment. Cliquez sur le bouton pour analyser votre profil.</p>
            )}

            {suggestions.filter(s => !s.dismissed).map(s => (
              <div key={s.id} className={`border rounded p-4 bg-surface relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-[2px] ${s.accepted ? 'border-success-green before:bg-success-green' : 'border-parchment-border before:bg-clay-accent'}`}>
                <div className="flex gap-2 items-start mb-3">
                  <span className={`material-symbols-outlined text-[18px] mt-0.5 ${s.accepted ? 'text-success-green' : 'text-clay-accent'}`}>{s.icon || 'tips_and_updates'}</span>
                  <div>
                    <p className="text-label-sm font-label-sm uppercase tracking-wide text-on-surface mb-1">{s.title}</p>
                    <p className="text-caption font-caption text-on-surface-variant">{s.description}</p>
                  </div>
                </div>
                <div className="bg-surface-container-low p-3 rounded border border-parchment-border mb-3 text-body-md font-body-md text-on-surface italic text-sm">
                  {s.suggestion}
                </div>
                {s.accepted ? (
                  <p className="text-label-sm font-label-sm text-success-green flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Accepté et appliqué
                  </p>
                ) : (
                  <div className="flex gap-2">
                    <button className="flex-1 py-1.5 px-3 bg-success-green text-on-primary rounded text-label-sm font-label-sm uppercase hover:bg-opacity-90 transition-colors" onClick={() => handleAccept(s.id, s.expId, s.pointIndex, s.suggestion)}>Accepter</button>
                    <button className="py-1.5 px-3 bg-transparent border border-parchment-border text-on-surface-variant rounded text-label-sm font-label-sm uppercase hover:bg-surface-container-low transition-colors" onClick={() => handleDismiss(s.id)}>Ignorer</button>
                  </div>
                )}
              </div>
            ))}

            {suggestions.length > 0 && suggestions.every(s => s.dismissed) && (
              <p className="text-caption font-caption text-on-surface-variant text-center py-8">Toutes les suggestions ont été ignorées.</p>
            )}
          </div>
        </aside>
      </main>

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/50 backdrop-blur-sm">
          <div className="bg-surface rounded-lg border border-parchment-border shadow-lg w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-parchment-border flex justify-between items-center bg-surface-container-low">
              <h2 className="text-headline-md font-headline-md text-ink">Choisir un Template Canva</h2>
              <button className="text-on-surface-variant hover:text-primary transition-colors" onClick={() => setShowTemplateModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {templates.length === 0 ? (
                <div className="col-span-full text-center py-12 text-on-surface-variant flex flex-col items-center gap-4">
                  <span className="material-symbols-outlined text-[48px] opacity-50">imagesmode</span>
                  <p>Aucun template Canva trouvé dans le dossier public/templates.</p>
                  <p className="text-caption">Ajoutez des images (.png, .jpg) exportées depuis Canva dans ce dossier pour les utiliser.</p>
                </div>
              ) : (
                templates.map(template => (
                  <div 
                    key={template.id} 
                    className={`cursor-pointer group rounded overflow-hidden border-2 transition-all ${selectedTemplate === template.url ? 'border-primary ring-4 ring-primary/20' : 'border-parchment-border hover:border-clay-accent'}`}
                    onClick={() => {
                      setSelectedTemplate(template.url);
                      setShowTemplateModal(false);
                    }}
                  >
                    <div className="aspect-[1/1.414] bg-surface-container-high w-full relative">
                      <img src={template.url} alt={template.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3 bg-surface text-center border-t border-parchment-border group-hover:bg-surface-container-low transition-colors">
                      <p className="text-label-sm font-label-sm uppercase tracking-wide truncate">{template.name}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-parchment-border bg-surface-container-lowest flex justify-end gap-4">
              <button className="px-4 py-2 border border-parchment-border text-on-surface-variant rounded hover:bg-surface-container-low transition-colors text-label-sm font-label-sm uppercase" onClick={() => { setSelectedTemplate(null); setShowTemplateModal(false); }}>
                Sans template (Fond blanc)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section Edit Modal */}
      {editingSection && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/50 backdrop-blur-sm">
          <div className="bg-surface rounded-lg border border-parchment-border shadow-lg w-full max-w-xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-parchment-border flex justify-between items-center bg-surface-container-low">
              <h2 className="text-headline-md font-headline-md text-ink">
                {editingSection === 'add_new' ? 'Ajouter une section' : `Modifier la section`}
              </h2>
              <button className="text-on-surface-variant hover:text-primary transition-colors" onClick={() => setEditingSection(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {editingSection === 'header' && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-label-sm font-label-sm text-ink uppercase">Nom complet</label>
                    <input type="text" className="border border-parchment-border rounded p-2 bg-surface text-ink" value={cvData.header.name} onChange={e => setCvData({...cvData, header: {...cvData.header, name: e.target.value}})} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-label-sm font-label-sm text-ink uppercase">Titre</label>
                    <input type="text" className="border border-parchment-border rounded p-2 bg-surface text-ink" value={cvData.header.title} onChange={e => setCvData({...cvData, header: {...cvData.header, title: e.target.value}})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-label-sm font-label-sm text-ink uppercase">Localisation</label>
                      <input type="text" className="border border-parchment-border rounded p-2 bg-surface text-ink" value={cvData.header.location} onChange={e => setCvData({...cvData, header: {...cvData.header, location: e.target.value}})} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-label-sm font-label-sm text-ink uppercase">Téléphone</label>
                      <input type="text" className="border border-parchment-border rounded p-2 bg-surface text-ink" value={cvData.header.phone} onChange={e => setCvData({...cvData, header: {...cvData.header, phone: e.target.value}})} />
                    </div>
                  </div>
                </div>
              )}
              {editingSection === 'experience' && (
                <div className="space-y-6">
                  {cvData.experience.map((exp: any, index: number) => (
                    <div key={exp.id} className="p-4 border border-clay-accent rounded-lg bg-surface-container-low space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-label-sm font-label-sm text-ink uppercase">Poste</label>
                          <input type="text" className="border border-parchment-border rounded p-2 bg-surface text-ink" value={exp.title} onChange={e => {
                            const newExp = [...cvData.experience];
                            newExp[index].title = e.target.value;
                            setCvData({...cvData, experience: newExp});
                          }} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-label-sm font-label-sm text-ink uppercase">Entreprise</label>
                          <input type="text" className="border border-parchment-border rounded p-2 bg-surface text-ink" value={exp.company} onChange={e => {
                            const newExp = [...cvData.experience];
                            newExp[index].company = e.target.value;
                            setCvData({...cvData, experience: newExp});
                          }} />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-label-sm font-label-sm text-ink uppercase">Description (Points)</label>
                        <textarea className="border border-parchment-border rounded p-2 bg-surface text-ink h-32" value={exp.highlights.join('\n')} onChange={e => {
                          const newExp = [...cvData.experience];
                          newExp[index].highlights = e.target.value.split('\n').filter((l: string) => l.trim() !== '');
                          setCvData({...cvData, experience: newExp});
                        }} />
                        <span className="text-caption text-on-surface-variant">Séparez chaque point par un retour à la ligne.</span>
                      </div>
                    </div>
                  ))}
                  <button className="text-primary text-label-sm font-label-sm uppercase hover:underline">+ Ajouter une expérience</button>
                </div>
              )}
              {editingSection === 'education' && (
                <div className="space-y-6">
                  {cvData.education.map((edu: any, index: number) => (
                    <div key={edu.id} className="p-4 border border-clay-accent rounded-lg bg-surface-container-low space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-label-sm font-label-sm text-ink uppercase">Diplôme</label>
                          <input type="text" className="border border-parchment-border rounded p-2 bg-surface text-ink" value={edu.degree} onChange={e => {
                            const newEdu = [...cvData.education];
                            newEdu[index].degree = e.target.value;
                            setCvData({...cvData, education: newEdu});
                          }} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-label-sm font-label-sm text-ink uppercase">École / Université</label>
                          <input type="text" className="border border-parchment-border rounded p-2 bg-surface text-ink" value={edu.school} onChange={e => {
                            const newEdu = [...cvData.education];
                            newEdu[index].school = e.target.value;
                            setCvData({...cvData, education: newEdu});
                          }} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="text-primary text-label-sm font-label-sm uppercase hover:underline">+ Ajouter une formation</button>
                </div>
              )}
              {editingSection === 'skills' && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-label-sm font-label-sm text-ink uppercase">Compétences (séparées par des virgules)</label>
                    <textarea className="border border-parchment-border rounded p-2 bg-surface text-ink h-32" value={cvData.skills.join(', ')} onChange={e => {
                      setCvData({...cvData, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')});
                    }} />
                  </div>
                </div>
              )}
              {editingSection === 'add_new' && (
                <div className="space-y-6 flex flex-col items-center py-8 max-w-sm mx-auto">
                  <p className="text-on-surface-variant text-center">Suggestions de sections :</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <button className="px-4 py-2 border border-parchment-border text-on-surface rounded hover:bg-surface-container-low transition-colors text-label-sm font-label-sm uppercase">Langues</button>
                    <button className="px-4 py-2 border border-parchment-border text-on-surface rounded hover:bg-surface-container-low transition-colors text-label-sm font-label-sm uppercase">Projets</button>
                    <button className="px-4 py-2 border border-parchment-border text-on-surface rounded hover:bg-surface-container-low transition-colors text-label-sm font-label-sm uppercase">Centres d'intérêt</button>
                  </div>
                  
                  <div className="w-full h-px bg-parchment-border my-2"></div>
                  
                  <div className="w-full flex flex-col gap-2">
                    <label className="text-label-sm font-label-sm text-ink uppercase">Ou créer une section personnalisée</label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Ex: Bénévolat" className="flex-1 border border-parchment-border rounded p-2 bg-surface text-ink" />
                      <button className="px-4 py-2 bg-ink text-on-primary rounded hover:opacity-90 transition-opacity text-label-sm font-label-sm uppercase">Ajouter</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-parchment-border bg-surface-container-lowest flex justify-end gap-4">
              <button className="px-4 py-2 bg-success-green text-on-primary rounded hover:bg-on-surface transition-colors text-label-sm font-label-sm uppercase shadow-sm" onClick={() => setEditingSection(null)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditorPage;
