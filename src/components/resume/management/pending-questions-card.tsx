'use client';

import React, { useState } from 'react';
import { PendingQuestion } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, CheckCircle, Send, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { updatePendingQuestions } from '@/utils/actions/resumes/actions';
import { toast } from '@/hooks/use-toast';

interface PendingQuestionsCardProps {
  resumeId: string;
  questions?: PendingQuestion[] | null;
  onQuestionsUpdated?: (questions: PendingQuestion[]) => void;
  className?: string;
}

export function PendingQuestionsCard({
  resumeId,
  questions = [],
  onQuestionsUpdated,
  className,
}: PendingQuestionsCardProps) {
  const [items, setItems] = useState<PendingQuestion[]>(questions || []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftAnswers, setDraftAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!items || items.length === 0) {
    return null;
  }

  const answeredCount = items.filter(q => !!q.answer).length;
  const pendingCount = items.length - answeredCount;

  const handleSaveAnswer = async (qId: string) => {
    const text = draftAnswers[qId]?.trim();
    if (!text) return;

    setIsSubmitting(true);
    try {
      const updated = items.map(q => {
        if (q.id === qId) {
          return {
            ...q,
            answer: text,
            answered_at: new Date().toISOString(),
          };
        }
        return q;
      });

      setItems(updated);
      await updatePendingQuestions(resumeId, updated);
      if (onQuestionsUpdated) onQuestionsUpdated(updated);
      setEditingId(null);

      toast({
        title: 'Réponse enregistrée',
        description: 'Vos précisions seront prises en compte pour affiner votre CV.',
      });
    } catch (error) {
      console.error('Error saving answer:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer votre réponse.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={cn("p-5 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/40 border-indigo-200/70 shadow-sm space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-indigo-100 text-indigo-700">
            <HelpCircle className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Questions de clarification de l&apos;IA</h3>
            <p className="text-xs text-muted-foreground">
              Clarifiez ces points pour permettre à l&apos;IA de maximiser l&apos;adéquation avec l&apos;offre sans rien inventer.
            </p>
          </div>
        </div>

        <Badge variant="outline" className={cn(
          "text-xs font-semibold",
          pendingCount > 0 ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-emerald-100 text-emerald-800 border-emerald-300"
        )}>
          {pendingCount > 0 ? `${pendingCount} à clarifier` : 'Toutes clarifiées ✓'}
        </Badge>
      </div>

      <div className="space-y-3">
        {items.map((q) => {
          const isAnswered = !!q.answer;
          const isEditing = editingId === q.id;

          return (
            <div
              key={q.id}
              className={cn(
                "p-3.5 rounded-lg border text-sm transition-all space-y-2",
                isAnswered
                  ? "bg-white/80 border-emerald-200 shadow-2xs"
                  : "bg-white border-indigo-200 shadow-xs ring-1 ring-indigo-500/10"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-gray-800 flex-1">{q.question}</span>
                {isAnswered && (
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 shrink-0">
                    <CheckCircle className="h-3 w-3" /> Répondu
                  </Badge>
                )}
              </div>

              {q.context && (
                <p className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded border border-gray-100">
                  Contexte : {q.context}
                </p>
              )}

              {isAnswered && !isEditing ? (
                <div className="bg-emerald-50/60 p-2.5 rounded-md border border-emerald-200 text-xs text-emerald-900 flex justify-between items-center gap-2">
                  <div>
                    <span className="font-semibold text-emerald-800">Votre précision : </span>
                    <span>{q.answer}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setDraftAnswers(prev => ({ ...prev, [q.id]: q.answer || '' }));
                      setEditingId(q.id);
                    }}
                    className="h-6 text-xs text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100/60 px-2"
                  >
                    Modifier
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <Textarea
                    placeholder="Ex: J'ai utilisé Kubernetes sur AWS EKS pendant 2 ans chez mon précédent employeur..."
                    value={draftAnswers[q.id] !== undefined ? draftAnswers[q.id] : (q.answer || '')}
                    onChange={(e) => setDraftAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    className="text-xs min-h-[60px] bg-white border-indigo-200 focus:border-indigo-400"
                  />
                  <div className="flex justify-end gap-2">
                    {isEditing && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingId(null)}
                        className="h-7 text-xs"
                      >
                        Annuler
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleSaveAnswer(q.id)}
                      disabled={isSubmitting || !draftAnswers[q.id]?.trim()}
                      className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Send className="h-3 w-3" />
                      )}
                      Valider la réponse
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
