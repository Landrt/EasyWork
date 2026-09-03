"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface Answer {
  question: string;
  answer: string;
}

interface StepQuestion {
  question: string;
  type: 'radio' | 'text';
  options: string[];
}

const ONBOARDING_STEPS: StepQuestion[] = [
  {
    question: "Quel est votre objectif professionnel actuel ?",
    type: 'radio',
    options: [
      "Recherche active d'un nouveau poste",
      "Écoute du marché & opportunités",
      "Reconversion professionnelle",
      "Premier emploi ou stage"
    ]
  },
  {
    question: "Dans quel domaine d'activité souhaitez-vous postuler ?",
    type: 'radio',
    options: [
      "Informatique, Tech & Développement",
      "Marketing, Communication & Ventes",
      "Finance, Comptabilité & Gestion",
      "Ingénierie, Industrie & Logistique",
      "Ressources Humaines & Juridique",
      "Autre domaine"
    ]
  },
  {
    question: "Quel est votre niveau d'expérience global ?",
    type: 'radio',
    options: [
      "Débutant / Junior (0 à 2 ans)",
      "Intermédiaire (3 à 5 ans)",
      "Confirmé / Senior (6 à 10 ans)",
      "Expert / Manager (+ de 10 ans)"
    ]
  }
];

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cvId = searchParams.get('cvId');
  const template = searchParams.get('template');
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);

  const currentQuestion = ONBOARDING_STEPS[currentStepIndex];
  const totalSteps = ONBOARDING_STEPS.length;
  const currentStep = currentStepIndex + 1;
  const progressPct = (currentStep / totalSteps) * 100;

  const navigateToEditor = (finalAnswers?: Answer[]) => {
    const savedAnswers = finalAnswers || answers;
    sessionStorage.setItem('onboardingAnswers', JSON.stringify(savedAnswers));
    let url = `/editor?template=${template || 'modern'}`;
    if (cvId) {
      url += `&cvId=${cvId}`;
    }
    router.push(url);
  };

  const handleContinue = () => {
    if (!selectedAnswer.trim()) return;

    const newAnswer: Answer = {
      question: currentQuestion.question,
      answer: selectedAnswer
    };
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (currentStepIndex + 1 < totalSteps) {
      // Transition INSTANTANÉE (0 milliseconde de latence) vers la question suivante
      setCurrentStepIndex(prev => prev + 1);
      setSelectedAnswer('');
    } else {
      // Dernière étape terminée : finalisation fluide
      setIsFinishing(true);
      setTimeout(() => {
        navigateToEditor(updatedAnswers);
      }, 500);
    }
  };

  const handleSkip = () => {
    navigateToEditor();
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setSelectedAnswer(answers[currentStepIndex - 1]?.answer || '');
      setAnswers(prev => prev.slice(0, prev.length - 1));
    } else {
      window.history.back();
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md selection:bg-surface-variant">
      <header className="bg-background w-full border-b border-parchment-border">
        <div className="flex justify-between items-center w-full px-margin-desktop py-4 max-w-max-width mx-auto">
          <Link className="text-headline-md font-headline-md font-bold text-ink" href="/dashboard">
            EasyWork
          </Link>
          <button 
            className="text-on-surface-variant hover:text-ink transition-colors text-label-md font-label-md" 
            onClick={handleSkip}
          >
            Passer et continuer
          </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-margin-desktop py-12 max-w-max-width mx-auto w-full relative">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-parchment-border">
          <div
            className="h-full bg-ink transition-all duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
          ></div>
        </div>

        <div className="w-full max-w-[600px] flex flex-col gap-10">
          {/* Step indicator */}
          <div className="flex items-center justify-between text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              <span className="text-caption font-caption">Assistant QRO · Question {currentStep} sur {totalSteps}</span>
            </div>
            <button onClick={handleSkip} className="text-caption font-caption hover:text-ink underline">
              Aller directement au CV →
            </button>
          </div>

          {isFinishing ? (
            <div className="flex flex-col items-center gap-6 py-16 animate-fadeIn">
              <span className="material-symbols-outlined text-[48px] text-clay-accent animate-spin">
                autorenew
              </span>
              <div className="text-center space-y-1">
                <h2 className="text-headline-md font-headline-md text-ink">Profil configuré avec succès !</h2>
                <p className="text-body-md font-body-md text-on-surface-variant">
                  Génération et calibrage de votre CV en cours...
                </p>
              </div>
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
                    Sélectionnez l'option qui correspond le mieux à votre profil.
                  </p>
                )}
              </div>

              {/* Radio Options */}
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

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-parchment-border">
                <button
                  className="text-on-surface-variant hover:text-ink transition-colors text-label-md font-label-md flex items-center gap-2"
                  onClick={handlePrevious}
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Précédent
                </button>
                <button
                  className="bg-success-green text-on-primary px-8 py-3 rounded min-h-[44px] text-label-md font-label-md hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={handleContinue}
                  disabled={!selectedAnswer}
                >
                  <span>{currentStep === totalSteps ? 'Finaliser' : 'Continuer'}</span>
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
