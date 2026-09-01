"use client";

import React, { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ImportPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isDragActive, setIsDragActive] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragActive) {
      setIsDragActive(true);
    }
  }, [isDragActive]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      startProcessing();
    }
  }, []);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      startProcessing();
    }
  };

  const startProcessing = () => {
    setStep(2);
    setTimeout(() => {
      // Simulate backend extraction from PDF
      const fakeExtractedData = {
        name: "Alexandre Martin",
        email: "alexandre.m@email.com",
        phone: "+33 6 12 34 56 78",
        location: "Paris, France",
        experiences: [
          {
            title: "Senior Product Manager",
            company: "TechFlow Solutions",
            location: "Paris",
            dates: "2020 - Présent",
            highlights: [
              "Pilotage de la roadmap produit B2B",
              "Augmentation de la rétention de 25% en 6 mois"
            ]
          }
        ],
        education: [
          {
            degree: "Master en Stratégie Digitale",
            school: "HEC Paris",
            dates: "2017 - 2019"
          }
        ],
        skills: ["Product Strategy", "Agile", "Figma", "Data Analysis"]
      };

      setExtractedData(fakeExtractedData);
      sessionStorage.setItem('importedProfile', JSON.stringify(fakeExtractedData));
      
      setStep(3);
    }, 2500);
  };

  const resetFlow = () => {
    setStep(1);
    setExtractedData(null);
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      {/* Top Navigation */}
      <header className="bg-surface border-b border-parchment-border docked full-width top-0 z-50">
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-max-width mx-auto">
          <div className="text-headline-md font-headline-md font-bold text-ink">
            <Link href="/">EasyWork</Link>
          </div>
          <nav className="hidden md:flex gap-6 items-center">
            <Link className="text-on-surface-variant text-label-sm font-label-sm hover:text-primary transition-colors duration-200" href="/dashboard">Mes CV</Link>
            <Link className="text-on-surface-variant text-label-sm font-label-sm hover:text-primary transition-colors duration-200" href="/profile">Mon profil</Link>
            <Link className="text-on-surface-variant text-label-sm font-label-sm hover:text-primary transition-colors duration-200" href="/settings">Réglages</Link>
            <Link className="text-on-surface-variant text-label-sm font-label-sm hover:text-primary transition-colors duration-200" href="/affiliate">Affilié</Link>
          </nav>
          <div className="flex items-center gap-4">
            <button className="text-on-surface-variant hover:text-primary transition-colors duration-200 hidden md:block" onClick={() => window.history.back()}>
              <span className="material-symbols-outlined" data-icon="close">close</span>
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content Canvas */}
      <main className="flex-grow flex flex-col items-center py-16 px-margin-mobile md:px-margin-desktop w-full max-w-max-width mx-auto">
        {/* Progress Header */}
        <div className="w-full max-w-3xl mb-12">
          <h1 className="text-headline-lg font-headline-lg text-ink text-center mb-8">Import your existing CV</h1>
          <div className="flex items-center justify-between relative px-4">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-parchment-border -z-10"></div>
            {/* Progress Line */}
            <div 
              className="absolute left-[10%] top-1/2 -translate-y-1/2 h-[2px] bg-primary transition-all duration-500 ease-in-out" 
              style={{ width: step === 1 ? '0%' : step === 2 ? '45%' : '100%' }}
            ></div>
            
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-2 bg-background px-4 z-10" id="step-1-indicator">
              <div className={"w-8 h-8 rounded-full flex items-center justify-center text-label-sm font-label-sm font-bold border-2 border-background transition-all duration-300 " + (step > 1 ? 'bg-success-green text-on-primary ring-0' : 'bg-primary text-on-primary ring-2 ring-primary')}>
                {step > 1 ? <span className="material-symbols-outlined text-[16px]">check</span> : "1"}
              </div>
              <span className="text-label-sm font-label-sm text-ink">Upload</span>
            </div>
            
            {/* Step 2 */}
            <div className="flex flex-col items-center gap-2 bg-background px-4 z-10" id="step-2-indicator">
              <div className={"w-8 h-8 rounded-full flex items-center justify-center text-label-sm font-label-sm font-bold border-2 border-background transition-all duration-300 " + (step > 2 ? 'bg-success-green text-on-primary ring-0' : step === 2 ? 'bg-primary text-on-primary ring-2 ring-primary' : 'bg-surface-container-high text-on-surface-variant ring-2 ring-transparent')}>
                {step > 2 ? <span className="material-symbols-outlined text-[16px]">check</span> : "2"}
              </div>
              <span className={"text-label-sm font-label-sm " + (step >= 2 ? 'text-ink' : 'text-on-surface-variant')}>Processing</span>
            </div>
            
            {/* Step 3 */}
            <div className="flex flex-col items-center gap-2 bg-background px-4 z-10" id="step-3-indicator">
              <div className={"w-8 h-8 rounded-full flex items-center justify-center text-label-sm font-label-sm font-bold border-2 border-background transition-all duration-300 " + (step === 3 ? 'bg-primary text-on-primary ring-2 ring-primary' : 'bg-surface-container-high text-on-surface-variant ring-2 ring-transparent')}>
                3
              </div>
              <span className={"text-label-sm font-label-sm " + (step === 3 ? 'text-ink' : 'text-on-surface-variant')}>Review</span>
            </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="w-full max-w-3xl bg-surface border border-parchment-border rounded p-8 min-h-[400px] relative overflow-hidden transition-all duration-500 ease-in-out">
          
          {/* VIEW 1: Dropzone */}
          <div className={"flex flex-col items-center justify-center h-full w-full absolute inset-0 p-8 transition-opacity duration-300 " + (step === 1 ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none')}>
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={"file-drop-area w-full h-full border-2 border-dashed rounded flex flex-col items-center justify-center gap-6 transition-all duration-300 " + (isDragActive ? 'border-primary bg-primary-fixed-dim' : 'border-parchment-border bg-surface hover:bg-surface-container-low')}
            >
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[32px]" data-icon="upload_file">upload_file</span>
              </div>
              <div className="text-center">
                <p className="text-body-md font-body-md text-ink mb-1">Drag and drop your resume here</p>
                <p className="text-caption font-caption text-on-surface-variant">Supports PDF, DOCX, TXT up to 5MB</p>
              </div>
              <div className="flex items-center gap-4 w-full max-w-[200px]">
                <div className="h-[1px] bg-parchment-border flex-grow"></div>
                <span className="text-label-sm font-label-sm text-on-surface-variant uppercase">or</span>
                <div className="h-[1px] bg-parchment-border flex-grow"></div>
              </div>
              <button className="bg-surface text-ink border border-parchment-border px-6 py-2 rounded text-label-md font-label-md hover:bg-surface-container-low transition-colors duration-200 flex items-center gap-2" onClick={() => fileInputRef.current?.click()}>
                Browse Files
              </button>
              <input 
                ref={fileInputRef}
                onChange={handleFiles}
                accept=".pdf,.doc,.docx,.txt" 
                className="hidden" 
                type="file"
              />
            </div>
          </div>
          
          {/* VIEW 2: Processing */}
          <div className={"flex flex-col items-center justify-center h-full w-full absolute inset-0 p-8 bg-surface transition-transform duration-500 " + (step === 2 ? 'translate-x-0' : step < 2 ? 'translate-x-full' : '-translate-x-full')}>
            <div className="flex flex-col items-center text-center max-w-md">
              <div className="relative w-24 h-24 mb-6">
                {/* Simulated scanning animation */}
                <div className="absolute inset-0 rounded-full border-4 border-surface-container"></div>
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[32px]" data-icon="document_scanner">document_scanner</span>
                </div>
              </div>
              <h2 className="text-headline-md font-headline-md text-ink mb-2">Analyzing Document</h2>
              <p className="text-body-md font-body-md text-on-surface-variant mb-8">Our AI is extracting your professional history, skills, and formatting...</p>
              
              {/* Skeleton Loaders */}
              <div className="w-full space-y-4 text-left">
                <div className="flex items-center gap-4 opacity-50">
                  <span className="material-symbols-outlined text-success-green" data-icon="check_circle">check_circle</span>
                  <div className="h-4 bg-surface-container rounded w-1/3"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin ml-[2px]"></div>
                  <div className="h-4 bg-surface-container rounded w-2/3 animate-pulse"></div>
                </div>
                <div className="flex items-center gap-4 opacity-30">
                  <span className="material-symbols-outlined text-outline-variant ml-[2px]" data-icon="pending">pending</span>
                  <div className="h-4 bg-surface-container rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* VIEW 3: Review */}
          <div className={"flex flex-col h-full w-full absolute inset-0 bg-surface overflow-y-auto transition-transform duration-500 custom-scrollbar " + (step === 3 ? 'translate-x-0' : 'translate-x-full')}>
            <div className="sticky top-0 bg-surface border-b border-parchment-border px-8 py-4 flex justify-between items-center z-10">
              <div>
                <h2 className="text-headline-md font-headline-md text-ink">Review Extracted Data</h2>
                <p className="text-caption font-caption text-on-surface-variant">Please verify the information before continuing.</p>
              </div>
              <div className="flex gap-4">
                <button onClick={resetFlow} className="px-6 py-2 border border-parchment-border text-ink rounded text-label-md font-label-md hover:bg-surface-container-low transition-colors duration-200">Annuler</button>
                <button onClick={() => router.push('/review')} className="px-6 py-2 bg-success-green text-on-primary rounded text-label-md font-label-md hover:opacity-90 transition-opacity shadow-sm">Continuer vers le Profil</button>
              </div>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Personal Info Card */}
              <div className="border border-parchment-border rounded p-6 bg-surface-bright">
                <div className="flex justify-between items-center mb-4 border-b border-parchment-border pb-2">
                  <h3 className="text-label-md font-label-md text-ink uppercase tracking-wider font-semibold">Personal Information</h3>
                  <button className="text-primary text-label-sm font-label-sm flex items-center gap-1 hover:underline" onClick={() => router.push('/settings')}>
                    <span className="material-symbols-outlined text-[16px]" data-icon="edit">edit</span> Edit
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-caption font-caption text-on-surface-variant block mb-1">Full Name</label>
                    <div className="text-body-md font-body-md text-ink">{extractedData?.name || "No data"}</div>
                  </div>
                  <div>
                    <label className="text-caption font-caption text-on-surface-variant block mb-1">Email</label>
                    <div className="text-body-md font-body-md text-ink">{extractedData?.email || "No data"}</div>
                  </div>
                  <div>
                    <label className="text-caption font-caption text-on-surface-variant block mb-1">Phone</label>
                    <div className="text-body-md font-body-md text-ink">{extractedData?.phone || "No data"}</div>
                  </div>
                  <div>
                    <label className="text-caption font-caption text-on-surface-variant block mb-1">Location</label>
                    <div className="text-body-md font-body-md text-ink">{extractedData?.location || "No data"}</div>
                  </div>
                </div>
              </div>
              
              {/* Experience Card */}
              <div className="border border-parchment-border rounded p-6 bg-surface-bright relative">
                {/* AI Suggestion Note */}
                <div className="absolute -right-4 -top-4 bg-surface-container px-3 py-2 border border-parchment-border rounded shadow-sm flex items-start gap-2 max-w-xs">
                  <span className="material-symbols-outlined text-[16px] text-primary mt-[2px]" data-icon="auto_awesome">auto_awesome</span>
                  <p className="text-caption font-caption text-on-surface-variant leading-tight">Dates optimized for ATS readability.</p>
                </div>
                <div className="flex justify-between items-center mb-4 border-b border-parchment-border pb-2">
                  <h3 className="text-label-md font-label-md text-ink uppercase tracking-wider font-semibold">Experience</h3>
                  <button className="text-primary text-label-sm font-label-sm flex items-center gap-1 hover:underline" onClick={() => router.push('/editor')}>
                    <span className="material-symbols-outlined text-[16px]" data-icon="edit">edit</span> Edit
                  </button>
                </div>
                <div className="space-y-6">
                  {extractedData?.experiences?.length ? extractedData.experiences.map((exp: any, i: number) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="text-body-md font-body-md font-semibold text-ink">{exp.title}</h4>
                        <span className="text-caption font-caption text-on-surface-variant">{exp.dates}</span>
                      </div>
                      <div className="text-body-md font-body-md text-on-surface-variant mb-2">{exp.company}</div>
                      <ul className="list-disc list-outside ml-4 space-y-1 text-body-md font-body-md text-ink">
                        {exp.highlights?.map((h: string, j: number) => <li key={j}>{h}</li>)}
                      </ul>
                    </div>
                  )) : (
                    <div className="text-body-md font-body-md text-on-surface-variant">No experiences extracted</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-surface-container-low border-t border-parchment-border w-full mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-margin-desktop py-12 max-w-max-width mx-auto">
          <div className="text-headline-md font-headline-md font-bold text-ink mb-4 md:mb-0">EasyWork</div>
          <p className="text-body-md font-body-md text-on-surface-variant mb-4 md:mb-0">© 2026 EasyWork. Editorial Professionalism.</p>
          <div className="flex gap-6">
            <Link className="text-on-surface-variant text-label-sm font-label-sm hover:text-primary transition-colors" href="/legal">Mentions Légales</Link>
            <Link className="text-on-surface-variant text-label-sm font-label-sm hover:text-primary transition-colors" href="/privacy">RGPD</Link>
            <Link className="text-on-surface-variant text-label-sm font-label-sm hover:text-primary transition-colors" href="/support">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
