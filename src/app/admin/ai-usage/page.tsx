"use client";

import React, { useState, useEffect } from "react";

interface AIUsageData {
  total_calls: number;
  total_cost: number;
  by_operation: Array<{ operation: string; count: number; cost: number }>;
  by_plan: Array<{ plan: string; calls: number; cost: number }>;
  top_free_consumers: Array<{ user_id: string; calls_count: number; estimated_cost: number }>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function AdminAIUsagePage() {
  const [data, setData] = useState<AIUsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAIUsage() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/admin/ai-usage`);
        if (!res.ok) throw new Error("Erreur de chargement des métriques IA");
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchAIUsage();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-headline-md tracking-tight text-ink">Consommation & Coûts IA</h1>
        <p className="text-xs text-on-surface-variant mt-1">
          Surveillance des requêtes LLM (DeepSeek), analyse des coûts par opération et identification des comptes gratuits à fort volume.
        </p>
      </div>

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="p-5 rounded-xl bg-white border border-parchment-border shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Volume Total d'Appels IA</span>
          <div className="text-3xl font-bold font-display-md text-ink mt-2">
            {data?.total_calls.toLocaleString() ?? 0}
          </div>
          <p className="text-xs text-on-surface-variant mt-2">Requêtes ATS scoring, optimisation de texte et parsing</p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-parchment-border shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Coût Estimé LLM</span>
          <div className="text-3xl font-bold font-display-md text-success-green mt-2">
            {data ? `${data.total_cost.toFixed(4)} €` : "0.0000 €"}
          </div>
          <p className="text-xs text-on-surface-variant mt-2">Basé sur la tarification token DeepSeek</p>
        </div>
      </div>

      {/* Crucial Section: Top Consumers on the FREE Tier */}
      <div className="p-6 rounded-xl bg-[#FFFBF0] border border-[#E8CA7C] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#8C6D1F]">warning</span>
            <h2 className="text-base font-bold text-ink">Surveillance des Comptes Gratuits (Budget Risk)</h2>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FBF0D9] text-[#8C6D1F] px-2.5 py-1 rounded-full border border-[#E8CA7C]">
            Alerte Rentabilité
          </span>
        </div>
        <p className="text-xs text-on-surface-variant">
          Ces utilisateurs consomment des requêtes d'intelligence artificielle sur le palier gratuit sans avoir souscrit d'abonnement payant.
        </p>

        <div className="bg-white rounded-lg border border-parchment-border overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-parchment-border text-on-surface-variant font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-4">Utilisateur</th>
                <th className="py-2.5 px-4 text-center">Appels IA Effectués</th>
                <th className="py-2.5 px-4 text-right">Coût Généré</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment-border text-ink">
              {!data?.top_free_consumers?.length ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-on-surface-variant">
                    Aucun abus ou surconsommation détecté côté gratuit.
                  </td>
                </tr>
              ) : (
                data.top_free_consumers.map((c, i) => (
                  <tr key={i} className="hover:bg-[#FAF8F5]/80">
                    <td className="py-3 px-4 font-mono font-medium">{c.user_id}</td>
                    <td className="py-3 px-4 text-center font-bold text-ink">{c.calls_count}</td>
                    <td className="py-3 px-4 text-right font-semibold text-[#8C6D1F]">{c.estimated_cost.toFixed(4)} €</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Breakdowns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Operation Type */}
        <div className="p-6 rounded-xl bg-white border border-parchment-border shadow-xs">
          <h2 className="text-base font-bold text-ink mb-4">Répartition par Type d'Opération</h2>
          <div className="space-y-3">
            {data?.by_operation.map((op, i) => (
              <div key={i} className="p-3 rounded-lg bg-[#FAF8F5] border border-parchment-border flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-ink uppercase tracking-wider">{op.operation}</span>
                  <p className="text-[11px] text-on-surface-variant">{op.count} exécutions</p>
                </div>
                <span className="font-semibold text-ink">{op.cost.toFixed(4)} €</span>
              </div>
            ))}
          </div>
        </div>

        {/* By Plan Tier */}
        <div className="p-6 rounded-xl bg-white border border-parchment-border shadow-xs">
          <h2 className="text-base font-bold text-ink mb-4">Consommation par Palier Tarifaire</h2>
          <div className="space-y-3">
            {data?.by_plan.map((p, i) => (
              <div key={i} className="p-3 rounded-lg bg-[#FAF8F5] border border-parchment-border flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-ink uppercase tracking-wider">{p.plan}</span>
                  <p className="text-[11px] text-on-surface-variant">{p.calls} appels</p>
                </div>
                <span className="font-semibold text-ink">{p.cost.toFixed(4)} €</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
