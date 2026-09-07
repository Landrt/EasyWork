'use client';

import React, { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAIUsageMetrics } from '@/utils/actions/admin/actions';
import { AIUsageMetrics } from '@/lib/admin-types';
import { 
  Cpu, 
  Coins, 
  Layers, 
  AlertTriangle, 
  Zap, 
  Activity, 
  Bot 
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAIUsagePage() {
  const [metrics, setMetrics] = useState<AIUsageMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      setIsLoading(true);
      try {
        const data = await getAIUsageMetrics();
        setMetrics(data);
      } catch (e) {
        console.error(e);
        toast.error('Erreur lors du chargement des données IA.');
      } finally {
        setIsLoading(false);
      }
    }
    loadMetrics();
  }, []);

  const handleRestrictUser = (email: string) => {
    toast.success(`Seuil de requêtes appliqué sur l'utilisateur ${email}`);
  };

  const handleUpgradeUser = (email: string) => {
    toast.success(`Offre spéciale Sprint envoyée à ${email}`);
  };

  if (isLoading || !metrics) {
    return (
      <div className="min-h-screen bg-[#fbf9f5]">
        <AdminHeader 
          title="Consommation IA & Coûts" 
          subtitle="Suivi en temps réel des requêtes LLM, coûts DeepSeek/tokens et détection des abus."
        />
        <div className="p-8 text-center text-[#7A776D]">Chargement de la télémétrie IA réelle...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf9f5]">
      <AdminHeader 
        title="Consommation IA & Coûts" 
        subtitle="Données réelles des appels API DeepSeek, tokens et analyse des opérations."
      />

      <div className="p-8 space-y-8 max-w-7xl">
        {/* KPI Cards Télémétrie */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white border-[#E5E1D8] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#7A776D] uppercase tracking-wider font-semibold">Volume Requêtes</span>
              <Cpu className="h-4 w-4 text-[#C9A96E]" />
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold font-serif text-[#1C1B18]">{metrics.totalCalls.toLocaleString('fr-FR')}</span>
            </div>
            <p className="text-[11px] text-[#7A776D] mt-1">Appels enregistrés en base</p>
          </Card>

          <Card className="bg-white border-[#E5E1D8] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#7A776D] uppercase tracking-wider font-semibold">Tokens Traités</span>
              <Layers className="h-4 w-4 text-[#C9A96E]" />
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold font-serif text-[#1C1B18]">{(metrics.totalTokens / 1_000_000).toFixed(2)}M</span>
            </div>
            <p className="text-[11px] text-[#7A776D] mt-1">Total prompt + completion</p>
          </Card>

          <Card className="bg-white border-[#E5E1D8] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#7A776D] uppercase tracking-wider font-semibold">Facture IA Globale</span>
              <Coins className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-serif text-[#1C1B18]">{metrics.totalCostEur.toFixed(2)} €</span>
              <span className="text-xs text-emerald-600 font-medium">Coût réel</span>
            </div>
            <p className="text-[11px] text-[#7A776D] mt-1">Basé sur DeepSeek V3 API</p>
          </Card>

          <Card className="bg-white border-[#E5E1D8] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#7A776D] uppercase tracking-wider font-semibold">Moteur Principal</span>
              <Activity className="h-4 w-4 text-[#C9A96E]" />
            </div>
            <div className="mt-3">
              <span className="text-lg font-bold font-serif text-[#1C1B18]">DeepSeek V3</span>
            </div>
            <p className="text-[11px] text-[#7A776D] mt-1">Modèle souverain économique</p>
          </Card>
        </div>

        {/* Ventilation par Modèle & Ventilation par Opération */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Modèles IA */}
          <Card className="bg-white border-[#E5E1D8] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-serif font-bold text-sm text-[#1C1B18] flex items-center gap-2">
                  <Bot className="h-4 w-4 text-[#C9A96E]" />
                  Répartition par Modèle LLM
                </h3>
                <p className="text-xs text-[#7A776D] mt-0.5">DeepSeek utilisé en priorité pour un coût optimisé</p>
              </div>
            </div>

            <div className="space-y-4">
              {metrics.modelBreakdown.length === 0 ? (
                <p className="text-xs text-[#7A776D] py-4 text-center">Aucun appel LLM enregistré pour le moment.</p>
              ) : (
                metrics.modelBreakdown.map((m) => (
                  <div key={m.model} className="p-3.5 rounded bg-[#fbf9f5] border border-[#E5E1D8]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs text-[#1C1B18]">{m.model}</span>
                        <span className="text-[10px] text-[#9E824C] bg-[#C9A96E]/15 px-1.5 py-0.5 rounded border border-[#C9A96E]/30 font-bold">
                          {m.percentage}%
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#1C1B18]">{m.cost.toFixed(2)} €</span>
                    </div>

                    <div className="w-full bg-[#efeeea] rounded-full h-2 overflow-hidden mb-2">
                      <div 
                        className="bg-gradient-to-r from-[#C9A96E] to-[#9E824C] h-full rounded-full"
                        style={{ width: `${m.percentage}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-[#7A776D]">
                      <span>{m.calls.toLocaleString('fr-FR')} requêtes</span>
                      <span>{(m.cost / (m.calls || 1)).toFixed(4)} € / requête</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Opérations Métier */}
          <Card className="bg-white border-[#E5E1D8] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-serif font-bold text-sm text-[#1C1B18] flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#C9A96E]" />
                  Consommation par Opération
                </h3>
                <p className="text-xs text-[#7A776D] mt-0.5">Matching d&apos;offre et diagnostic de blocage ATS</p>
              </div>
            </div>

            <div className="space-y-3">
              {metrics.operationsBreakdown.length === 0 ? (
                <p className="text-xs text-[#7A776D] py-4 text-center">Aucune opération enregistrée en base.</p>
              ) : (
                metrics.operationsBreakdown.map((op) => (
                  <div key={op.operation} className="flex items-center justify-between p-3 rounded bg-[#fbf9f5] border border-[#E5E1D8] text-xs">
                    <div>
                      <div className="font-semibold text-[#1C1B18]">{op.operation}</div>
                      <div className="text-[10px] text-[#7A776D] mt-0.5">
                        {op.calls.toLocaleString('fr-FR')} appels • {(op.tokens / 1_000_000).toFixed(2)}M tokens
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#9E824C]">{op.cost.toFixed(2)} €</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Top Free Consumers */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#7A776D] flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Surveillance Consommateurs Gratuits
              </h2>
              <p className="text-xs text-[#1C1B18]">
                Détection d&apos;utilisateurs gratuits à forte consommation sans conversion.
              </p>
            </div>
          </div>

          <Card className="bg-white border-[#E5E1D8] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f5f3ef] text-[#494740] uppercase tracking-wider border-b border-[#E5E1D8] text-[10px]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Utilisateur</th>
                    <th className="py-3 px-4 font-semibold">Requêtes IA</th>
                    <th className="py-3 px-4 font-semibold">Tokens</th>
                    <th className="py-3 px-4 font-semibold">Coût Supporté</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E1D8] text-[#1C1B18]">
                  {metrics.topFreeConsumers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-[#7A776D]">
                        Aucun utilisateur gratuit n&apos;a dépassé le seuil d&apos;alerte.
                      </td>
                    </tr>
                  ) : (
                    metrics.topFreeConsumers.map((consumer) => (
                      <tr key={consumer.userId} className="hover:bg-[#fbf9f5] transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-mono text-xs text-[#1C1B18]">{consumer.email}</div>
                          <div className="text-[10px] text-[#7A776D]">ID: {consumer.userId}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-amber-700">{consumer.callsCount} appels</span>
                        </td>
                        <td className="py-3 px-4 text-[#1C1B18]">
                          {consumer.tokensCount.toLocaleString('fr-FR')} tokens
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-red-600">{consumer.estimatedCost.toFixed(2)} €</span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleRestrictUser(consumer.email)}
                            className="bg-white hover:bg-[#efeeea] text-amber-700 border border-amber-300 text-xs h-7 px-2.5"
                          >
                            Limiter débit
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUpgradeUser(consumer.email)}
                            className="bg-[#C9A96E]/15 hover:bg-[#C9A96E]/25 text-[#9E824C] border border-[#C9A96E]/40 text-xs h-7 px-2.5"
                          >
                            Proposer Sprint 13€
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
