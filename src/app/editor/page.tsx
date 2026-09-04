"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useApi } from '@/lib/api';
import { TEMPLATES, getTemplateComponent } from '@/components/templates';
import { getCandidateName, setCandidateName } from '@/lib/session';

// Mock cv ID - in production this comes from the URL params
const MOCK_CV_ID = 1;

const EditorContent = () => {
  const searchParams = useSearchParams();
  const templateFromUrl = searchParams.get('template');
  const { fetch: apiFetch } = useApi();
  const [zoom, setZoom] = useState(100);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  
  // AI Suggestions
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Template States
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(templateFromUrl || 'modern');

  // QRO Modal / Drawer in Editor
  const [showQroModal, setShowQroModal] = useState(false);
  const [qroAnswers, setQroAnswers] = useState<any[]>([]);
  const [qroCurrentQuestion, setQroCurrentQuestion] = useState(
    "Bonjour ! Parlez-moi de votre métier, vos principales réalisations et le poste que vous visez."
  );
  const [qroPlaceholder, setQroPlaceholder] = useState(
    "Exemple : Je suis Développeur Full Stack avec 4 ans d'expérience chez X. J'ai réalisé des projets en React/Node..."
  );
  const [qroInput, setQroInput] = useState('');
  const [qroLoading, setQroLoading] = useState(false);
  const [qroGenerating, setQroGenerating] = useState(false);
  const [qroScore, setQroScore] = useState(30);
  const [qroSuccessMsg, setQroSuccessMsg] = useState<string | null>(null);

  // Editor States
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [newCustomTitle, setNewCustomTitle] = useState('');
  const [newCustomColumn, setNewCustomColumn] = useState<'left' | 'main'>('main');
  const [isEditingNameInline, setIsEditingNameInline] = useState(false);

  const handleCandidateNameChange = (newName: string) => {
    setCvData((prev: any) => {
      const updated = {
        ...prev,
        header: {
          ...prev.header,
          name: newName
        }
      };
      sessionStorage.setItem('current_cv', JSON.stringify(updated));
      return updated;
    });
    setCandidateName(newName);
  };
  
  const currentTemplateDef = TEMPLATES.find(t => t.id === selectedTemplate) || TEMPLATES[0];
  const sectionLabels: Record<string, string> = {
    experience: 'Expérience Professionnelle',
    education: 'Formation',
    skills: 'Compétences',
    languages: 'Langues',
    interests: "Centres d'intérêt",
    projects: 'Projets'
  };
  
  // Mock initial data - should be fetched from backend or session
  const [cvData, setCvData] = useState<any>({
    header: { 
      name: 'Prénom Nom', 
      title: 'Titre de votre profession', 
      location: 'Ville, Pays', 
      email: 'contact@email.com', 
      phone: '+33 6 00 00 00 00',
      summary: 'Une brève introduction mettant en valeur vos points forts, votre expérience et vos objectifs professionnels. Ce paragraphe est idéal pour attirer l\'attention du recruteur dès les premières secondes de lecture.'
    },
    experience: [
      {
        id: 'exp1',
        title: 'Poste précédent ou actuel',
        company: 'Nom de l\'entreprise',
        location: 'Ville',
        dates: 'Mois Année - Présent',
        highlights: [
          'Responsabilité principale ou réalisation clé dans ce poste.',
          'Collaboration avec d\'autres équipes pour atteindre des objectifs.',
          'Amélioration des processus existants avec des résultats mesurables.'
        ]
      }
    ],
    education: [
      {
        id: 'edu1',
        degree: 'Diplôme ou Formation (ex: Master en Informatique)',
        school: 'Nom de l\'école ou de l\'université',
        dates: '2020 - 2022'
      }
    ],
    skills: ['Compétence 1', 'Compétence 2', 'Compétence 3', 'Compétence 4'],
    languages: ['Anglais - Courant', 'Espagnol - Intermédiaire'],
    interests: ['Technologie', 'Photographie', 'Lecture'],
    projects: [],
    customSections: []
  });

  useEffect(() => {
    const cvId = searchParams.get('id') || searchParams.get('cvId');

    const loadRealCvData = async () => {
      const candidateStoredName = getCandidateName();

      // 1. Tenter de charger le CV spécifique depuis le backend si un ID est fourni
      if (cvId) {
        try {
          const backendBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
          const res = await fetch(`${backendBase}/cvs/${cvId}`, { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            if (data.content && typeof data.content === 'object') {
              const loadedContent = { ...data.content };
              if (loadedContent.header && (!loadedContent.header.name || loadedContent.header.name === 'Prénom Nom') && candidateStoredName) {
                loadedContent.header.name = candidateStoredName;
              }
              setCvData(loadedContent);
              sessionStorage.setItem('current_cv', JSON.stringify(loadedContent));
              return;
            } else if (data.title) {
              setCvData((prev: any) => {
                const updated = {
                  ...prev,
                  header: { 
                    ...prev.header, 
                    title: data.title,
                    name: (prev.header.name === 'Prénom Nom' && candidateStoredName) ? candidateStoredName : prev.header.name
                  }
                };
                sessionStorage.setItem('current_cv', JSON.stringify(updated));
                return updated;
              });
            }
          }
        } catch (err) {
          console.warn('Could not fetch CV by ID from backend', err);
        }

        // Vérifier dans le stockage local des CVs
        const localCvs = localStorage.getItem('my_cvs');
        if (localCvs) {
          try {
            const parsedList = JSON.parse(localCvs);
            const found = parsedList.find((c: any) => String(c.id) === String(cvId));
            if (found && found.content) {
              const loaded = { ...found.content };
              if (loaded.header && (!loaded.header.name || loaded.header.name === 'Prénom Nom') && candidateStoredName) {
                loaded.header.name = candidateStoredName;
              }
              setCvData(loaded);
              sessionStorage.setItem('current_cv', JSON.stringify(loaded));
              return;
            }
          } catch (e) {}
        }
      }

      // 2. Vérifier le profil candidat en session ou en base
      const stored = sessionStorage.getItem('importedProfile') || sessionStorage.getItem('current_cv');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.header || parsed.name || (parsed.experiences && parsed.experiences.length > 0) || (parsed.experience && parsed.experience.length > 0)) {
            const rawHeaderName = parsed.header?.name || parsed.name;
            const resolvedName = (rawHeaderName && rawHeaderName !== 'Prénom Nom' && rawHeaderName !== 'Mon Profil')
              ? rawHeaderName
              : (candidateStoredName || rawHeaderName || 'Mon Profil');

            const normalized = {
              header: {
                name: resolvedName,
                title: parsed.header?.title || parsed.title || 'Titre professionnel',
                location: parsed.header?.location || parsed.location || '',
                email: parsed.header?.email || parsed.email || '',
                phone: parsed.header?.phone || parsed.phone || '',
                summary: parsed.header?.summary || parsed.summary || ''
              },
              experience: parsed.experience || parsed.experiences || [],
              education: parsed.education || [],
              skills: parsed.skills || [],
              languages: parsed.languages || [],
              interests: parsed.interests || [],
              projects: parsed.projects || [],
              customSections: parsed.customSections || []
            };
            setCvData(normalized);
            sessionStorage.setItem('current_cv', JSON.stringify(normalized));
            return;
          }
        } catch (e) {
          console.error('Failed to parse profile in Editor', e);
        }
      }

      // 3. Charger le profil candidat réel depuis le backend
      try {
        const backendBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
        const res = await fetch(`${backendBase}/profile`, { credentials: 'include' });
        if (res.ok) {
          const prof = await res.json();
          if (prof.headline || (prof.experiences && prof.experiences.length > 0)) {
            const realName = candidateStoredName || (prof.user?.email ? prof.user.email.split('@')[0] : 'Mon Profil');
            const realData = {
              header: {
                name: realName,
                title: prof.headline || 'Titre professionnel',
                location: prof.location || '',
                email: prof.user?.email || '',
                phone: prof.phone || '',
                summary: prof.summary || ''
              },
              experience: (prof.experiences || []).map((exp: any, idx: number) => ({
                id: exp.id || `exp-${idx}`,
                title: exp.title || '',
                company: exp.company || '',
                location: exp.location || '',
                dates: exp.dates || '',
                highlights: exp.highlights || []
              })),
              education: (prof.education || []).map((edu: any, idx: number) => ({
                id: edu.id || `edu-${idx}`,
                degree: edu.degree || '',
                school: edu.school || '',
                dates: edu.dates || ''
              })),
              skills: (prof.skills || []).map((s: any) => typeof s === 'string' ? s : s.name),
              languages: (prof.languages || []).map((l: any) => typeof l === 'string' ? l : `${l.name} - ${l.level}`),
              interests: [],
              projects: [],
              customSections: []
            };
            setCvData(realData);
            sessionStorage.setItem('current_cv', JSON.stringify(realData));
            return;
          }
        }
      } catch (e) {}

      // 4. Fallback si aucun profil : injecter le nom d'inscription automatiquement
      if (candidateStoredName) {
        setCvData((prev: any) => ({
          ...prev,
          header: {
            ...prev.header,
            name: candidateStoredName
          }
        }));
      }
    };

    loadRealCvData();
  }, [searchParams]);

  // Synchroniser les changements du CV dans la session pour l'analyse
  useEffect(() => {
    if (cvData) {
      sessionStorage.setItem('current_cv', JSON.stringify(cvData));
    }
  }, [cvData]);

  const openTemplateModal = () => {
    setShowTemplateModal(true);
  };

  const generateSuggestions = async () => {
    setIsGenerating(true);
    setAiError(null);
    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvTitle: cvData.header.title,
          summary: cvData.header.summary,
          experience: cvData.experience,
          skills: cvData.skills
        })
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

  const handleAccept = (id: string, expId: any, pointIndex: any, newText: string) => {
    // 1. Mettre à jour l'état de la suggestion
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, accepted: true } : s));

    // 2. Mettre à jour les données du CV de façon tolérante et réactive
    setCvData((prevCvData: any) => {
      const expList = Array.isArray(prevCvData.experience) ? [...prevCvData.experience] : [];
      if (expList.length === 0) return prevCvData;

      // Recherche par ID tolérante (string ou number)
      let targetIdx = expList.findIndex(e => String(e.id) === String(expId) || e.id === expId);

      // Si non trouvé, tentative par index direct (si expId est 0 ou 1 ou 1-based)
      if (targetIdx === -1) {
        const numExpId = Number(expId);
        if (!isNaN(numExpId)) {
          if (numExpId >= 0 && numExpId < expList.length) {
            targetIdx = numExpId;
          } else if (numExpId > 0 && numExpId - 1 < expList.length) {
            targetIdx = numExpId - 1;
          }
        }
      }

      // Si toujours non trouvé, cibler la première expérience
      if (targetIdx === -1) {
        targetIdx = 0;
      }

      const targetExp = { ...expList[targetIdx] };
      const currentHighlights = Array.isArray(targetExp.highlights) ? [...targetExp.highlights] : [];
      const pIdx = Number(pointIndex);

      if (!isNaN(pIdx) && pIdx >= 0 && pIdx < currentHighlights.length) {
        currentHighlights[pIdx] = newText;
      } else if (currentHighlights.length > 0) {
        currentHighlights[0] = newText;
      } else {
        currentHighlights.push(newText);
      }

      targetExp.highlights = currentHighlights;
      expList[targetIdx] = targetExp;

      return {
        ...prevCvData,
        experience: expList
      };
    });
  };

  const handleDismiss = (id: string) => {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, dismissed: true } : s));
  };

  const handleSendQro = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanAnswer = qroInput.trim();
    if (!cleanAnswer || qroLoading || qroGenerating) return;

    const newAnswer = { question: qroCurrentQuestion, answer: cleanAnswer };
    const updated = [...qroAnswers, newAnswer];
    setQroAnswers(updated);
    setQroInput('');
    setQroLoading(true);

    try {
      const res = await fetch('/api/ai/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: updated })
      });
      const data = await res.json();
      if (data.comprehensionScore) setQroScore(data.comprehensionScore);

      if (data.done || updated.length >= 4) {
        setQroScore(100);
        await handleGenerateFromQro(updated);
      } else if (data.question) {
        setQroCurrentQuestion(data.question);
        if (data.placeholder) setQroPlaceholder(data.placeholder);
      } else {
        await handleGenerateFromQro(updated);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setQroLoading(false);
    }
  };

  const handleGenerateFromQro = async (answersToUse: any[]) => {
    setQroGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: answersToUse,
          candidateName: cvData.header.name || 'Mon Profil',
          candidateEmail: cvData.header.email || 'contact@email.com'
        })
      });
      const data = await res.json();
      if (data.cvData) {
        setCvData(data.cvData);
        sessionStorage.setItem('current_cv', JSON.stringify(data.cvData));
        setQroSuccessMsg('✓ Votre CV a été entièrement rédigé et appliqué !');
        setTimeout(() => {
          setShowQroModal(false);
          setQroSuccessMsg(null);
        }, 1500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setQroGenerating(false);
    }
  };

  const handleExport = async () => {
    setExportStatus('Génération du PDF de haute qualité par l\'IA...');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template: selectedTemplate || 'modern',
          cvData: cvData
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CV_${cvData.header.name.replace(/\\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportStatus('✓ PDF téléchargé avec succès !');
    } catch (error) {
      console.error(error);
      setExportStatus('❌ Erreur lors de l\'export. Réessayez.');
    } finally {
      setTimeout(() => setExportStatus(null), 5000);
    }
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
          <div className="flex items-center gap-3">
            <button 
              className="flex items-center gap-2 px-3.5 py-2 bg-surface-container-low border border-parchment-border rounded hover:border-ink transition-colors text-label-sm font-label-sm uppercase font-medium" 
              onClick={() => setShowQroModal(true)}
            >
              <span className="material-symbols-outlined text-[18px] text-clay-accent">psychology</span>
              Assistant QRO
            </button>
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
            {/* Header (Always Present) */}
            <div 
              className="group flex items-center justify-between p-3 bg-surface border border-parchment-border rounded cursor-pointer hover:border-clay-accent transition-colors"
              onClick={() => setEditingSection('header')}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-clay-accent text-[20px]">badge</span>
                <div className="overflow-hidden">
                  <p className="text-label-md font-label-md text-on-surface font-semibold truncate max-w-[170px]">{cvData.header.name || 'Nom complet'}</p>
                  <p className="text-caption font-caption text-on-surface-variant truncate max-w-[170px]">{cvData.header.title || 'Modifier nom & titre'}</p>
                </div>
              </div>
              <button className="text-on-surface-variant group-hover:text-primary transition-colors p-1" title="Modifier l'en-tête">
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
            </div>

            {/* Dynamic Sections */}
            {['experience', 'education', 'skills', 'languages', 'interests', 'projects'].map(sec => {
              if (cvData[sec] === null) return null; // Section explicitement supprimée par l'utilisateur
              if (!currentTemplateDef.supportedSections?.includes(sec) && (!cvData[sec] || cvData[sec].length === 0)) return null;
              
              const count = cvData[sec]?.length || 0;
              return (
                <div key={sec} className="group flex items-center justify-between p-3 bg-surface border border-parchment-border rounded cursor-move hover:border-clay-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant text-[18px] cursor-grab">drag_indicator</span>
                    <div>
                      <p className="text-label-md font-label-md text-on-surface">{sectionLabels[sec]}</p>
                      <p className="text-caption font-caption text-on-surface-variant">{count} élément{count > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <button className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary" onClick={() => setEditingSection(sec)}>
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                </div>
              );
            })}
            
            {/* Custom Sections */}
            {cvData.customSections?.map((cSec: any) => {
              const count = cSec.items?.length || 0;
              return (
                <div key={cSec.id} className="group flex items-center justify-between p-3 bg-surface border border-parchment-border rounded cursor-move hover:border-clay-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant text-[18px] cursor-grab">drag_indicator</span>
                    <div>
                      <p className="text-label-md font-label-md text-on-surface">{cSec.title}</p>
                      <p className="text-caption font-caption text-on-surface-variant">{count} élément{count > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <button className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary" onClick={() => setEditingSection(cSec.id)}>
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                </div>
              );
            })}
            
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
        <section className="flex-1 overflow-y-auto bg-surface-container-low p-8 flex flex-col items-center relative">
          {/* Quick Header Banner for Name & Identity */}
          <div className="w-full max-w-[794px] mb-3 flex items-center justify-between px-4 py-2 bg-surface border border-parchment-border rounded shadow-sm text-xs text-on-surface-variant">
            <div className="flex items-center gap-2 flex-1 mr-4">
              <span className="material-symbols-outlined text-[18px] text-clay-accent">badge</span>
              <span className="whitespace-nowrap font-medium text-ink">Candidat :</span>
              {isEditingNameInline ? (
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                  <input
                    type="text"
                    value={cvData.header.name}
                    onChange={(e) => handleCandidateNameChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setIsEditingNameInline(false);
                    }}
                    autoFocus
                    placeholder="Votre nom complet..."
                    className="w-full px-2 py-1 text-xs border border-ink rounded bg-background text-ink focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    onClick={() => setIsEditingNameInline(false)}
                    className="px-2.5 py-1 bg-success-green text-on-primary rounded text-xs font-semibold hover:bg-tertiary-container transition-colors"
                    title="Valider"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-ink font-semibold">{cvData.header.name || 'Non renseigné'}</span>
                  <button
                    onClick={() => setIsEditingNameInline(true)}
                    className="text-primary hover:underline flex items-center gap-0.5 text-xs font-medium cursor-pointer"
                    title="Cliquer pour modifier votre nom directement"
                  >
                    <span className="material-symbols-outlined text-[14px]">edit</span>
                    <span>Modifier</span>
                  </button>
                </div>
              )}
            </div>
            <button 
              onClick={() => setEditingSection('header')}
              className="text-on-surface-variant hover:text-ink flex items-center gap-1 font-medium bg-surface-container-low px-2.5 py-1 rounded border border-parchment-border transition-colors text-xs"
            >
              <span className="material-symbols-outlined text-[14px]">tune</span>
              Toutes les coordonnées
            </button>
          </div>

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
          <div className="cv-page bg-on-primary w-full max-w-[794px] min-h-[1123px] relative flex shadow-md overflow-hidden" style={{
            transform: `scale(${zoom/100})`, 
            transformOrigin: 'top center'
          }}>
            {/* Active Section Highlight Overlay (simulated) */}
            <div className="absolute top-[180px] left-8 right-8 h-[240px] border border-clay-accent bg-clay-accent/5 rounded pointer-events-none z-10 hidden"></div>
            
            {/* CV Content rendered by the selected template component */}
            <div className="w-full relative z-0 flex print:w-[794px] print:h-[1123px]">
               {React.createElement(getTemplateComponent(selectedTemplate), { data: cvData })}
            </div>
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
                <div className="flex gap-2 items-start mb-2.5">
                  <span className={`material-symbols-outlined text-[18px] mt-0.5 ${s.accepted ? 'text-success-green' : 'text-clay-accent'}`}>{s.icon || 'tips_and_updates'}</span>
                  <div>
                    <p className="text-label-sm font-label-sm uppercase tracking-wide text-on-surface mb-0.5">{s.title}</p>
                    <p className="text-caption font-caption text-on-surface-variant">{s.description}</p>
                  </div>
                </div>

                {s.originalText && (
                  <div className="mb-2 p-2 rounded bg-surface-container-low/70 border border-parchment-border/70 text-xs">
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant block mb-0.5">Sur votre CV :</span>
                    <p className="text-on-surface line-through opacity-70 italic text-xs leading-relaxed">{s.originalText}</p>
                  </div>
                )}

                <div className="bg-surface-container-low p-2.5 rounded border border-parchment-border mb-3 text-body-md font-body-md text-on-surface text-sm">
                  <span className="text-[10px] uppercase font-bold text-success-green block mb-0.5">Proposition améliorée :</span>
                  <p className="font-medium text-xs leading-relaxed">{s.suggestion}</p>
                </div>

                {s.accepted ? (
                  <p className="text-label-sm font-label-sm text-success-green flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Appliqué sur votre CV
                  </p>
                ) : (
                  <div className="flex gap-2">
                    <button className="flex-1 py-1.5 px-3 bg-success-green text-on-primary rounded text-label-sm font-label-sm uppercase hover:bg-opacity-90 transition-colors font-bold" onClick={() => handleAccept(s.id, s.expId, s.pointIndex, s.suggestion)}>Accepter et remplacer</button>
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
              <h2 className="text-headline-md font-headline-md text-ink">Choisir un modèle de CV</h2>
              <button className="text-on-surface-variant hover:text-primary transition-colors" onClick={() => setShowTemplateModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {TEMPLATES.length === 0 ? (
                <div className="col-span-full text-center py-12 text-on-surface-variant flex flex-col items-center gap-4">
                  <span className="material-symbols-outlined text-[48px] opacity-50">imagesmode</span>
                  <p>Aucun template React trouvé.</p>
                </div>
              ) : (
                TEMPLATES.map(template => (
                  <div 
                    key={template.id} 
                    className={`cursor-pointer group rounded-xl overflow-hidden border-2 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] ${selectedTemplate === template.id ? 'border-ink ring-4 ring-ink/20' : 'border-parchment-border hover:border-clay-accent'}`}
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      setShowTemplateModal(false);
                    }}
                  >
                    <div className="aspect-[21/29] bg-surface-container-high w-full relative overflow-hidden">
                      {template.previewUrl ? (
                        <img 
                          src={template.previewUrl} 
                          alt={template.name}
                          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4">
                           <span className="material-symbols-outlined text-[32px] opacity-20 mb-2">article</span>
                           <span className="text-on-surface-variant text-center font-serif opacity-50 text-sm">{template.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-surface text-center border-t border-parchment-border transition-colors group-hover:bg-surface-container-low">
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

      {/* QRO Conversational Assistant Modal / Split Drawer */}
      {showQroModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-surface rounded-xl border border-parchment-border shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-parchment-border flex justify-between items-center bg-surface-container-low">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[22px] text-clay-accent">psychology</span>
                <div>
                  <h2 className="text-headline-md font-headline-md text-ink">Assistant QRO</h2>
                  <p className="text-caption font-caption text-on-surface-variant">L&apos;IA comprend vos réponses ouvertes et rédige votre CV complet</p>
                </div>
              </div>
              <button className="text-on-surface-variant hover:text-primary transition-colors p-1" onClick={() => setShowQroModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Comprehension Bar */}
            <div className="px-6 pt-4 pb-2 bg-surface">
              <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1 font-medium">
                <span>Compréhension du profil</span>
                <span>{qroScore}%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                <div 
                  className="h-full bg-ink transition-all duration-500 rounded-full"
                  style={{ width: `${qroScore}%` }}
                ></div>
              </div>
            </div>

            {/* Conversation Stream */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {qroAnswers.map((a, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex gap-2.5 items-start">
                    <div className="w-7 h-7 rounded-full bg-surface-container-high border border-parchment-border flex items-center justify-center text-xs text-ink flex-shrink-0">
                      <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                    </div>
                    <div className="bg-surface-container-low p-3.5 rounded-lg rounded-tl-none max-w-[85%] text-xs text-ink border border-parchment-border">
                      {a.question}
                    </div>
                  </div>
                  <div className="flex gap-2.5 items-start justify-end">
                    <div className="bg-ink text-surface p-3.5 rounded-lg rounded-tr-none max-w-[85%] text-xs">
                      {a.answer}
                    </div>
                  </div>
                </div>
              ))}

              {!qroGenerating && (
                <div className="flex gap-2.5 items-start">
                  <div className="w-7 h-7 rounded-full bg-surface-container-high border border-parchment-border flex items-center justify-center text-xs text-ink flex-shrink-0">
                    <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                  </div>
                  <div className="bg-surface-container-low p-3.5 rounded-lg rounded-tl-none max-w-[85%] text-sm font-medium text-ink border border-parchment-border">
                    {qroCurrentQuestion}
                  </div>
                </div>
              )}

              {qroLoading && (
                <div className="flex items-center gap-2 text-caption text-on-surface-variant italic py-2 animate-pulse">
                  <span className="material-symbols-outlined text-[16px] animate-spin">autorenew</span>
                  <span>L&apos;IA analyse vos informations...</span>
                </div>
              )}

              {qroGenerating && (
                <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
                  <span className="material-symbols-outlined text-[36px] text-clay-accent animate-spin">auto_awesome</span>
                  <p className="text-sm font-medium text-ink">Génération et mise en page complète de votre CV...</p>
                </div>
              )}

              {qroSuccessMsg && (
                <div className="p-3 bg-success-green/10 border border-success-green text-success-green text-xs rounded text-center font-bold">
                  {qroSuccessMsg}
                </div>
              )}
            </div>

            {/* Input Zone */}
            {!qroGenerating && (
              <div className="p-4 border-t border-parchment-border bg-surface-container-low flex flex-col gap-2">
                <textarea
                  rows={2}
                  className="w-full p-2.5 bg-surface border border-parchment-border rounded-lg text-xs text-ink placeholder:text-outline-variant focus:border-ink focus:ring-0 resize-none"
                  placeholder={qroPlaceholder}
                  value={qroInput}
                  onChange={(e) => setQroInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendQro();
                    }
                  }}
                  disabled={qroLoading}
                ></textarea>
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => handleGenerateFromQro(qroAnswers)}
                    className="text-[11px] text-on-surface-variant hover:text-ink underline"
                    disabled={qroAnswers.length === 0}
                  >
                    Générer maintenant avec ce que j&apos;ai écrit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendQro()}
                    disabled={!qroInput.trim() || qroLoading}
                    className="px-4 py-2 bg-success-green text-on-primary rounded text-label-sm font-label-sm uppercase hover:opacity-90 transition-opacity flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <span>Envoyer</span>
                    <span className="material-symbols-outlined text-[14px]">send</span>
                  </button>
                </div>
              </div>
            )}
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
                    <input 
                      type="text" 
                      className="border border-parchment-border rounded p-2 bg-surface text-ink focus:border-ink focus:ring-0" 
                      value={cvData.header.name} 
                      onChange={e => handleCandidateNameChange(e.target.value)} 
                      placeholder="Jean Dupont"
                    />
                    <p className="text-[11px] text-on-surface-variant">Modifiable à tout moment si vous souhaitez ajuster ou remplacer le nom saisi lors de l&apos;inscription.</p>
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
                  
                  {TEMPLATES.find(t => t.id === selectedTemplate)?.supportsPhoto && (
                    <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-parchment-border">
                      <label className="text-label-sm font-label-sm text-ink uppercase">Photo de profil</label>
                      <div className="flex items-center gap-4">
                        {cvData.header.photoUrl ? (
                          <img src={cvData.header.photoUrl} alt="Profil" className="w-16 h-16 rounded-full object-cover border border-parchment-border" />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center border border-parchment-border text-on-surface-variant">
                            <span className="material-symbols-outlined">person</span>
                          </div>
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-on-primary hover:file:bg-primary/90"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = URL.createObjectURL(file);
                              setCvData({...cvData, header: {...cvData.header, photoUrl: url}});
                            }
                          }} 
                        />
                      </div>
                    </div>
                  )}
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
                  <button 
                    className="text-primary text-label-sm font-label-sm uppercase hover:underline"
                    onClick={() => {
                      setCvData({
                        ...cvData,
                        experience: [
                          ...cvData.experience,
                          { id: Date.now(), title: 'Nouveau poste', company: 'Entreprise', location: '', dates: '', highlights: [] }
                        ]
                      });
                    }}
                  >
                    + Ajouter une expérience
                  </button>
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
                  <button 
                    className="text-primary text-label-sm font-label-sm uppercase hover:underline"
                    onClick={() => {
                      setCvData({
                        ...cvData,
                        education: [
                          ...cvData.education,
                          { id: Date.now(), degree: 'Nouveau diplôme', school: 'École', dates: '' }
                        ]
                      });
                    }}
                  >
                    + Ajouter une formation
                  </button>
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
              {editingSection === 'languages' && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-label-sm font-label-sm text-ink uppercase">Langues (séparées par des virgules)</label>
                    <textarea className="border border-parchment-border rounded p-2 bg-surface text-ink h-32" value={cvData.languages?.join(', ') || ''} onChange={e => {
                      setCvData({...cvData, languages: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')});
                    }} />
                  </div>
                  <div className="flex justify-start gap-4">
                    <button 
                      className="text-red-500 text-sm font-medium hover:underline flex items-center gap-1"
                      onClick={() => {
                        setCvData({...cvData, languages: null});
                        setEditingSection(null);
                      }}
                    >
                      <span className="material-symbols-outlined text-[16px]">delete_forever</span> Supprimer la section
                    </button>
                    <button 
                      className="text-on-surface-variant text-sm font-medium hover:underline flex items-center gap-1"
                      onClick={() => {
                        setCvData({...cvData, languages: []});
                        setEditingSection(null);
                      }}
                    >
                      <span className="material-symbols-outlined text-[16px]">clear_all</span> Vider
                    </button>
                  </div>
                </div>
              )}
              {editingSection === 'interests' && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-label-sm font-label-sm text-ink uppercase">Centres d'intérêt (séparés par des virgules)</label>
                    <textarea className="border border-parchment-border rounded p-2 bg-surface text-ink h-32" value={cvData.interests?.join(', ') || ''} onChange={e => {
                      setCvData({...cvData, interests: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')});
                    }} />
                  </div>
                  <div className="flex justify-start gap-4">
                    <button 
                      className="text-red-500 text-sm font-medium hover:underline flex items-center gap-1"
                      onClick={() => {
                        setCvData({...cvData, interests: null});
                        setEditingSection(null);
                      }}
                    >
                      <span className="material-symbols-outlined text-[16px]">delete_forever</span> Supprimer la section
                    </button>
                    <button 
                      className="text-on-surface-variant text-sm font-medium hover:underline flex items-center gap-1"
                      onClick={() => {
                        setCvData({...cvData, interests: []});
                        setEditingSection(null);
                      }}
                    >
                      <span className="material-symbols-outlined text-[16px]">clear_all</span> Vider
                    </button>
                  </div>
                </div>
              )}
              {editingSection === 'projects' && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-label-sm font-label-sm text-ink uppercase">Projets (séparés par des virgules)</label>
                    <textarea className="border border-parchment-border rounded p-2 bg-surface text-ink h-32" value={cvData.projects?.join(', ') || ''} onChange={e => {
                      setCvData({...cvData, projects: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')});
                    }} />
                  </div>
                  <div className="flex justify-start gap-4">
                    <button 
                      className="text-red-500 text-sm font-medium hover:underline flex items-center gap-1"
                      onClick={() => {
                        setCvData({...cvData, projects: null});
                        setEditingSection(null);
                      }}
                    >
                      <span className="material-symbols-outlined text-[16px]">delete_forever</span> Supprimer la section
                    </button>
                    <button 
                      className="text-on-surface-variant text-sm font-medium hover:underline flex items-center gap-1"
                      onClick={() => {
                        setCvData({...cvData, projects: []});
                        setEditingSection(null);
                      }}
                    >
                      <span className="material-symbols-outlined text-[16px]">clear_all</span> Vider
                    </button>
                  </div>
                </div>
              )}
              {editingSection?.startsWith('custom_') && (
                <div className="space-y-4">
                  {cvData.customSections?.map((cSec: any, idx: number) => {
                    if (cSec.id !== editingSection) return null;
                    return (
                      <div key={cSec.id} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-label-sm font-label-sm text-ink uppercase">Titre de la section</label>
                          <input type="text" className="border border-parchment-border rounded p-2 bg-surface text-ink" value={cSec.title} onChange={e => {
                            const newCustom = [...cvData.customSections];
                            newCustom[idx].title = e.target.value;
                            setCvData({...cvData, customSections: newCustom});
                          }} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-label-sm font-label-sm text-ink uppercase">Éléments (séparés par des virgules)</label>
                          <textarea className="border border-parchment-border rounded p-2 bg-surface text-ink h-32" value={cSec.items.join(', ')} onChange={e => {
                            const newCustom = [...cvData.customSections];
                            newCustom[idx].items = e.target.value.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '');
                            setCvData({...cvData, customSections: newCustom});
                          }} />
                        </div>
                        <div className="flex justify-start">
                          <button 
                            className="text-red-500 text-sm font-medium hover:underline flex items-center gap-1"
                            onClick={() => {
                              const newCustom = cvData.customSections.filter((c: any) => c.id !== cSec.id);
                              setCvData({...cvData, customSections: newCustom});
                              setEditingSection(null);
                            }}
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span> Supprimer cette section
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {editingSection === 'add_new' && (
                <div className="space-y-6 flex flex-col items-center py-8 max-w-sm mx-auto">
                  <p className="text-on-surface-variant text-center">Suggestions de sections :</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <button 
                      className="px-4 py-2 border border-parchment-border text-on-surface rounded hover:bg-surface-container-low transition-colors text-label-sm font-label-sm uppercase"
                      onClick={() => {
                        setCvData({...cvData, languages: cvData.languages || []});
                        setEditingSection('languages');
                      }}
                    >
                      Langues
                    </button>
                    <button 
                      className="px-4 py-2 border border-parchment-border text-on-surface rounded hover:bg-surface-container-low transition-colors text-label-sm font-label-sm uppercase"
                      onClick={() => {
                        setCvData({...cvData, projects: cvData.projects || []});
                        setEditingSection('projects');
                      }}
                    >
                      Projets
                    </button>
                    <button 
                      className="px-4 py-2 border border-parchment-border text-on-surface rounded hover:bg-surface-container-low transition-colors text-label-sm font-label-sm uppercase"
                      onClick={() => {
                        setCvData({...cvData, interests: cvData.interests || []});
                        setEditingSection('interests');
                      }}
                    >
                      Centres d'intérêt
                    </button>
                  </div>
                  
                  <div className="w-full h-px bg-parchment-border my-2"></div>
                  
                  <div className="w-full flex flex-col gap-4">
                    <label className="text-label-sm font-label-sm text-ink uppercase">Ou créer une section personnalisée</label>
                    <div className="flex flex-col gap-3">
                      <input 
                        type="text" 
                        placeholder="Ex: Bénévolat" 
                        className="w-full border border-parchment-border rounded p-2 bg-surface text-ink" 
                        value={newCustomTitle}
                        onChange={e => setNewCustomTitle(e.target.value)}
                      />
                      {currentTemplateDef.hasSidebar && (
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer">
                            <input type="radio" name="col" checked={newCustomColumn === 'left'} onChange={() => setNewCustomColumn('left')} /> Colonne gauche
                          </label>
                          <label className="flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer">
                            <input type="radio" name="col" checked={newCustomColumn === 'main'} onChange={() => setNewCustomColumn('main')} /> Colonne principale
                          </label>
                        </div>
                      )}
                      <button 
                        className="w-full px-4 py-2 bg-ink text-on-primary rounded hover:opacity-90 transition-opacity text-label-sm font-label-sm uppercase disabled:opacity-50" 
                        disabled={!newCustomTitle.trim()}
                        onClick={() => {
                          const id = `custom_${Date.now()}`;
                          const newSec = { id, title: newCustomTitle.trim(), items: [], column: newCustomColumn };
                          setCvData({...cvData, customSections: [...(cvData.customSections || []), newSec]});
                          setEditingSection(id);
                          setNewCustomTitle('');
                        }}
                      >
                        Ajouter
                      </button>
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

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-background text-on-surface-variant">Chargement de l'éditeur...</div>}>
      <EditorContent />
    </Suspense>
  );
}
