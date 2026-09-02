"use client";

import React, { useState, useEffect } from "react";

interface AffiliateAdminItem {
  id: number;
  user_id: string;
  affiliate_code: string;
  commission_rate: number;
  status: string;
  total_clicks: number;
  total_conversions: number;
  pending_commission: number;
  paid_commission: number;
  created_at: string | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<AffiliateAdminItem[]>([]);
  const [globalDue, setGlobalDue] = useState(0);
  const [globalPaid, setGlobalPaid] = useState(0);
  const [loading, setLoading] = useState(true);

  // Rate Adjustment Modal
  const [editingAffiliate, setEditingAffiliate] = useState<AffiliateAdminItem | null>(null);
  const [newRatePercent, setNewRatePercent] = useState("30");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchAffiliates = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/admin/affiliates`);
      if (!res.ok) throw new Error("Erreur de chargement des affiliés");
      const json = await res.json();
      setAffiliates(json.affiliates || []);
      setGlobalDue(json.global_due || 0);
      setGlobalPaid(json.global_paid || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const handleUpdateRate = async () => {
    if (!editingAffiliate) return;
    const rateDecimal = parseFloat(newRatePercent) / 100.0;
    try {
      const res = await fetch(`${API_BASE}/admin/affiliates/${editingAffiliate.id}/rate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commission_rate: rateDecimal })
      });
      const data = await res.json();
      setActionNotice(data.message);
      setEditingAffiliate(null);
      fetchAffiliates();
    } catch (err: any) {
      setActionNotice(`Erreur : ${err.message}`);
    }
  };

  const handlePayout = async (affiliateId: number, code: string) => {
    if (!confirm(`Confirmer le déclenchement du versement pour l'affilié ${code} ?`)) return;
    try {
      const res = await fetch(`${API_BASE}/admin/affiliates/${affiliateId}/payout`, {
        method: "POST"
      });
      const data = await res.json();
      setActionNotice(data.message);
      fetchAffiliates();
    } catch (err: any) {
      setActionNotice(`Erreur : ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline-md tracking-tight text-ink">Programme Affiliés & Commissions</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Gestion globale des partenaires, ajustement individuel du taux de commission et versement des gains.
          </p>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-lg bg-[#EBF5EF] border border-[#CDE5D6] text-success-green text-xs font-medium flex items-center justify-between">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-on-surface-variant hover:text-ink">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Global Balances */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="p-5 rounded-xl bg-white border border-parchment-border shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Commissions Dues (En Attente)</span>
          <div className="text-3xl font-bold font-display-md text-[#8C6D1F] mt-2">
            {globalDue.toFixed(2)} €
          </div>
          <p className="text-xs text-on-surface-variant mt-2">Montant total des commissions en attente de versement</p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-parchment-border shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Commissions Versées (Historique)</span>
          <div className="text-3xl font-bold font-display-md text-success-green mt-2">
            {globalPaid.toFixed(2)} €
          </div>
          <p className="text-xs text-on-surface-variant mt-2">Montant total des virements exécutés avec succès</p>
        </div>
      </div>

      {/* Affiliates Table */}
      <div className="rounded-xl bg-white border border-parchment-border shadow-xs overflow-hidden">
        <div className="p-4 border-b border-parchment-border flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink">Affiliés Enregistrés ({affiliates.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-parchment-border text-on-surface-variant font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Code Affilié</th>
                <th className="py-3 px-4">Utilisateur</th>
                <th className="py-3 px-4">Taux Actuel</th>
                <th className="py-3 px-4 text-center">Clics</th>
                <th className="py-3 px-4 text-center">Conversions</th>
                <th className="py-3 px-4">Dû (€)</th>
                <th className="py-3 px-4">Versé (€)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment-border text-ink">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-on-surface-variant">
                    Chargement des affiliés...
                  </td>
                </tr>
              ) : affiliates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-on-surface-variant">
                    Aucun compte affilié actif.
                  </td>
                </tr>
              ) : (
                affiliates.map((a) => (
                  <tr key={a.id} className="hover:bg-[#FAF8F5]/80">
                    <td className="py-3.5 px-4 font-mono font-bold text-ink">{a.affiliate_code}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-on-surface-variant">{a.user_id}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-ink bg-surface-container px-2 py-0.5 rounded">
                        {Math.round(a.commission_rate * 100)} %
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium">{a.total_clicks}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-success-green">{a.total_conversions}</td>
                    <td className="py-3.5 px-4 font-bold text-[#8C6D1F]">{a.pending_commission.toFixed(2)} €</td>
                    <td className="py-3.5 px-4 font-medium text-on-surface-variant">{a.paid_commission.toFixed(2)} €</td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingAffiliate(a);
                          setNewRatePercent(String(Math.round(a.commission_rate * 100)));
                        }}
                        className="px-2.5 py-1 rounded border border-parchment-border hover:border-ink text-ink font-medium text-xs transition"
                      >
                        Taux
                      </button>
                      <button
                        onClick={() => handlePayout(a.id, a.affiliate_code)}
                        disabled={a.pending_commission <= 0}
                        className="px-2.5 py-1 rounded bg-ink text-white font-medium text-xs hover:opacity-90 disabled:opacity-30 transition"
                      >
                        Verser
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Rate Modal */}
      {editingAffiliate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-ink">Ajuster le taux de commission</h3>
            <p className="text-xs text-on-surface-variant">
              Affilié : <strong className="text-ink">{editingAffiliate.affiliate_code}</strong>
            </p>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink">Nouveau taux (%) :</label>
              <input
                type="number"
                min="1"
                max="80"
                value={newRatePercent}
                onChange={(e) => setNewRatePercent(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-parchment-border rounded-lg text-ink focus:outline-none"
              />
              <p className="text-[11px] text-on-surface-variant">Valeur entre 1% et 80%. Appliqué dynamiquement aux futures souscriptions.</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingAffiliate(null)}
                className="px-4 py-2 rounded-lg border border-parchment-border text-xs font-medium text-ink hover:bg-surface-container"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdateRate}
                className="px-4 py-2 rounded-lg bg-ink text-white text-xs font-semibold hover:opacity-90 transition"
              >
                Sauvegarder le taux
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
