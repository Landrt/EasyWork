"use client";

import React, { useState, useEffect } from "react";

interface PaymentItem {
  id: number;
  user_id: string;
  amount: number;
  currency: string;
  provider: string;
  provider_payment_id: string;
  provider_url: string | null;
  status: string;
  refunded_amount: number;
  created_at: string | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [totalCollected, setTotalCollected] = useState(0);
  const [totalRefunded, setTotalRefunded] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPayments() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/admin/payments`);
        if (!res.ok) throw new Error("Erreur de chargement des paiements");
        const json = await res.json();
        setPayments(json.transactions || []);
        setTotalCollected(json.total_collected || 0);
        setTotalRefunded(json.total_refunded || 0);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline-md tracking-tight text-ink">Journal des Paiements & Transactions</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Historique de toutes les transactions avec lien direct vers Stripe ou Flutterwave pour audit.
          </p>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="p-5 rounded-xl bg-white border border-parchment-border shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Volume Encaissé (Paiements Réussis)</span>
          <div className="text-3xl font-bold font-display-md text-success-green mt-2">
            {totalCollected.toFixed(2)} €
          </div>
          <p className="text-xs text-on-surface-variant mt-2">Total net perçu via les processeurs de paiement</p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-parchment-border shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Volume Remboursé</span>
          <div className="text-3xl font-bold font-display-md text-error mt-2">
            {totalRefunded.toFixed(2)} €
          </div>
          <p className="text-xs text-on-surface-variant mt-2">Fonds restitués sur demande client ou annulation</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-xl bg-white border border-parchment-border shadow-xs overflow-hidden">
        <div className="p-4 border-b border-parchment-border flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink">Transactions Récentes</h2>
          <span className="text-xs text-on-surface-variant">{payments.length} entrées</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-parchment-border text-on-surface-variant font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Utilisateur</th>
                <th className="py-3 px-4">Montant</th>
                <th className="py-3 px-4">Fournisseur</th>
                <th className="py-3 px-4">ID Transaction</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Lien Fournisseur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment-border text-ink">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-on-surface-variant">
                    Chargement des paiements...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-on-surface-variant">
                    Aucune transaction enregistrée pour le moment.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAF8F5]/80">
                    <td className="py-3.5 px-4 text-on-surface-variant">{p.created_at || "—"}</td>
                    <td className="py-3.5 px-4 font-mono">{p.user_id}</td>
                    <td className="py-3.5 px-4 font-bold text-ink">{p.amount.toFixed(2)} {p.currency}</td>
                    <td className="py-3.5 px-4 uppercase text-[11px] font-semibold text-clay-accent">{p.provider}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-on-surface-variant">{p.provider_payment_id}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        p.status === "succeeded" ? "bg-[#EBF5EF] text-success-green border border-[#CDE5D6]" :
                        p.status === "refunded" ? "bg-[#FDF2F2] text-error border border-[#F8D7DA]" :
                        "bg-surface-container text-on-surface-variant"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {p.provider_url ? (
                        <a
                          href={p.provider_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-ink hover:underline font-semibold"
                        >
                          <span>Voir sur {p.provider}</span>
                          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        </a>
                      ) : (
                        <span className="text-on-surface-variant text-[11px]">Non disponible</span>
                      )}
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
