"use client";

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSession } from '@/lib/session';

interface Answer {
  question: string;
  answer: string;
}

const FIRST_QUESTION = "Bonjour ! Parlez-moi de vous en quelques phrases : quel est votre métier actuel, votre niveau d'expérience et quel poste ou opportunité visez-vous ?";
const FIRST_PLACEHOLDER = "Exemple : Je suis Développeur Full Stack avec 4 ans d'expérience chez X. J'ai réalisé des projets en React/Node et je cherche un poste de Lead Dev...";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cvId = searchParams.get('cvId');
  const template = searchParams.get('template') || 'modern';
  
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(FIRST_QUESTION);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(FIRST_PLACEHOLDER);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingCv, setGeneratingCv] = useState(false);
  const [comprehensionScore, setComprehensionScore] = useState(25);
  const [error, setError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = getSession();
    if (user) setSessionUser(user);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentQuestion, loading]);

  const generateFullCvAndNavigate = async (finalAnswers: Answer[]) => {
    setGeneratingCv(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: finalAnswers,
          candidateName: sessionUser?.name || 'Mon Profil',
          candidateEmail: sessionUser?.email || 'contact@email.com'
        })
      });

      if (!res.ok) {
        throw new Error('Erreur lors de la génération du CV par l\'IA.');
      }

      const data = await res.json();
      if (data.cvData) {
        sessionStorage.setItem('current_cv', JSON.stringify(data.cvData));
        sessionStorage.setItem('importedProfile', JSON.stringify(data.cvData));
        sessionStorage.setItem('onboardingAnswers', JSON.stringify(finalAnswers));
      }

      let url = `/editor?template=${template}`;
      if (cvId) {
        url += `&cvId=${cvId}`;
      }
      router.push(url);
    } catch (e: any) {
      console.error(e);
      // Repli fluide vers l'éditeur même en cas de souci réseau
      sessionStorage.setItem('onboardingAnswers', JSON.stringify(finalAnswers));
      router.push(`/editor?template=${template}`);
    }
  };

  const handleSendAnswer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanAnswer = userInput.trim();
    if (!cleanAnswer || loading || generatingCv) return;

    const newAnswer: Answer = {
      question: currentQuestion,
      answer: cleanAnswer
    };
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    setUserInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: updatedAnswers })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur IA');

      if (data.comprehensionScore) {
        setComprehensionScore(data.comprehensionScore);
      } else {
        setComprehensionScore(prev => Math.min(prev + 25, 95));
      }

      // Si l'IA a compris le profil ou a posé assez de questions
      if (data.done || updatedAnswers.length >= 4) {
        setComprehensionScore(100);
        await generateFullCvAndNavigate(updatedAnswers);
      } else if (data.question) {
        setCurrentQuestion(data.question);
        if (data.placeholder) setCurrentPlaceholder(data.placeholder);
      } else {
        await generateFullCvAndNavigate(updatedAnswers);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'échange avec l\'IA.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishEarly = async () => {
    if (answers.length === 0 && !userInput.trim()) {
      // Si aucune réponse n'a été saisie, naviguer directement vers l'éditeur
      router.push(`/editor?template=${template}`);
      return;
    }

    let finalAnswers = [...answers];
    if (userInput.trim()) {
      finalAnswers.push({
        question: currentQuestion,
        answer: userInput.trim()
      });
    }
    await generateFullCvAndNavigate(finalAnswers);
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md selection:bg-surface-variant">
      {/* Header */}
      <header className="bg-background w-full border-b border-parchment-border">
        <div className="flex justify-between items-center w-full px-margin-desktop py-4 max-w-max-width mx-auto">
          <div className="flex items-center gap-3">
            <Link className="text-headline-md font-headline-md font-bold text-ink" href="/dashboard">
              EasyWork
            </Link>
            <span className="text-caption font-caption px-2 py-0.5 rounded bg-surface-container-low border border-parchment-border text-on-surface-variant uppercase tracking-wider">
              Assistant QRO
            </span>
          </div>
          <button 
            className="text-on-surface-variant hover:text-ink transition-colors text-label-md font-label-md flex items-center gap-1.5" 
            onClick={handleFinishEarly}
            disabled={generatingCv}
          >
            <span>Générer mon CV tout de suite</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-between px-margin-mobile md:px-margin-desktop py-8 max-w-3xl mx-auto w-full relative">
        {/* Progress Bar de Compréhension IA */}
        <div className="w-full mb-6">
          <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1.5 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-clay-accent">psychology</span>
              <span>Compréhension de votre profil par l&apos;IA</span>
            </div>
            <span>{comprehensionScore}%</span>
          </div>
          <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div 
              className="h-full bg-ink transition-all duration-500 ease-out rounded-full"
              style={{ width: `${comprehensionScore}%` }}
            ></div>
          </div>
        </div>

        {/* Conversation Stream (QRO Ouvert) */}
        <div className="w-full flex-1 flex flex-col gap-6 overflow-y-auto mb-6 pr-1">
          {/* Messages précédents */}
          {answers.map((a, i) => (
            <div key={i} className="space-y-3">
              {/* Question de l'IA */}
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-surface-container-high border border-parchment-border flex items-center justify-center flex-shrink-0 text-ink">
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                </div>
                <div className="bg-surface border border-parchment-border p-4 rounded-lg rounded-tl-none max-w-[85%] shadow-sm">
                  <p className="text-body-md font-body-md text-ink leading-relaxed">{a.question}</p>
                </div>
              </div>

              {/* Réponse libre de l'utilisateur */}
              <div className="flex gap-3 items-start justify-end">
                <div className="bg-ink text-surface p-4 rounded-lg rounded-tr-none max-w-[85%] shadow-sm">
                  <p className="text-body-md font-body-md leading-relaxed">{a.answer}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center flex-shrink-0 text-surface text-xs font-bold">
                  {sessionUser?.name ? sessionUser.name.charAt(0).toUpperCase() : 'M'}
                </div>
              </div>
            </div>
          ))}

          {/* Question Actuelle */}
          {!generatingCv && (
            <div className="flex gap-3 items-start animate-fadeIn">
              <div className="w-8 h-8 rounded-full bg-surface-container-high border border-parchment-border flex items-center justify-center flex-shrink-0 text-ink">
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              </div>
              <div className="bg-surface border border-parchment-border p-4 rounded-lg rounded-tl-none max-w-[85%] shadow-sm">
                <p className="text-body-lg font-body-lg text-ink font-medium leading-relaxed">
                  {currentQuestion}
                </p>
              </div>
            </div>
          )}

          {/* État de réflexion IA */}
          {loading && (
            <div className="flex gap-3 items-center text-on-surface-variant text-caption italic animate-pulse">
              <span className="material-symbols-outlined text-[18px] animate-spin">autorenew</span>
              <span>L&apos;IA analyse vos informations et calibre les questions...</span>
            </div>
          )}

          {/* État de Génération Finale du CV */}
          {generatingCv && (
            <div className="flex flex-col items-center justify-center py-12 gap-4 bg-surface border border-parchment-border rounded-xl p-8 text-center shadow-sm animate-fadeIn">
              <span className="material-symbols-outlined text-[48px] text-clay-accent animate-spin">
                auto_awesome
              </span>
              <div className="space-y-2 max-w-md">
                <h3 className="text-headline-md font-headline-md text-ink">Profil parfaitement compris !</h3>
                <p className="text-body-md font-body-md text-on-surface-variant leading-relaxed">
                  L&apos;IA rédige votre CV complet (expériences valorisées, compétences ATS et résumé professionnel)...
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Zone : Question à Réponse Ouverte (QRO) */}
        {!generatingCv && (
          <div className="w-full bg-surface border border-parchment-border rounded-xl p-3 shadow-sm flex flex-col gap-3">
            <textarea
              ref={textareaRef}
              rows={3}
              className="w-full bg-transparent border-0 resize-none focus:ring-0 text-body-md font-body-md text-ink placeholder:text-outline-variant placeholder:italic p-2"
              placeholder={currentPlaceholder}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendAnswer();
                }
              }}
              disabled={loading}
            ></textarea>

            {error && <p className="text-error text-xs px-2">{error}</p>}

            <div className="flex items-center justify-between pt-2 border-t border-parchment-border/60">
              <span className="text-caption font-caption text-on-surface-variant hidden sm:inline">
                Appuyez sur <kbd className="px-1.5 py-0.5 rounded bg-surface-container-high border border-parchment-border text-[10px]">Entrée</kbd> pour envoyer
              </span>
              
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={handleFinishEarly}
                  className="px-4 py-2 text-label-sm font-label-sm text-on-surface-variant hover:text-ink transition-colors"
                >
                  Passer à l&apos;éditeur
                </button>
                <button
                  type="button"
                  onClick={() => handleSendAnswer()}
                  disabled={!userInput.trim() || loading}
                  className="bg-success-green text-on-primary px-5 py-2.5 rounded text-label-sm font-label-sm uppercase hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed font-bold"
                >
                  <span>Envoyer</span>
                  <span className="material-symbols-outlined text-[16px]">send</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-on-surface-variant">Chargement...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
