"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface OverviewData {
  total_users: number;
  free_users: number;
  paid_users: number;
  mrr: number;
  active_affiliates: number;
  recent_alerts: Array<{
    id: number;
    action: string;
    user_id: string;
    detail: any;
    created_at: string;
  }>;
  evolution_chart: Array<{
    date: string;
    users: number;
    mrr: number;
  }>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function AdminOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOverview() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/admin/overview`, {
          headers: { "Content-Type": "application/json" }
        });
        if (!res.ok) {
          throw new Error(`Erreur ${res.status}: Impossible de charger les données admin`);
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        console.error("Failed to load admin overview", err);
        setError(err.message || "Erreur de connexion au backend");
      } finally {
        setLoading(false);
      }
    }
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-2xl text-ink">progress_activity</span>
          <span className="text-sm font-medium">Chargement des métriques SaaS...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-xl bg-[#FDF2F2] border border-[#F8D7DA] text-error flex items-start gap-3">
        <span className="material-symbols-outlined mt-0.5">error</span>
        <div>
          <h3 className="font-bold text-sm">Erreur de chargement de la Vue d'ensemble</h3>
          <p className="text-xs mt-1 text-[#842029]">{error}</p>
          <p className="text-xs text-on-surface-variant mt-2">Assurez-vous que le backend FastAPI est bien lancé sur le port 8000.</p>
        </div>
      </div>
    );
  }

  // Calculate SVG line points for evolution chart
  const chartPoints = data.evolution_chart || [];
  const maxMrr = Math.max(...chartPoints.map((p) => p.mrr), 100);
  const pointsString = chartPoints
    .map((p, idx) => {
      const x = (idx / Math.max(chartPoints.length - 1, 1)) * 500;
      const y = 140 - (p.mrr / maxMrr) * 110;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline-md tracking-tight text-ink">Vue d'ensemble de la Plateforme</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Indicateurs clés de performance, croissance du MRR et alertes opérationnelles en temps réel.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-lg border border-parchment-border">
            Dernière synchro : {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Users */}
        <div className="p-5 rounded-xl bg-white border border-parchment-border shadow-xs hover:border-clay-accent transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Utilisateurs Totaux</span>
            <span className="p-2 rounded-lg bg-[#FAF8F5] text-ink material-symbols-outlined text-[20px]">group</span>
          </div>
          <div className="text-3xl font-bold font-display-md text-ink mt-3">
            {data.total_users.toLocaleString()}
          </div>
          <div className="mt-3 pt-3 border-t border-parchment-border flex items-center justify-between text-xs">
            <span className="text-on-surface-variant">Gratuits : <strong className="text-ink">{data.free_users}</strong></span>
            <span className="text-success-green font-medium">Payants : <strong className="text-success-green">{data.paid_users}</strong></span>
          </div>
        </div>

        {/* MRR */}
        <div className="p-5 rounded-xl bg-white border border-parchment-border shadow-xs hover:border-clay-accent transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">MRR Estimé</span>
            <span className="p-2 rounded-lg bg-[#EBF5EF] text-success-green material-symbols-outlined text-[20px]">payments</span>
          </div>
          <div className="text-3xl font-bold font-display-md text-success-green mt-3">
            {data.mrr.toFixed(2)} €
          </div>
          <div className="mt-3 pt-3 border-t border-parchment-border flex items-center gap-1.5 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px] text-success-green">trending_up</span>
            <span>Abonnements Sprint + Actifs</span>
          </div>
        </div>

        {/* Ratio Paid */}
        <div className="p-5 rounded-xl bg-white border border-parchment-border shadow-xs hover:border-clay-accent transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Conversion Payante</span>
            <span className="p-2 rounded-lg bg-[#FAF8F5] text-clay-accent material-symbols-outlined text-[20px]">pie_chart</span>
          </div>
          <div className="text-3xl font-bold font-display-md text-ink mt-3">
            {data.total_users > 0 ? ((data.paid_users / data.total_users) * 100).toFixed(1) : "0"} %
          </div>
          <div className="mt-3 pt-3 border-t border-parchment-border text-xs text-on-surface-variant">
            <span>{data.paid_users} comptes sur {data.total_users}</span>
          </div>
        </div>

        {/* Active Affiliates */}
        <div className="p-5 rounded-xl bg-white border border-parchment-border shadow-xs hover:border-clay-accent transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Affiliés Actifs</span>
            <span className="p-2 rounded-lg bg-[#FAF8F5] text-ink material-symbols-outlined text-[20px]">handshake</span>
          </div>
          <div className="text-3xl font-bold font-display-md text-ink mt-3">
            {data.active_affiliates}
          </div>
          <div className="mt-3 pt-3 border-t border-parchment-border text-xs text-on-surface-variant flex items-center justify-between">
            <Link href="/admin/affiliates" className="text-xs font-medium text-ink hover:underline">
              Gérer les affiliés →
            </Link>
          </div>
        </div>
      </div>

      {/* Chart & Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Evolution Chart (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-xl bg-white border border-parchment-border shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-ink">Évolution du Chiffre d'Affaires & Utilisateurs (30j)</h2>
              <p className="text-xs text-on-surface-variant">Trajectoire financière et croissance de la base active.</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-success-green">
                <span className="w-2.5 h-2.5 rounded-full bg-success-green"></span> MRR (€)
              </span>
              <span className="flex items-center gap-1.5 text-on-surface-variant">
                <span className="w-2.5 h-2.5 rounded-full bg-clay-accent"></span> Utilisateurs
              </span>
            </div>
          </div>

          {/* Pure SVG Sparkline / Graph */}
          <div className="relative w-full h-44 border-b border-parchment-border">
            <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#127749" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#127749" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Fill area */}
              {chartPoints.length > 0 && (
                <polygon
                  points={`0,140 ${pointsString} 500,140`}
                  fill="url(#mrrGrad)"
                />
              )}
              {/* Line */}
              {chartPoints.length > 0 && (
                <polyline
                  fill="none"
                  stroke="#127749"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={pointsString}
                />
              )}
            </svg>
          </div>

          <div className="flex justify-between items-center text-[10px] text-on-surface-variant mt-3 px-1">
            <span>Il y a 30 jours</span>
            <span>Il y a 15 jours</span>
            <span>Aujourd'hui</span>
          </div>
        </div>

        {/* System Alerts & Audit (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-xl bg-white border border-parchment-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-ink">Alertes & Audit Récent</h2>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                Système
              </span>
            </div>
            <div className="space-y-3">
              {data.recent_alerts.map((alert) => (
                <div key={alert.id} className="p-3 rounded-lg bg-[#FAF8F5] border border-parchment-border flex items-start gap-2.5 text-xs">
                  <span className="material-symbols-outlined text-[16px] text-clay-accent shrink-0 mt-0.5">
                    notifications
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink truncate">{alert.action}</p>
                    <p className="text-[11px] text-on-surface-variant line-clamp-1">
                      {typeof alert.detail === "object" ? JSON.stringify(alert.detail) : (alert.detail || `User: ${alert.user_id}`)}
                    </p>
                    <span className="text-[10px] text-clay-accent mt-0.5 block">
                      {new Date(alert.created_at).toLocaleDateString()} à {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/admin/system"
            className="mt-4 pt-3 border-t border-parchment-border text-xs font-semibold text-ink flex items-center justify-between hover:underline"
          >
            <span>Voir tous les logs système</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* Quick Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/users" className="p-4 rounded-xl bg-white border border-parchment-border hover:border-ink transition group flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-lg bg-[#FAF8F5] text-ink material-symbols-outlined">person_search</span>
            <div>
              <h3 className="text-sm font-bold text-ink">Gestion Utilisateurs</h3>
              <p className="text-xs text-on-surface-variant">Suspendre, changer palier, rembourser</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
        </Link>

        <Link href="/admin/subscriptions" className="p-4 rounded-xl bg-white border border-parchment-border hover:border-ink transition group flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-lg bg-[#FAF8F5] text-ink material-symbols-outlined">stars</span>
            <div>
              <h3 className="text-sm font-bold text-ink">Abonnements & Fondateurs</h3>
              <p className="text-xs text-on-surface-variant">Suivi des quotas Sprint et Fondateur</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
        </Link>

        <Link href="/admin/ai-usage" className="p-4 rounded-xl bg-white border border-parchment-border hover:border-ink transition group flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-lg bg-[#FAF8F5] text-ink material-symbols-outlined">smart_toy</span>
            <div>
              <h3 className="text-sm font-bold text-ink">Budget & Risque IA</h3>
              <p className="text-xs text-on-surface-variant">Surveillance des gros consommateurs gratuits</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
        </Link>
      </div>
    </div>
  );
}
