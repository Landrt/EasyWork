/**
 * /profile — Mon Profil (accessible depuis la nav à tout moment)
 * 
 * Réutilise exactement la logique et les composants de /review,
 * mais dans un contexte de "Gestion" (pas d'onboarding).
 * La différence avec /review : ici, le bouton de validation mène
 * directement au Dashboard, pas à /analysis.
 */
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSession, getCandidateName, setCandidateName } from '@/lib/session';
import CandidateNavbar from '@/components/CandidateNavbar';

interface Experience {
  title: string;
  company: string;
  location: string;
  dates: string;
  highlights: string[];
}

interface Education {
  degree: string;
  school: string;
  dates: string;
}

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  experiences: Experience[];
  education: Education[];
  skills: string[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '', email: '', phone: '', location: '',
    experiences: [], education: [], skills: []
  });
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Load data from sessionStorage (same source as /review and /import)
  useEffect(() => {
    const candidateName = getCandidateName();
    const stored = sessionStorage.getItem('importedProfile');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (!parsed.name && candidateName) {
          parsed.name = candidateName;
        }
        setProfileData(parsed);
      } catch (e) {
        console.error('Failed to parse imported profile');
      }
    } else if (candidateName) {
      const session = getSession();
      setProfileData(prev => ({
        ...prev,
        name: candidateName,
        email: session?.email || prev.email
      }));
    }
  }, []);

  const saveSection = () => {
    if (profileData.name) {
      setCandidateName(profileData.name);
    }
    sessionStorage.setItem('importedProfile', JSON.stringify(profileData));
    setEditingSection(null);
  };

  const handleSave = () => {
    if (profileData.name) {
      setCandidateName(profileData.name);
    }
    sessionStorage.setItem('importedProfile', JSON.stringify(profileData));
    router.push('/dashboard');
  };

  const completionScore = () => {
    let filled = 0;
    if (profileData.name) filled++;
    if (profileData.email) filled++;
    if (profileData.phone) filled++;
    if (profileData.location) filled++;
    if (profileData.experiences.length > 0) filled++;
    if (profileData.education.length > 0) filled++;
    if (profileData.skills.length > 0) filled++;
    return Math.round((filled / 7) * 100);
  };

  const score = completionScore();

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased">
      <style dangerouslySetInnerHTML={{__html: `
        .resume-card { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        .resume-card:hover { border-color: var(--color-clay-accent); }
      `}} />

      <CandidateNavbar />

      <main className="flex-grow w-full max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-16">
        <header className="mb-12 max-w-3xl">
          <h1 className="text-display-lg font-display-lg text-ink mb-4">Mon Profil</h1>
          <p className="text-body-lg font-body-lg text-on-surface-variant">
            Gérez vos informations professionnelles. Ces données seront utilisées lors de la génération de vos CV.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Main Content */}
          <div className="lg:col-span-8 flex flex-col gap-8">

            {/* Informations Personnelles */}
            <section className="resume-card bg-surface rounded border border-parchment-border p-6 md:p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-headline-md font-headline-md text-ink flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline">person</span>
                  Informations Personnelles
                </h2>
                <button className="text-label-sm font-label-sm uppercase text-on-surface-variant hover:text-ink transition-colors flex items-center gap-1" onClick={() => setEditingSection(editingSection === 'personal' ? null : 'personal')}>
                  <span className="material-symbols-outlined text-[16px]">{editingSection === 'personal' ? 'close' : 'edit'}</span>
                  {editingSection === 'personal' ? 'Fermer' : 'Modifier'}
                </button>
              </div>

              {editingSection === 'personal' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Nom complet', key: 'name', placeholder: 'Jean Dupont' },
                    { label: 'Email', key: 'email', placeholder: 'jean@email.com' },
                    { label: 'Téléphone', key: 'phone', placeholder: '+33 6 00 00 00 00' },
                    { label: 'Localisation', key: 'location', placeholder: 'Paris, France' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-caption font-caption text-outline uppercase tracking-wider block mb-1">{f.label}</label>
                      <input
                        type="text"
                        className="w-full border border-parchment-border rounded p-2 bg-surface text-ink text-body-md font-body-md focus:border-ink focus:outline-none"
                        value={(profileData as any)[f.key] || ''}
                        placeholder={f.placeholder}
                        onChange={e => setProfileData({ ...profileData, [f.key]: e.target.value })}
                      />
                    </div>
                  ))}
                  <div className="md:col-span-2 flex justify-end mt-2">
                    <button className="px-4 py-2 bg-ink text-on-primary rounded text-label-sm font-label-sm uppercase hover:opacity-90" onClick={saveSection}>
                      Enregistrer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  {[
                    { label: 'Nom complet', key: 'name' },
                    { label: 'Email', key: 'email' },
                    { label: 'Téléphone', key: 'phone' },
                    { label: 'Localisation', key: 'location' },
                  ].map(f => (
                    <div key={f.key}>
                      <span className="text-caption font-caption text-outline uppercase tracking-wider block mb-1">{f.label}</span>
                      <span className={`text-body-md font-body-md ${(profileData as any)[f.key] ? 'text-ink' : 'text-on-surface-variant italic'}`}>
                        {(profileData as any)[f.key] || 'Non renseigné'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Expérience Professionnelle */}
            <section className="resume-card bg-surface rounded border border-parchment-border p-6 md:p-8">
              <div className="flex justify-between items-start mb-6 border-b border-parchment-border pb-4">
                <h2 className="text-headline-md font-headline-md text-ink flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline">work</span>
                  Expérience Professionnelle
                </h2>
                <button className="text-label-sm font-label-sm uppercase text-on-surface-variant hover:text-ink transition-colors flex items-center gap-1" onClick={() => setEditingSection(editingSection === 'experience' ? null : 'experience')}>
                  <span className="material-symbols-outlined text-[16px]">{editingSection === 'experience' ? 'close' : 'edit'}</span>
                  {editingSection === 'experience' ? 'Fermer' : 'Modifier'}
                </button>
              </div>

              {editingSection === 'experience' ? (
                <div className="space-y-6">
                  {profileData.experiences.map((exp, i) => (
                    <div key={i} className="p-4 border border-clay-accent rounded-lg space-y-3 bg-surface-container-low">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-caption font-caption text-outline uppercase block mb-1">Poste</label>
                          <input type="text" className="w-full border border-parchment-border rounded p-2 bg-surface text-ink text-sm" value={exp.title} onChange={e => { const n = [...profileData.experiences]; n[i].title = e.target.value; setProfileData({...profileData, experiences: n}); }} />
                        </div>
                        <div>
                          <label className="text-caption font-caption text-outline uppercase block mb-1">Entreprise</label>
                          <input type="text" className="w-full border border-parchment-border rounded p-2 bg-surface text-ink text-sm" value={exp.company} onChange={e => { const n = [...profileData.experiences]; n[i].company = e.target.value; setProfileData({...profileData, experiences: n}); }} />
                        </div>
                      </div>
                      <div>
                        <label className="text-caption font-caption text-outline uppercase block mb-1">Description (un point par ligne)</label>
                        <textarea className="w-full border border-parchment-border rounded p-2 bg-surface text-ink text-sm h-24 resize-none" value={exp.highlights.join('\n')} onChange={e => { const n = [...profileData.experiences]; n[i].highlights = e.target.value.split('\n').filter(l => l.trim()); setProfileData({...profileData, experiences: n}); }} />
                      </div>
                    </div>
                  ))}
                  {profileData.experiences.length === 0 && (
                    <p className="text-on-surface-variant text-body-md">Aucune expérience. Ajoutez-en une via le bouton ci-dessous.</p>
                  )}
                  <div className="flex justify-between">
                    <button className="text-primary text-label-sm font-label-sm uppercase hover:underline" onClick={() => setProfileData({...profileData, experiences: [...profileData.experiences, { title: '', company: '', location: '', dates: '', highlights: [] }]})}>
                      + Ajouter une expérience
                    </button>
                    <button className="px-4 py-2 bg-ink text-on-primary rounded text-label-sm font-label-sm uppercase hover:opacity-90" onClick={saveSection}>Enregistrer</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {profileData.experiences.length > 0 ? profileData.experiences.map((exp, i) => (
                    <div key={i} className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-px before:bg-parchment-border">
                      <div className="absolute left-[-4px] top-2 w-2 h-2 rounded-full bg-clay-accent"></div>
                      <div className="flex flex-col md:flex-row md:justify-between md:items-baseline mb-2">
                        <h3 className="text-body-lg font-body-lg font-medium text-ink">{exp.title || 'Poste non renseigné'}</h3>
                        <span className="text-label-md font-label-md text-on-surface-variant">{exp.dates}</span>
                      </div>
                      <div className="text-body-md font-body-md text-on-surface-variant mb-3">{exp.company}{exp.location ? ` • ${exp.location}` : ''}</div>
                      <ul className="list-disc list-inside text-body-md font-body-md text-on-surface-variant space-y-1">
                        {exp.highlights?.map((h, j) => <li key={j}>{h}</li>)}
                      </ul>
                    </div>
                  )) : (
                    <div className="text-body-md font-body-md text-on-surface-variant italic flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-clay-accent">info</span>
                      Aucune expérience. Cliquez sur Modifier pour en ajouter.
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Formation */}
            <section className="resume-card bg-surface rounded border border-parchment-border p-6 md:p-8">
              <div className="flex justify-between items-start mb-6 border-b border-parchment-border pb-4">
                <h2 className="text-headline-md font-headline-md text-ink flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline">school</span>
                  Formation
                </h2>
                <button className="text-label-sm font-label-sm uppercase text-on-surface-variant hover:text-ink transition-colors flex items-center gap-1" onClick={() => setEditingSection(editingSection === 'education' ? null : 'education')}>
                  <span className="material-symbols-outlined text-[16px]">{editingSection === 'education' ? 'close' : 'edit'}</span>
                  {editingSection === 'education' ? 'Fermer' : 'Modifier'}
                </button>
              </div>

              {editingSection === 'education' ? (
                <div className="space-y-4">
                  {profileData.education.map((edu, i) => (
                    <div key={i} className="p-4 border border-clay-accent rounded-lg grid grid-cols-2 gap-3 bg-surface-container-low">
                      <div>
                        <label className="text-caption font-caption text-outline uppercase block mb-1">Diplôme</label>
                        <input type="text" className="w-full border border-parchment-border rounded p-2 bg-surface text-ink text-sm" value={edu.degree} onChange={e => { const n = [...profileData.education]; n[i].degree = e.target.value; setProfileData({...profileData, education: n}); }} />
                      </div>
                      <div>
                        <label className="text-caption font-caption text-outline uppercase block mb-1">École</label>
                        <input type="text" className="w-full border border-parchment-border rounded p-2 bg-surface text-ink text-sm" value={edu.school} onChange={e => { const n = [...profileData.education]; n[i].school = e.target.value; setProfileData({...profileData, education: n}); }} />
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between">
                    <button className="text-primary text-label-sm font-label-sm uppercase hover:underline" onClick={() => setProfileData({...profileData, education: [...profileData.education, { degree: '', school: '', dates: '' }]})}>
                      + Ajouter une formation
                    </button>
                    <button className="px-4 py-2 bg-ink text-on-primary rounded text-label-sm font-label-sm uppercase hover:opacity-90" onClick={saveSection}>Enregistrer</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {profileData.education.length > 0 ? profileData.education.map((edu, i) => (
                    <div key={i} className="flex flex-col md:flex-row md:justify-between md:items-baseline">
                      <div>
                        <h3 className="text-body-lg font-body-lg font-medium text-ink">{edu.degree || 'Diplôme non renseigné'}</h3>
                        <div className="text-body-md font-body-md text-on-surface-variant">{edu.school}</div>
                      </div>
                      <span className="text-label-md font-label-md text-on-surface-variant mt-1 md:mt-0">{edu.dates}</span>
                    </div>
                  )) : (
                    <div className="text-body-md font-body-md text-on-surface-variant italic flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-clay-accent">info</span>
                      Aucune formation. Cliquez sur Modifier pour en ajouter.
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Compétences */}
            <section className="resume-card bg-surface rounded border border-parchment-border p-6 md:p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-headline-md font-headline-md text-ink flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline">build</span>
                  Compétences
                </h2>
                <button className="text-label-sm font-label-sm uppercase text-on-surface-variant hover:text-ink transition-colors flex items-center gap-1" onClick={() => setEditingSection(editingSection === 'skills' ? null : 'skills')}>
                  <span className="material-symbols-outlined text-[16px]">{editingSection === 'skills' ? 'close' : 'edit'}</span>
                  {editingSection === 'skills' ? 'Fermer' : 'Modifier'}
                </button>
              </div>

              {editingSection === 'skills' ? (
                <div className="space-y-3">
                  <label className="text-caption font-caption text-outline uppercase block mb-1">Compétences (séparées par des virgules)</label>
                  <textarea
                    className="w-full border border-parchment-border rounded p-3 bg-surface text-ink text-body-md font-body-md h-24 resize-none focus:border-ink focus:outline-none"
                    value={profileData.skills.join(', ')}
                    onChange={e => setProfileData({...profileData, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                  />
                  <div className="flex justify-end">
                    <button className="px-4 py-2 bg-ink text-on-primary rounded text-label-sm font-label-sm uppercase hover:opacity-90" onClick={saveSection}>Enregistrer</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.length > 0 ? profileData.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-surface-container-high border border-parchment-border rounded-full text-label-md font-label-md text-ink">{skill}</span>
                  )) : (
                    <div className="text-body-md font-body-md text-on-surface-variant italic flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-clay-accent">info</span>
                      Aucune compétence. Cliquez sur Modifier pour en ajouter.
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Right Pane */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="sticky top-[100px]">
              <div className="bg-surface-container-low border border-parchment-border rounded p-6 flex flex-col gap-6 shadow-sm">
                <div>
                  <h3 className="text-body-lg font-body-lg font-semibold text-ink mb-2">Complétion du profil</h3>
                  <p className="text-body-md font-body-md text-on-surface-variant">Un profil complet améliore la qualité des CV générés.</p>
                </div>
                <div className="w-full">
                  <div className="flex justify-between text-caption font-caption text-on-surface-variant mb-2">
                    <span>Progression</span>
                    <span className={score === 100 ? 'text-success-green font-medium' : ''}>{score}%</span>
                  </div>
                  <div className="w-full h-[3px] bg-parchment-border rounded-full">
                    <div className="h-full bg-ink rounded-full transition-all duration-500" style={{width: `${score}%`}}></div>
                  </div>
                </div>
                <button
                  className="w-full bg-success-green text-on-primary text-label-md font-label-md uppercase tracking-wide py-4 px-6 rounded hover:opacity-90 transition-opacity flex justify-center items-center gap-2"
                  onClick={handleSave}
                >
                  Enregistrer et retourner
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
                <button
                  className="w-full border border-parchment-border text-on-surface-variant text-label-sm font-label-sm uppercase py-3 px-6 rounded hover:bg-surface-container-low transition-colors flex justify-center items-center gap-2"
                  onClick={() => window.location.href = '/analysis'}
                >
                  <span className="material-symbols-outlined text-[16px]">radar</span>
                  Analyser une offre
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-surface-container-low border-t border-parchment-border mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-12 max-w-max-width mx-auto">
          <div className="text-headline-md font-headline-md font-bold text-ink mb-6 md:mb-0">EasyWork</div>
          <div className="flex flex-wrap justify-center gap-6 mb-6 md:mb-0">
            <Link className="text-on-surface-variant text-label-sm font-label-sm uppercase hover:text-primary transition-colors" href="/legal">Mentions Légales</Link>
            <Link className="text-on-surface-variant text-label-sm font-label-sm uppercase hover:text-primary transition-colors" href="/privacy">RGPD</Link>
            <Link className="text-on-surface-variant text-label-sm font-label-sm uppercase hover:text-primary transition-colors" href="/support">Support</Link>
          </div>
          <div className="text-body-md font-body-md text-on-surface-variant">© 2026 EasyWork.</div>
        </div>
      </footer>
    </div>
  );
}
