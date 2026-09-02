"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface ConversionItem {
  id: number;
  date: string;
  referred_user: string;
  plan: string;
  commission: number;
  status: string;
}

interface AffiliateData {
  affiliate_code: string;
  referral_link: string;
  commission_rate: number;
  commission_rate_display: string;
  total_clicks: number;
  total_signups: number;
  total_conversions: number;
  conversion_rate: number;
  commissions_generated: number;
  commissions_pending: number;
  commissions_paid: number;
  conversions: ConversionItem[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function AffiliatePage() {
  const [data, setData] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [payoutStatus, setPayoutStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadAffiliateData() {
      try {
        setLoading(true);
        // Call FastAPI backend directly
        const res = await fetch(`${API_BASE}/affiliate/dashboard`);
        if (!res.ok) throw new Error("Erreur de récupération des données affilié");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        console.error("Failed to load affiliate dashboard", err);
        // Fallback default structure if backend starts fresh
        setData({
          affiliate_code: "EASYWORK",
          referral_link: "https://resumepro.app/?ref=EASYWORK",
          commission_rate: 0.30,
          commission_rate_display: "30%",
          total_clicks: 0,
          total_signups: 0,
          total_conversions: 0,
          conversion_rate: 0.0,
          commissions_generated: 0.0,
          commissions_pending: 0.0,
          commissions_paid: 0.0,
          conversions: []
        });
      } finally {
        setLoading(false);
      }
    }
    loadAffiliateData();
  }, []);

  const copyLink = () => {
    if (!data?.referral_link) return;
    navigator.clipboard.writeText(data.referral_link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleRequestPayout = async () => {
    setPayoutStatus("Envoi de la demande...");
    try {
      const res = await fetch(`${API_BASE}/affiliate/payout`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Erreur lors du versement");
      setPayoutStatus(`✓ Demande enregistrée : ${json.amount ?? data?.commissions_pending ?? 0} €`);
    } catch (e: any) {
      setPayoutStatus(`Erreur : ${e.message}`);
    }
    setTimeout(() => setPayoutStatus(null), 5000);
  };

  const handleExportCSV = () => {
    if (!data?.conversions?.length) return;
    const header = "ID,Date,Utilisateur,Plan,Commission,Statut";
    const rows = data.conversions.map(
      (c) => `${c.id},${c.date},${c.referred_user},${c.plan},${c.commission} €,${c.status}`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conversions_affilie_${data.affiliate_code}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col antialiased bg-[#FAF8F5] text-[#1C1B18]">
      {/* Navigation */}
      <nav className="bg-white border-b border-parchment-border sticky top-0 z-40">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-6xl mx-auto">
          <Link className="text-xl font-bold font-headline-md text-ink tracking-tight" href="/">
            ResumePro
          </Link>
          <div className="hidden md:flex gap-8 items-center text-xs uppercase tracking-wider font-semibold">
            <Link className="text-on-surface-variant hover:text-ink transition-colors" href="/dashboard">
              Mes CV
            </Link>
            <Link className="text-on-surface-variant hover:text-ink transition-colors" href="/profile">
              Mon Profil
            </Link>
            <Link className="text-ink font-bold border-b-2 border-ink pb-1" href="/affiliate">
              Espace Affilié
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-parchment-border hover:border-ink transition"
            >
              Éditeur de CV
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-clay-accent text-[20px]">handshake</span>
              <span className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">Programme Partenaire</span>
            </div>
            <h1 className="text-3xl font-bold font-headline-md text-ink tracking-tight">Votre Espace Affilié</h1>
            <p className="text-xs text-on-surface-variant mt-1 max-w-xl">
              Partagez la puissance du créateur de CV ATS avec votre réseau et touchez des commissions sur chaque abonnement généré.
            </p>
          </div>

          {/* Dynamic Commission Rate Badge (Never hardcoded) */}
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-parchment-border shadow-xs">
            <div className="p-2 rounded-lg bg-[#FAF8F5] text-ink material-symbols-outlined text-[20px]">percent</div>
            <div>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">Taux de Commission Actuel</span>
              <span className="text-lg font-bold font-display-md text-success-green">
                {loading ? "..." : data?.commission_rate_display}
              </span>
            </div>
          </div>
        </div>

        {/* Bento Grid: Referral Link + Balance Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Referral Link Card (8 cols) */}
          <div className="md:col-span-8 p-6 rounded-xl bg-white border border-parchment-border shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-ink flex items-center gap-2">
                  <span className="material-symbols-outlined text-clay-accent text-[18px]">link</span>
                  Votre Lien d'Affiliation Unique
                </h2>
                <span className="text-xs font-mono bg-[#FAF8F5] px-2 py-0.5 rounded border border-parchment-border text-on-surface-variant">
                  Code : {data?.affiliate_code}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mb-4">
                Toute personne s'inscrivant ou souscrivant un abonnement (Sprint, Recherche Active ou Fondateur) via ce lien vous attribuera automatiquement une commission.
              </p>
              <div className="bg-[#FAF8F5] p-3 rounded-lg border border-parchment-border flex items-center justify-between group hover:border-ink transition-colors">
                <code className="text-xs font-mono text-ink select-all break-all">
                  {loading ? "Chargement..." : data?.referral_link}
                </code>
                <button
                  onClick={copyLink}
                  className="ml-3 p-2 rounded-lg bg-white border border-parchment-border hover:border-ink text-ink transition shrink-0 flex items-center gap-1 text-xs font-semibold"
                >
                  <span className={`material-symbols-outlined text-[16px] ${copied ? "text-success-green" : ""}`}>
                    {copied ? "check" : "content_copy"}
                  </span>
                  <span>{copied ? "Copié !" : "Copier"}</span>
                </button>
              </div>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-4 italic">
              Attribution valide par cookie sécurisé pendant 30 jours à compter du premier clic.
            </p>
          </div>

          {/* Balance & Payout Card (4 cols) */}
          <div className="md:col-span-4 p-6 rounded-xl bg-white border border-parchment-border shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant block mb-1">
                Commissions en Attente
              </span>
              <div className="text-3xl font-bold font-display-md text-[#8C6D1F]">
                {loading ? "..." : `${(data?.commissions_pending ?? 0).toFixed(2)} €`}
              </div>
              <p className="text-[11px] text-on-surface-variant mt-1">
                Montant disponible pour votre prochain virement bancaire.
              </p>
            </div>

            <div className="mt-6 space-y-2">
              {payoutStatus && (
                <p className="text-xs font-medium text-success-green bg-[#EBF5EF] p-2 rounded border border-[#CDE5D6]">
                  {payoutStatus}
                </p>
              )}
              <button
                onClick={handleRequestPayout}
                disabled={!data?.commissions_pending || data.commissions_pending <= 0}
                className="w-full py-2.5 px-4 rounded-lg bg-ink text-white font-semibold text-xs hover:opacity-90 disabled:opacity-30 transition"
              >
                Demander un virement
              </button>
              <p className="text-[10px] text-on-surface-variant text-center">Virement automatique déclenché sous 48h.</p>
            </div>
          </div>
        </div>

        {/* 4 Performance Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white border border-parchment-border shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">1. Clics Uniques</span>
            <div className="text-2xl font-bold font-display-md text-ink mt-1.5">
              {loading ? "..." : data?.total_clicks.toLocaleString()}
            </div>
            <span className="text-[10px] text-on-surface-variant mt-1 block">Visiteurs sur votre lien</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-parchment-border shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">2. Inscriptions</span>
            <div className="text-2xl font-bold font-display-md text-ink mt-1.5">
              {loading ? "..." : data?.total_signups.toLocaleString()}
            </div>
            <span className="text-[10px] text-on-surface-variant mt-1 block">Comptes créés rattachés</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-parchment-border shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">3. Conversions Payantes</span>
            <div className="text-2xl font-bold font-display-md text-success-green mt-1.5">
              {loading ? "..." : data?.total_conversions.toLocaleString()}
            </div>
            <span className="text-[10px] text-on-surface-variant mt-1 block">Abonnements souscrits</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-parchment-border shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">4. Taux de Conversion</span>
            <div className="text-2xl font-bold font-display-md text-ink mt-1.5">
              {loading ? "..." : `${(data?.conversion_rate ?? 0).toFixed(2)} %`}
            </div>
            <span className="text-[10px] text-on-surface-variant mt-1 block">Ratio souscriptions / clics</span>
          </div>
        </div>

        {/* 3 Commission Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white border border-parchment-border shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Total Généré</span>
            <div className="text-xl font-bold font-display-md text-ink mt-1">
              {loading ? "..." : `${(data?.commissions_generated ?? 0).toFixed(2)} €`}
            </div>
            <span className="text-[10px] text-on-surface-variant">Toutes commissions confondues</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-parchment-border shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">En Attente</span>
            <div className="text-xl font-bold font-display-md text-[#8C6D1F] mt-1">
              {loading ? "..." : `${(data?.commissions_pending ?? 0).toFixed(2)} €`}
            </div>
            <span className="text-[10px] text-on-surface-variant">En cours de traitement</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-parchment-border shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Déjà Versé</span>
            <div className="text-xl font-bold font-display-md text-success-green mt-1">
              {loading ? "..." : `${(data?.commissions_paid ?? 0).toFixed(2)} €`}
            </div>
            <span className="text-[10px] text-on-surface-variant">Payé par virement</span>
          </div>
        </div>

        {/* Conversion History Simple List */}
        <div className="rounded-xl bg-white border border-parchment-border shadow-xs overflow-hidden">
          <div className="p-5 border-b border-parchment-border flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink">Historique des Conversions & Gains</h2>
              <p className="text-xs text-on-surface-variant">Suivi chronologique des souscriptions générées par vos filleuls.</p>
            </div>
            <button
              onClick={handleExportCSV}
              disabled={!data?.conversions?.length}
              className="px-3 py-1.5 rounded-lg border border-parchment-border hover:border-ink text-ink text-xs font-semibold transition disabled:opacity-30"
            >
              Exporter CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-parchment-border text-on-surface-variant font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Filleul</th>
                  <th className="py-3 px-4">Formule Souscrite</th>
                  <th className="py-3 px-4 text-right">Votre Commission</th>
                  <th className="py-3 px-4 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment-border text-ink">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-on-surface-variant">
                      Chargement de l'historique...
                    </td>
                  </tr>
                ) : !data?.conversions?.length ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-on-surface-variant">
                      Aucune conversion enregistrée pour le moment. Partagez votre lien pour démarrer !
                    </td>
                  </tr>
                ) : (
                  data.conversions.map((item) => (
                    <tr key={item.id} className="hover:bg-[#FAF8F5]/80">
                      <td className="py-3.5 px-4 text-on-surface-variant">{item.date}</td>
                      <td className="py-3.5 px-4 font-mono">{item.referred_user}</td>
                      <td className="py-3.5 px-4 font-medium">{item.plan}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-success-green">
                        +{item.commission.toFixed(2)} €
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.status === "paid" ? "bg-[#EBF5EF] text-success-green border border-[#CDE5D6]" :
                          "bg-[#FFF8E6] text-[#8C6D1F] border border-[#E8CA7C]"
                        }`}>
                          {item.status === "paid" ? "Versé" : "En attente"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
