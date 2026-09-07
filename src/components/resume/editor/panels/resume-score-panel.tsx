"use client";

import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, AlertOctagon, AlertTriangle, Lightbulb, MapPin, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { generateResumeScore } from "@/utils/actions/resumes/actions";
import { Resume, ActionableBlocker } from "@/lib/types";
import { ApiKey } from "@/utils/ai-tools";

export interface ResumeScoreMetrics {
  overallScore: {
    score: number;
    reason: string;
  };
  blockers?: ActionableBlocker[];
  completeness: {
    contactInformation: {
      score: number;
      reason: string;
    };
    detailLevel: {
      score: number;
      reason: string;
    };
  };
  impactScore: {
    activeVoiceUsage: {
      score: number;
      reason: string;
    };
    quantifiedAchievements: {
      score: number;
      reason: string;
    };
  };
  roleMatch: {
    skillsRelevance: {
      score: number;
      reason: string;
    };
    experienceAlignment: {
      score: number;
      reason: string;
    };
    educationFit: {
      score: number;
      reason: string;
    };
  };
  miscellaneous?: {
    [key: string]: {
      score?: number;
      reason?: string;
    } | number | undefined;
  };
  overallImprovements: string[];
}

interface ResumeScorePanelProps {
  resume: Resume;
}

const LOCAL_STORAGE_KEY = 'easywork-resume-scores';
const MAX_SCORES = 10;

function getStoredScores(resumeId: string): ResumeScoreMetrics | null {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return null;
    
    const scores = new Map(JSON.parse(stored));
    return scores.get(resumeId) as ResumeScoreMetrics | null;
  } catch (error) {
    console.error('Error reading stored scores:', error);
    return null;
  }
}

function updateStoredScores(resumeId: string, score: ResumeScoreMetrics) {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    const scores = stored ? new Map(JSON.parse(stored)) : new Map();

    if (scores.size >= MAX_SCORES) {
      const oldestKey = scores.keys().next().value;
      scores.delete(oldestKey);
    }

    scores.set(resumeId, score);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(Array.from(scores)));
  } catch (error) {
    console.error('Error storing score:', error);
  }
}

const SEVERITY_CONFIG = {
  critical: {
    label: "Critique",
    icon: AlertOctagon,
    border: "border-l-rose-500 border-rose-200",
    bg: "bg-rose-50/50",
    badge: "bg-rose-100 text-rose-800 border-rose-300",
    iconColor: "text-rose-600",
  },
  warning: {
    label: "Important",
    icon: AlertTriangle,
    border: "border-l-amber-500 border-amber-200",
    bg: "bg-amber-50/50",
    badge: "bg-amber-100 text-amber-800 border-amber-300",
    iconColor: "text-amber-600",
  },
  tip: {
    label: "Conseil",
    icon: Lightbulb,
    border: "border-l-sky-500 border-sky-200",
    bg: "bg-sky-50/50",
    badge: "bg-sky-100 text-sky-800 border-sky-300",
    iconColor: "text-sky-600",
  },
};

export default function ResumeScorePanel({ resume }: ResumeScorePanelProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [scoreData, setScoreData] = useState<ResumeScoreMetrics | null>(() => {
    return getStoredScores(resume.id);
  });

  useEffect(() => {
    const storedScore = getStoredScores(resume.id);
    if (storedScore) {
      setScoreData(storedScore);
    }
  }, [resume.id]);

  const handleRecalculate = async () => {
    setIsCalculating(true);
    try {
      const MODEL_STORAGE_KEY = 'easywork-default-model';
      const selectedModel = localStorage.getItem(MODEL_STORAGE_KEY);
      const apiKeys: string[] = [];
      
      const newScore = await generateResumeScore({
        ...resume,
        section_configs: undefined,
        section_order: undefined
      }, {
        model: selectedModel || '',
        apiKeys: apiKeys as unknown as ApiKey[]
      });

      setScoreData(newScore as ResumeScoreMetrics);
      updateStoredScores(resume.id, newScore as ResumeScoreMetrics);
    } catch (error) {
      console.error("Error generating score:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  if (!scoreData) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 p-6">
        <Card className="relative overflow-hidden bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border-white/60 shadow-lg">
          <div className="p-8 flex flex-col items-center gap-6 text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Diagnostic ATS & Audit Actionnable
            </h1>
            <p className="text-muted-foreground text-sm max-w-md">
              Analysez votre CV pour identifier précisément les points bloquants, les lacunes de mots-clés et les actions correctives recommandées.
            </p>
            <Button
              onClick={handleRecalculate}
              disabled={isCalculating}
              size="lg"
              className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:opacity-90 shadow-md cursor-pointer"
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", isCalculating && "animate-spin")} />
              {isCalculating ? "Audit approfondi en cours..." : "Lancer le diagnostic actionnable"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const blockers = scoreData.blockers || [];

  return (
    <div className="max-w-3xl mx-auto space-y-5 p-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Diagnostic Actionnable du CV</h1>
          <p className="text-xs text-muted-foreground">Priorisez la résolution des points bloquants pour franchir les filtres ATS.</p>
        </div>
        <Button
          onClick={handleRecalculate}
          disabled={isCalculating}
          size="sm"
          variant="outline"
          className="bg-white/80 hover:bg-white border-gray-200 cursor-pointer text-xs"
        >
          <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", isCalculating && "animate-spin")} />
          Actualiser l&apos;audit
        </Button>
      </div>

      {/* PRIORITÉ 1 : POINTS BLOQUANTS ACTIONNABLES (Point 2 consigne) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-700 flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 text-rose-600" />
            Points bloquants identifiés ({blockers.length})
          </h2>
          <span className="text-xs text-muted-foreground">À corriger en priorité</span>
        </div>

        {blockers.length === 0 ? (
          <Card className="p-4 bg-emerald-50/50 border-emerald-200 text-center">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
            <p className="text-xs font-semibold text-emerald-800">Aucun point bloquant critique détecté !</p>
            <p className="text-[11px] text-emerald-600">Votre CV répond bien aux standards de structure et de lisibilité ATS.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {blockers.map((blocker, idx) => {
              const cfg = SEVERITY_CONFIG[blocker.severity] || SEVERITY_CONFIG.warning;
              const Icon = cfg.icon;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    "p-4 rounded-xl border border-l-4 shadow-xs bg-white space-y-2.5 transition-all hover:shadow-md",
                    cfg.border
                  )}
                >
                  {/* Top line: severity badge, location, title */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 flex-1">
                      <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", cfg.iconColor)} />
                      <div className="space-y-0.5 flex-1">
                        <h3 className="text-sm font-bold text-gray-900">{blocker.issue}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span>Localisation : <strong>{blocker.location}</strong></span>
                        </div>
                      </div>
                    </div>

                    <Badge variant="outline" className={cn("text-[10px] font-bold uppercase tracking-wider shrink-0", cfg.badge)}>
                      {cfg.label}
                    </Badge>
                  </div>

                  {/* Why it blocks */}
                  <div className="bg-gray-50/80 rounded-lg p-2.5 text-xs text-gray-700 border border-gray-100">
                    <span className="font-semibold text-gray-800">Pourquoi cela bloque : </span>
                    <span>{blocker.why}</span>
                  </div>

                  {/* Actionable fix */}
                  <div className="bg-emerald-50/80 rounded-lg p-2.5 text-xs text-emerald-950 border border-emerald-200/80 flex items-start gap-2">
                    <ArrowRight className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-800">Action corrective recommandée : </span>
                      <span>{blocker.fix}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECONDAIRE : SCORE GLOBAL ET RÉPARTITION (Le score reste secondaire à l'affichage) */}
      <Card className="p-5 bg-gradient-to-br from-slate-50/80 to-teal-50/40 border-gray-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 shrink-0">
            <CircularProgressbar
              value={scoreData.overallScore.score}
              text={`${scoreData.overallScore.score}%`}
              styles={buildStyles({
                pathColor: scoreData.overallScore.score >= 80 ? '#0F766E' : scoreData.overallScore.score >= 60 ? '#D97706' : '#E11D48',
                textColor: '#0F766E',
                trailColor: '#E2E8F0',
                textSize: '24px',
              })}
            />
          </div>
          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Indicateur ATS Global</span>
              <span className="text-xs font-bold text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded-full">
                {scoreData.overallScore.score >= 80 ? "Solide" : scoreData.overallScore.score >= 60 ? "Moyen" : "Critique"}
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{scoreData.overallScore.reason}</p>
          </div>
        </div>
      </Card>

      {/* Axis Breakdown (Completeness, Impact, Role Match) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {Object.entries({
          "Complétude": scoreData.completeness,
          "Impact & Verbes": scoreData.impactScore,
          "Alignement Profil": scoreData.roleMatch,
        }).map(([title, metrics]) => (
          <Card key={title} className="p-4 bg-white border-gray-100 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">{title}</h3>
            <div className="space-y-3">
              {Object.entries(metrics).map(([label, data]) => {
                const item = data as { score: number; reason: string };
                return (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 text-[11px] truncate">{label}</span>
                      <span className="font-semibold text-gray-900 text-[11px]">{item.score}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          item.score >= 80 ? "bg-teal-500" : item.score >= 60 ? "bg-amber-500" : "bg-rose-500"
                        )}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}