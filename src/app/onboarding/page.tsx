"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface Answer {
  question: string;
  answer: string;
}

interface AIQuestion {
  done: boolean;
  question?: string;
  type?: 'radio' | 'text';
  options?: string[] | null;
  placeholder?: string | null;
}

// First question is always hardcoded (no AI key needed to start)
const FIRST_QUESTION: AIQuestion = {
  done: false,
  question: "Quel est votre objectif professionnel actuel ?",
  type: 'radio',
  options: [
    "Recherche active d'un nouveau poste",
    "Écoute du marché",
    "Évolution en interne",
    "Reconversion professionnelle"
  ],
  placeholder: null
};

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cvId = searchParams.get('cvId');
  const template = searchParams.get('template');
  
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<AIQuestion>(FIRST_QUESTION);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [textAnswer, setTextAnswer] = useState('');
  const [loadingNext, setLoadingNext] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalSteps] = useState(4); // approximate

  const currentStep = answers.length + 1;
  const progressPct = Math.min((answers.length / totalSteps) * 100, 90);

  const navigateToEditor = () => {
    if (cvId) {
      router.push(`/editor?cvId=${cvId}&template=${template || 'modern'}`);
    } else {
      router.push('/editor');
    }
  };

  const fetchNextQuestion = async (updatedAnswers: Answer[]) => {
    setLoadingNext(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: updatedAnswers })
      });
      const data: AIQuestion = await res.json();

      if (!res.ok) throw new Error((data as any).error || 'Erreur IA');

      if (data.done) {
        sessionStorage.setItem('onboardingAnswers', JSON.stringify(updatedAnswers));
        navigateToEditor();
      } else {
        setCurrentQuestion(data);
        setSelectedAnswer('');
        setTextAnswer('');
      }
    } catch (e: any) {
      setError(e.message || 'Erreur lors du chargement de la question suivante.');
    } finally {
      setLoadingNext(false);
    }
  };

  const handleContinue = async () => {
    const answer = currentQuestion.type === 'radio' ? selectedAnswer : textAnswer;
    if (!answer.trim()) return;

    const newAnswer: Answer = {
      question: currentQuestion.question || '',
      answer
    };
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    await fetchNextQuestion(updatedAnswers);
  };

  const handleSkip = () => {
    sessionStorage.setItem('onboardingAnswers', JSON.stringify(answers));
    navigateToEditor();
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md selection:bg-surface-variant">
      <header className="bg-background w-full border-b border-parchment-border">
        <div className="flex justify-between items-center w-full px-margin-desktop py-4 max-w-max-width mx-auto">
          <Link className="text-headline-md font-headline-md font-bold text-ink" href="/">EasyWork</Link>
          <button className="text-on-surface-variant hover:text-ink transition-colors text-label-md font-label-md" onClick={handleSkip}>
            Passer et continuer
          </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-margin-desktop py-12 max-w-max-width mx-auto w-full relative">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-parchment-border">
          <div
            className="h-full bg-ink transition-all duration-700 ease-in-out"
            style={{ width: `${progressPct}%` }}
          ></div>
        </div>

        <div className="w-full max-w-[600px] flex flex-col gap-10">
          
          {/* Step indicator */}
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            <span className="text-caption font-caption">Assistant Éditorial · Étape {currentStep}</span>
          </div>

          {/* Loading State */}
          {loadingNext ? (
            <div className="flex flex-col items-center gap-6 py-16">
              <span className="material-symbols-outlined text-[48px] text-clay-accent" style={{animation: 'spin 1s linear infinite'}}>autorenew</span>
              <p className="text-body-lg font-body-lg text-on-surface-variant text-center">L'IA prépare la prochaine question...</p>
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <>
              {/* Question */}
              <div>
                <h1 className="text-display-lg font-display-lg text-ink mb-4 leading-tight">
                  {currentQuestion.question}
                </h1>
                {currentStep > 1 && (
                  <p className="text-body-md font-body-md text-on-surface-variant">
                    Votre réponse aide l'IA à personnaliser la rédaction de votre CV.
                  </p>
                )}
              </div>

              {/* Radio Options */}
              {currentQuestion.type === 'radio' && currentQuestion.options && (
                <div className="flex flex-col gap-3">
                  {currentQuestion.options.map((option) => (
                    <label
                      key={option}
                      className={`group relative flex items-center p-4 border rounded bg-surface cursor-pointer transition-all ${
                        selectedAnswer === option
                          ? 'border-ink shadow-[inset_0_0_0_2px_rgba(28,27,22,0.1)] bg-surface-container-low'
                          : 'border-parchment-border hover:border-clay-accent'
                      }`}
                      onClick={() => setSelectedAnswer(option)}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-4 flex-shrink-0 transition-all ${
                        selectedAnswer === option ? 'border-ink bg-ink' : 'border-outline'
                      }`}>
                        {selectedAnswer === option && (
                          <div className="w-2 h-2 rounded-full bg-surface"></div>
                        )}
                      </div>
                      <span className="text-body-lg font-body-lg text-ink">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Text Input */}
              {currentQuestion.type === 'text' && (
                <div>
                  <textarea
                    className="w-full border border-parchment-border rounded p-4 bg-surface text-ink text-body-md font-body-md focus:border-ink focus:outline-none resize-none h-28 placeholder:text-on-surface-variant transition-colors"
                    placeholder={currentQuestion.placeholder || 'Votre réponse...'}
                    value={textAnswer}
                    onChange={e => setTextAnswer(e.target.value)}
                  />
                </div>
              )}

              {error && (
                <div className="p-4 bg-error-container border border-error rounded text-error text-body-md font-body-md flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-parchment-border">
                <button
                  className="text-on-surface-variant hover:text-ink transition-colors text-label-md font-label-md flex items-center gap-2"
                  onClick={() => window.history.back()}
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Précédent
                </button>
                <button
                  className="bg-success-green text-on-primary px-8 py-3 rounded min-h-[44px] text-label-md font-label-md hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={handleContinue}
                  disabled={currentQuestion.type === 'radio' ? !selectedAnswer : !textAnswer.trim()}
                >
                  Continuer
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>

              {/* Previous answers recap */}
              {answers.length > 0 && (
                <div className="mt-4 p-4 bg-surface-container-low border border-parchment-border rounded space-y-2">
                  <p className="text-label-sm font-label-sm uppercase text-on-surface-variant tracking-wider mb-2">Vos réponses</p>
                  {answers.map((a, i) => (
                    <div key={i} className="flex gap-2 text-caption font-caption">
                      <span className="text-on-surface-variant">{a.question.substring(0, 40)}...</span>
                      <span className="text-ink font-medium">→ {a.answer}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
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
