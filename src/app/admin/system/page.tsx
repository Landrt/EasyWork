"use client";

import React, { useState, useEffect } from "react";

interface SystemData {
  services: Array<{ name: string; status: string; latency_ms: number }>;
  queue: {
    active_workers: number;
    pending_tasks: number;
    failed_tasks_24h: number;
    queue_name: string;
  };
  error_logs: Array<{
    id: number;
    action: string;
    user_id: string;
    detail: any;
    created_at: string | null;
  }>;
  server_time: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function AdminSystemPage() {
  const [data, setData] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSystem() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/admin/system`);
        if (!res.ok) throw new Error("Erreur de chargement de l'état système");
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchSystem();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline-md tracking-tight text-ink">Santé Système & Journal des Erreurs</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Supervision des composants d'infrastructure, de la file d'attente asynchrone et des exceptions applicatives.
          </p>
        </div>
        <div className="text-xs text-on-surface-variant">
          Heure Serveur (UTC) : <strong className="text-ink">{data?.server_time ? new Date(data.server_time).toLocaleTimeString() : "—"}</strong>
        </div>
      </div>

      {/* External Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data?.services.map((svc, i) => (
          <div key={i} className="p-4 rounded-xl bg-white border border-parchment-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink">{svc.name}</span>
              <span className="w-2.5 h-2.5 rounded-full bg-success-green animate-pulse"></span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-xs text-success-green font-semibold uppercase tracking-wider">
                {svc.status === "healthy" ? "Opérationnel" : svc.status}
              </span>
              <span className="text-[11px] text-on-surface-variant font-mono">{svc.latency_ms} ms</span>
            </div>
          </div>
        ))}
      </div>

      {/* Async Queue (Celery / Background Tasks) */}
      <div className="p-6 rounded-xl bg-white border border-parchment-border shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-parchment-border pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-clay-accent">queue</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink">File d'Attente Asynchrone (Queue Workers)</h2>
          </div>
          <span className="text-xs font-mono text-on-surface-variant">Queue : {data?.queue.queue_name}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-lg bg-[#FAF8F5] border border-parchment-border">
            <span className="text-xs text-on-surface-variant block mb-1">Workers Actifs</span>
            <span className="text-2xl font-bold font-display-md text-ink">{data?.queue.active_workers}</span>
          </div>
          <div className="p-4 rounded-lg bg-[#FAF8F5] border border-parchment-border">
            <span className="text-xs text-on-surface-variant block mb-1">Tâches en Attente</span>
            <span className="text-2xl font-bold font-display-md text-success-green">{data?.queue.pending_tasks}</span>
          </div>
          <div className="p-4 rounded-lg bg-[#FAF8F5] border border-parchment-border">
            <span className="text-xs text-on-surface-variant block mb-1">Échecs (24h)</span>
            <span className="text-2xl font-bold font-display-md text-ink">{data?.queue.failed_tasks_24h}</span>
          </div>
        </div>
      </div>

      {/* Error & Exception Logs */}
      <div className="rounded-xl bg-white border border-parchment-border shadow-xs overflow-hidden">
        <div className="p-4 border-b border-parchment-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-error text-[20px]">warning</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink">Logs d'Erreurs & Audit d'Échecs Récent</h2>
          </div>
          <span className="text-xs text-on-surface-variant">{data?.error_logs.length ?? 0} entrées</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-parchment-border text-on-surface-variant font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Date / Heure</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Utilisateur / Contexte</th>
                <th className="py-3 px-4">Détail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment-border text-ink">
              {!data?.error_logs.length ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-success-green font-medium">
                    <span className="material-symbols-outlined inline-block align-middle mr-1.5 text-lg">check_circle</span>
                    Aucune erreur critique enregistrée dans les logs.
                  </td>
                </tr>
              ) : (
                data.error_logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAF8F5]/80">
                    <td className="py-3 px-4 font-mono text-[11px] text-on-surface-variant">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : "—"}
                    </td>
                    <td className="py-3 px-4 font-bold text-error font-mono">{log.action}</td>
                    <td className="py-3 px-4 font-mono text-[11px]">{log.user_id}</td>
                    <td className="py-3 px-4 text-on-surface-variant max-w-xs truncate">
                      {typeof log.detail === "object" ? JSON.stringify(log.detail) : (log.detail || "—")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
