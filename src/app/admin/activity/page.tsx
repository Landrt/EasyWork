"use client";

import React, { useState, useEffect } from "react";

interface ActivityData {
  total_cvs: number;
  total_versions: number;
  total_jobs_analyzed: number;
  total_matches_run: number;
  average_match_score: number;
  activity_timeline: Array<{
    date: string;
    cvs_created: number;
    matches_run: number;
  }>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function AdminActivityPage() {
  const [data, setData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/admin/activity/cvs-jobs`);
        if (!res.ok) throw new Error("Erreur de chargement de l'activité");
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchActivity();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline-md tracking-tight text-ink">Activité Agrégée — CVs & Offres d'Emploi</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Métriques globales d'usage et de matching ATS, garantissant la confidentialité absolue des données personnelles candidats.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-success-green bg-[#EBF5EF] px-3 py-1.5 rounded-full border border-[#CDE5D6] font-medium">
          <span className="material-symbols-outlined text-[16px]">privacy_tip</span>
          <span>Données Textuelles Individuelles Non Exposées (RGPD)</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-xl bg-white border border-parchment-border shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">CVs Créés</span>
          <div className="text-3xl font-bold font-display-md text-ink mt-2">
            {data?.total_cvs.toLocaleString() ?? 0}
          </div>
          <p className="text-xs text-on-surface-variant mt-2">{data?.total_versions ?? 0} versions sauvegardées au total</p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-parchment-border shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Offres d'Emploi Analysées</span>
          <div className="text-3xl font-bold font-display-md text-ink mt-2">
            {data?.total_jobs_analyzed.toLocaleString() ?? 0}
          </div>
          <p className="text-xs text-on-surface-variant mt-2">Fiches de poste traitées par l'intelligence ATS</p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-parchment-border shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Matchings ATS Exécutés</span>
          <div className="text-3xl font-bold font-display-md text-ink mt-2">
            {data?.total_matches_run.toLocaleString() ?? 0}
          </div>
          <p className="text-xs text-on-surface-variant mt-2">Comparaisons CV ↔ Description de poste</p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-parchment-border shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Score de Compatibilité Moyen</span>
          <div className="text-3xl font-bold font-display-md text-success-green mt-2">
            {data ? `${data.average_match_score}%` : "—"}
          </div>
          <p className="text-xs text-on-surface-variant mt-2">Moyenne globale des scores ATS calculés</p>
        </div>
      </div>

      {/* Activity Timeline Table */}
      <div className="rounded-xl bg-white border border-parchment-border shadow-xs p-6">
        <h2 className="text-base font-bold text-ink mb-2">Activité Quotidienne (14 derniers jours)</h2>
        <p className="text-xs text-on-surface-variant mb-6">Volumes journaliers de nouveaux CVs et d'analyses ATS lancées par les candidats.</p>

        <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
          {data?.activity_timeline.map((item, i) => (
            <div key={i} className="p-3 rounded-lg bg-[#FAF8F5] border border-parchment-border text-center">
              <span className="text-[11px] font-bold text-on-surface-variant block">{item.date}</span>
              <div className="mt-2 text-sm font-bold text-ink">+{item.cvs_created} CVs</div>
              <div className="text-xs text-success-green font-medium mt-0.5">{item.matches_run} matchs</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
