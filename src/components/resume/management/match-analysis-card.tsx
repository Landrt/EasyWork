'use client';

import React, { useState } from 'react';
import { MatchAnalysis, MatchItem, MatchStatus } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, HelpCircle, XCircle, Search, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface MatchAnalysisCardProps {
  matchAnalysis?: MatchAnalysis | null;
  className?: string;
}

const STATUS_DETAILS: Record<MatchStatus, {
  label: string;
  icon: React.ElementType;
  badgeClass: string;
  borderClass: string;
  bgClass: string;
}> = {
  demonstrated: {
    label: 'Démontrée',
    icon: CheckCircle2,
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    borderClass: 'border-l-emerald-500',
    bgClass: 'bg-emerald-50/40',
  },
  weakly_demonstrated: {
    label: 'À renforcer',
    icon: AlertTriangle,
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    borderClass: 'border-l-amber-500',
    bgClass: 'bg-amber-50/40',
  },
  to_confirm: {
    label: 'À confirmer',
    icon: HelpCircle,
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    borderClass: 'border-l-indigo-500',
    bgClass: 'bg-indigo-50/40',
  },
  absent: {
    label: 'Absente',
    icon: XCircle,
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
    borderClass: 'border-l-rose-500',
    bgClass: 'bg-rose-50/40',
  },
};

export function MatchAnalysisCard({ matchAnalysis, className }: MatchAnalysisCardProps) {
  const [filter, setFilter] = useState<MatchStatus | 'all'>('all');

  if (!matchAnalysis || !matchAnalysis.items || matchAnalysis.items.length === 0) {
    return (
      <Card className={cn("p-6 text-center border-dashed border-gray-200 bg-gray-50/50", className)}>
        <Sparkles className="h-6 w-6 text-purple-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-700">Aucune analyse d&apos;adéquation calculée pour le moment.</p>
        <p className="text-xs text-muted-foreground mt-1">L&apos;analyse de correspondance Offre ↔ Profil sera générée lors de l&apos;adaptation.</p>
      </Card>
    );
  }

  const items = matchAnalysis.items;
  const counts = {
    demonstrated: items.filter(i => i.status === 'demonstrated').length,
    weakly_demonstrated: items.filter(i => i.status === 'weakly_demonstrated').length,
    to_confirm: items.filter(i => i.status === 'to_confirm').length,
    absent: items.filter(i => i.status === 'absent').length,
  };

  const filteredItems = filter === 'all' ? items : items.filter(i => i.status === filter);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {(['demonstrated', 'weakly_demonstrated', 'to_confirm', 'absent'] as MatchStatus[]).map((statusKey) => {
          const detail = STATUS_DETAILS[statusKey];
          const Icon = detail.icon;
          const isActive = filter === statusKey;
          const count = counts[statusKey];

          return (
            <button
              key={statusKey}
              type="button"
              onClick={() => setFilter(isActive ? 'all' : statusKey)}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border text-left transition-all duration-200 cursor-pointer",
                detail.bgClass,
                isActive ? "ring-2 ring-purple-500 shadow-sm" : "hover:border-gray-300"
              )}
            >
              <div>
                <p className="text-xs font-semibold text-gray-700">{detail.label}</p>
                <p className="text-xl font-bold mt-0.5 text-gray-900">{count}</p>
              </div>
              <Icon className={cn("h-5 w-5 opacity-70", detail.badgeClass.split(' ')[1])} />
            </button>
          );
        })}
      </div>

      {/* Filter indicator */}
      {filter !== 'all' && (
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>Filtré par statut : <strong>{STATUS_DETAILS[filter].label}</strong></span>
          <button 
            type="button" 
            onClick={() => setFilter('all')} 
            className="text-purple-600 hover:underline font-medium cursor-pointer"
          >
            Afficher tout ({items.length})
          </button>
        </div>
      )}

      {/* Item List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => {
            const detail = STATUS_DETAILS[item.status] || STATUS_DETAILS.to_confirm;
            const Icon = detail.icon;

            return (
              <motion.div
                key={`${item.requirement}-${index}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "p-4 rounded-lg bg-white border border-gray-100 shadow-xs border-l-4 transition-all hover:shadow-sm",
                  detail.borderClass
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 flex-1">
                    <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", detail.badgeClass.split(' ')[1])} />
                    <div className="space-y-1.5 flex-1">
                      <p className="text-sm font-semibold text-gray-900 leading-snug">{item.requirement}</p>
                      
                      {item.evidence && (
                        <div className="text-xs text-gray-600 bg-gray-50/80 rounded-md p-2 border border-gray-100">
                          <span className="font-semibold text-gray-700">Preuve détectée : </span>
                          <span>{item.evidence}</span>
                        </div>
                      )}

                      {item.suggestion && (
                        <div className="text-xs text-amber-800 bg-amber-50/60 rounded-md p-2 border border-amber-200/60">
                          <span className="font-semibold">💡 Recommandation : </span>
                          <span>{item.suggestion}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Badge variant="outline" className={cn("text-[11px] font-semibold shrink-0 uppercase tracking-wide", detail.badgeClass)}>
                    {detail.label}
                  </Badge>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Missing Keywords Section */}
      {matchAnalysis.missingKeywords && matchAnalysis.missingKeywords.length > 0 && (
        <Card className="p-4 bg-gradient-to-br from-rose-50/40 via-white to-orange-50/30 border-rose-200/60">
          <div className="flex items-center gap-2 mb-2.5">
            <Search className="h-4 w-4 text-rose-600" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-800">
              Mots-clés manquants prioritaires ({matchAnalysis.missingKeywords.length})
            </h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {matchAnalysis.missingKeywords.map((kw, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md text-xs font-medium bg-rose-100/80 text-rose-700 border border-rose-200 shadow-2xs"
              >
                + {kw}
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
