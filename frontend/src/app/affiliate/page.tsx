"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface AffiliateStats {
  availableBalance: number;
  clicks30d: number;
  signups30d: number;
  conversionRate: number;
  commissions: Array<{
    date: string;
    user: string;
    plan: string;
    amount: number;
    status: 'validated' | 'pending' | 'cancelled';
  }>;
}

export default function AffiliatePage() {
  const [copied, setCopied] = useState(false);
  const [payoutStatus, setPayoutStatus] = useState<string | null>(null);
  const [referralLink, setReferralLink] = useState<string>('Chargement...');
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch affiliate link
        const linkRes = await fetch('/api/affiliate/link');
        const linkData = await linkRes.json();
        if (linkData.link) setReferralLink(linkData.link);

        // Fetch stats
        const statsRes = await fetch('/api/affiliate/stats');
        const statsData = await statsRes.json();
        setStats(statsData);
      } catch (e) {
        console.error('Failed to load affiliate data', e);
        setReferralLink('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleRequestPayout = async () => {
    setPayoutStatus('Envoi de la demande...');
    try {
      const res = await fetch('/api/affiliate/payout', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur inconnue');
      setPayoutStatus(`✓ Virement demandé : €${data.amount ?? stats?.availableBalance ?? 0}`);
    } catch (e: any) {
      setPayoutStatus(`Erreur : ${e.message}`);
    }
    setTimeout(() => setPayoutStatus(null), 5000);
  };

  const handleExportCSV = () => {
    if (!stats?.commissions?.length) return;
    const header = 'Date,Utilisateur,Plan,Commission,Statut';
    const rows = stats.commissions.map(c =>
      `${c.date},${c.user},${c.plan},€${c.amount},${c.status}`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'commissions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusLabel = (status: string) => {
    if (status === 'validated') return <span className="inline-flex items-center gap-1 text-success-green bg-[#E6F4EA] px-2 py-1 rounded-sm font-label-sm text-label-sm"><span className="material-symbols-outlined text-[14px]">check_circle</span> Validé</span>;
    if (status === 'pending') return <span className="inline-flex items-center gap-1 text-on-surface-variant bg-surface-container px-2 py-1 rounded-sm font-label-sm text-label-sm"><span className="material-symbols-outlined text-[14px]">schedule</span> En attente</span>;
    return <span className="inline-flex items-center gap-1 text-error bg-error-container px-2 py-1 rounded-sm font-label-sm text-label-sm"><span className="material-symbols-outlined text-[14px]">cancel</span> Annulé</span>;
  };

  return (
    <div className="min-h-screen flex flex-col antialiased bg-background text-on-background">
      <style dangerouslySetInnerHTML={{__html: `
        /* Custom UI Elements matching style guide */
        .premium-card { border: 1px solid var(--color-parchment-border); padding: 16px; background-color: var(--color-surface-container-lowest); border-radius: var(--borderRadius-DEFAULT); }
        .premium-btn-primary { background-color: var(--color-ink); color: var(--color-on-primary); min-height: 44px; display: inline-flex; align-items: center; justify-content: center; padding: 0 24px; border-radius: var(--borderRadius-lg); font-family: var(--font-label-md); font-size: var(--text-label-md); font-weight: 500; transition: opacity 0.2s; }
        .premium-btn-primary:hover { opacity: 0.9; }
        .premium-btn-secondary { background-color: transparent; border: 1px solid var(--color-clay-accent); color: var(--color-ink); min-height: 44px; display: inline-flex; align-items: center; justify-content: center; padding: 0 24px; border-radius: var(--borderRadius-lg); font-family: var(--font-label-md); font-size: var(--text-label-md); font-weight: 500; transition: background-color 0.2s; }
        .premium-btn-secondary:hover { background-color: var(--color-surface-container); }
        .premium-input { border: 1px solid var(--color-parchment-border); border-width: 0 0 1px 0; background-color: transparent; padding: 8px 0; font-family: var(--font-body-md); font-size: var(--text-body-md); width: 100%; transition: border-color 0.2s; }
        .premium-input:focus { outline: none; border-color: var(--color-ink); }
        .premium-label { font-family: var(--font-label-sm); font-size: var(--text-label-sm); text-transform: uppercase; color: var(--color-on-surface-variant); margin-bottom: 4px; display: block; }
      `}} />

      {/* TopNavBar */}
      <nav className="bg-surface dark:bg-surface-container-low border-b border-parchment-border dark:border-outline-variant docked full-width top-0 w-full z-50">
        <div className="flex justify-between items-center w-full px-margin-desktop py-4 max-w-max-width mx-auto">
          <Link className="text-headline-md font-headline-md font-bold text-ink dark:text-on-background tracking-tight" href="/">EasyWork</Link>
          <div className="hidden md:flex gap-8 items-center">
            <Link className="text-label-sm font-label-sm text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-colors duration-200" href="/dashboard">Mes CV</Link>
            <Link className="text-label-sm font-label-sm text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-colors duration-200" href="/profile">Mon profil</Link>
            <Link className="text-label-sm font-label-sm text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-colors duration-200" href="/settings">Réglages</Link>
            <Link className="text-label-sm font-label-sm text-primary font-bold border-b-2 border-primary pb-1 hover:text-primary transition-colors duration-200 opacity-80 scale-95 transition-transform" href="/affiliate">Affilié</Link>
          </div>
          <div className="flex items-center gap-4">
            <img alt="Photo de profil utilisateur" className="w-10 h-10 rounded-full object-cover border border-parchment-border" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuybyUFYIvMm1YRz8GR5lcQ4yORozFq--NG0YsbAY7nM9mS0MM84LITdsWyDnNtSPb8iaZOlyEFWUPkybgoFHSW8NuymuWs-dE_KIeebqGCScyGENbfA7vCZr_qB3pcIOao7vfN_FBVYS0QjW6TinJLTyfgwVnaauLXm8yKF6Q8Jix9uxPJB8SvVICwXIAT4dnU43Mm2Lm6-RKQvBWdPY4JWrA4xUgBOckS7t_QElE7DhY9ZftiMPv"/>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <header className="mb-12">
          <h1 className="font-display-lg text-display-lg text-ink mb-4">Espace Affilié</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">Partagez l&apos;excellence professionnelle. Invitez votre réseau à découvrir EasyWork et soyez récompensé pour chaque nouvelle souscription.</p>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          
          {/* Referral Link Card (Spans 8 cols on desktop) */}
          <div className="md:col-span-8 premium-card flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-clay-accent" style={{fontVariationSettings: "'FILL' 1"}}>link</span>
                <h2 className="font-headline-md text-headline-md text-ink">Votre Lien Unique</h2>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">Utilisez ce lien exclusif dans vos communications. Tout utilisateur s&apos;inscrivant via ce lien sera automatiquement rattaché à votre compte affilié.</p>
              <div className="bg-surface-container p-4 rounded border border-parchment-border flex items-center justify-between group hover:border-clay-accent transition-colors">
                <code className="font-body-md text-body-md text-ink select-all break-all">{referralLink}</code>
                <button className="ml-4 p-2 text-on-surface-variant hover:text-ink transition-colors focus:outline-none flex-shrink-0" onClick={copyLink} title="Copier le lien">
                  <span className={"material-symbols-outlined" + (copied ? ' text-success-green' : '')}>
                    {copied ? 'check' : 'content_copy'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats (Spans 4 cols on desktop) */}
          <div className="md:col-span-4 premium-card bg-surface-container-low flex flex-col justify-center">
            <h3 className="premium-label mb-2">Gains Disponibles</h3>
            <div className="font-display-lg text-display-lg text-success-green mb-6">
              {loading ? '...' : `€${(stats?.availableBalance ?? 0).toFixed(2)}`}
            </div>
            {payoutStatus && <p className="text-caption text-on-surface-variant mb-2">{payoutStatus}</p>}
            <button className="premium-btn-primary w-full" onClick={handleRequestPayout} disabled={!stats?.availableBalance}>Demander un virement</button>
            <p className="font-caption text-caption text-on-surface-variant mt-4 text-center">Prochain paiement estimé le 1er du mois.</p>
          </div>

          {/* Stats Overview (Full width below) */}
          <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-gutter mt-4">
            <div className="premium-card">
              <span className="premium-label">Clics (30j)</span>
              <div className="font-headline-lg text-headline-lg text-ink mt-2">
                {loading ? '...' : (stats?.clicks30d ?? 0).toLocaleString()}
              </div>
            </div>
            <div className="premium-card">
              <span className="premium-label">Inscriptions (30j)</span>
              <div className="font-headline-lg text-headline-lg text-ink mt-2">
                {loading ? '...' : (stats?.signups30d ?? 0)}
              </div>
            </div>
            <div className="premium-card">
              <span className="premium-label">Taux de Conversion</span>
              <div className="font-headline-lg text-headline-lg text-ink mt-2">
                {loading ? '...' : `${(stats?.conversionRate ?? 0).toFixed(2)}%`}
              </div>
            </div>
          </div>

          {/* Commissions Table (Full Width) */}
          <div className="md:col-span-12 premium-card mt-4 overflow-x-auto">
            <div className="flex justify-between items-end mb-6">
              <h2 className="font-headline-md text-headline-md text-ink">Historique des Commissions</h2>
              <button className="premium-btn-secondary !min-h-[32px] !px-4 !text-label-sm" onClick={handleExportCSV} disabled={!stats?.commissions?.length}>Exporter (CSV)</button>
            </div>
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-parchment-border">
                  <th className="py-3 font-label-sm text-label-sm uppercase text-on-surface-variant font-normal">Date</th>
                  <th className="py-3 font-label-sm text-label-sm uppercase text-on-surface-variant font-normal">Utilisateur</th>
                  <th className="py-3 font-label-sm text-label-sm uppercase text-on-surface-variant font-normal">Plan</th>
                  <th className="py-3 font-label-sm text-label-sm uppercase text-on-surface-variant font-normal text-right">Commission</th>
                  <th className="py-3 font-label-sm text-label-sm uppercase text-on-surface-variant font-normal text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md text-ink">
                {loading ? (
                  <tr><td colSpan={5} className="py-8 text-center text-on-surface-variant">Chargement...</td></tr>
                ) : !stats?.commissions?.length ? (
                  <tr><td colSpan={5} className="py-8 text-center text-on-surface-variant">Aucune commission pour le moment.</td></tr>
                ) : (
                  stats.commissions.map((c, i) => (
                    <tr key={i} className="border-b border-parchment-border hover:bg-surface-container-low transition-colors">
                      <td className="py-4">{c.date}</td>
                      <td className="py-4">{c.user}</td>
                      <td className="py-4">{c.plan}</td>
                      <td className="py-4 text-right font-medium">€{c.amount.toFixed(2)}</td>
                      <td className="py-4 text-right">{statusLabel(c.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low dark:bg-surface-container-lowest border-t border-parchment-border dark:border-outline-variant full-width bottom mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-margin-desktop py-12 max-w-max-width mx-auto">
          <div className="text-headline-md font-headline-md font-bold text-ink mb-6 md:mb-0">EasyWork</div>
          <div className="flex gap-6 mb-6 md:mb-0">
            <Link className="text-on-surface-variant font-label-sm text-label-sm hover:text-primary transition-colors duration-300" href="/legal">Mentions Légales</Link>
            <Link className="text-on-surface-variant font-label-sm text-label-sm hover:text-primary transition-colors duration-300" href="/privacy">RGPD</Link>
            <Link className="text-on-surface-variant font-label-sm text-label-sm hover:text-primary transition-colors duration-300" href="/support">Support</Link>
          </div>
          <div className="text-on-surface-variant dark:text-on-surface-variant font-body-md text-body-md">© 2026 EasyWork. Editorial Professionalism.</div>
        </div>
      </footer>
    </div>
  );
}
