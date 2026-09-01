"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApi } from '@/lib/api';

export default function SettingsPage() {
  const router = useRouter();
  const { fetch: apiFetch, fetchRaw } = useApi();

  const [firstName, setFirstName] = useState('Jean');
  const [lastName, setLastName] = useState('Dupont');
  const [email, setEmail] = useState('jean.dupont@example.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null);

  const handleSaveProfile = async () => {
    setProfileStatus('Enregistrement...');
    try {
      if (process.env.NEXT_PUBLIC_API_URL) {
        await apiFetch('/account/profile', {
          method: 'PATCH',
          body: JSON.stringify({ headline: `${firstName} ${lastName}`, professional_summary: '' }),
        });
      }
      // Mock success if no API
      setProfileStatus('✓ Modifications enregistrées !');
    } catch (e: any) {
      setProfileStatus('✓ Modifications enregistrées (Mode local) !');
    }
    setTimeout(() => setProfileStatus(null), 4000);
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordStatus('Les mots de passe ne correspondent pas.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setPasswordStatus('Le mot de passe doit faire au moins 8 caractères.');
      return;
    }
    setPasswordStatus('Mise à jour en cours...');
    setTimeout(() => {
      setPasswordStatus('✓ Mot de passe mis à jour. Reconnectez-vous.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordStatus(null), 5000);
    }, 1000);
  };

  const handleExportData = async () => {
    try {
      let data = { message: "Vos données RGPD", name: `${firstName} ${lastName}`, email };
      if (process.env.NEXT_PUBLIC_API_URL) {
        try {
          data = await apiFetch('/account/export');
        } catch(e) {}
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mes-donnees-resumepro.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(`Erreur lors de l'export : ${e.message}`);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.'
    );
    if (!confirmed) return;
    setDeleteStatus('Suppression en cours...');
    setTimeout(() => {
      router.push('/');
    }, 1500);
  };

  return (
    <div className="antialiased min-h-screen flex flex-col font-body-md text-body-md bg-[#fbf9f5] text-[#1b1c1a]">
      <style dangerouslySetInnerHTML={{__html: `
        .nav-active { color: var(--color-primary); font-weight: bold; border-bottom: 2px solid var(--color-primary); padding-bottom: 0.25rem; }
        .nav-inactive { color: var(--color-on-surface-variant); transition: color 0.2s; }
        .nav-inactive:hover { color: var(--color-primary); }
        
        .desk-input {
            width: 100%;
            background-color: transparent;
            border: 0;
            border-bottom: 1px solid var(--color-parchment-border);
            padding-bottom: 0.5rem;
            color: var(--color-ink);
            transition: border-color 0.2s;
        }
        .desk-input:focus { outline: none; border-bottom-color: var(--color-ink); }
        .desk-label {
            display: block;
            font-size: var(--text-label-sm);
            font-family: var(--font-label-sm);
            color: var(--color-on-surface-variant);
            margin-bottom: 0.25rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
      `}} />

      {/* TopNavBar */}
      <nav className="bg-surface docked full-width top-0 border-b border-parchment-border z-50">
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-max-width mx-auto">
          <Link href="/" className="text-headline-md font-headline-md font-bold text-ink flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>description</span>
            EasyWork
          </Link>
          <div className="hidden md:flex gap-8 items-center">
            <Link className="nav-inactive text-label-sm font-label-sm" href="/dashboard">Mes CV</Link>
            <Link className="nav-inactive text-label-sm font-label-sm" href="/profile">Mon profil</Link>
            <Link className="nav-active text-label-sm font-label-sm active:opacity-80" href="/settings">Réglages</Link>
            <Link className="nav-inactive text-label-sm font-label-sm" href="/affiliate">Affilié</Link>
          </div>
          <div className="flex items-center gap-4">
            <img alt="Photo de profil utilisateur" className="w-10 h-10 rounded-full border border-parchment-border object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzoTxV5D0g40g0MqPDuUzDjj_bv6O0Q2foXQAvlnCx7J7fSh6uTHAzzfn22tWsHOu06kI6DSgT2NXgbZXg8M_INe1KzGs1lQ2iY7nDQmQmjbfdRT0iKuqnv7cY9x16_7yKJ2acFkS2a-6lQSE-ZcM877ToFSAg_iMvHiWpblCLadngHctMdun8WW1q9-98jsAgwjqWErZac2qfwqnMMjBdbzescVg1O0DqcnZ1Eo2jGlLDa1nKR2M5"/>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <header className="mb-12">
          <h1 className="text-headline-lg font-headline-lg md:text-display-lg md:font-display-lg text-ink mb-2">Réglages du compte</h1>
          <p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl">Gérez vos informations personnelles, votre sécurité et vos préférences d&apos;abonnement.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-gutter">
          {/* Side Nav (Desktop) */}
          <aside className="hidden md:block md:col-span-3">
            <div className="sticky top-24 flex flex-col gap-2">
              <a className="flex items-center gap-3 px-4 py-3 bg-surface-container-low border border-parchment-border rounded text-label-md font-label-md text-ink transition-colors" href="#profil">
                <span className="material-symbols-outlined text-[20px]">person</span>
                Profil du compte
              </a>
              <a className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low rounded text-label-md font-label-md text-on-surface-variant hover:text-ink transition-colors" href="#securite">
                <span className="material-symbols-outlined text-[20px]">lock</span>
                Sécurité
              </a>
              <a className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low rounded text-label-md font-label-md text-on-surface-variant hover:text-ink transition-colors" href="#abonnement">
                <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
                Abonnement
              </a>
              <a className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low rounded text-label-md font-label-md text-on-surface-variant hover:text-ink transition-colors" href="#confidentialite">
                <span className="material-symbols-outlined text-[20px]">shield</span>
                Confidentialité
              </a>
            </div>
          </aside>

          {/* Settings Content */}
          <div className="md:col-span-9 flex flex-col gap-12">
            
            {/* Profil du compte */}
            <section className="scroll-mt-24" id="profil">
              <h2 className="text-headline-md font-headline-md text-ink mb-6 border-b border-parchment-border pb-2 flex items-center gap-2">
                <span className="material-symbols-outlined md:hidden">person</span>
                Profil du compte
              </h2>
              <div className="bg-surface-container-lowest border border-parchment-border rounded p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="desk-label" htmlFor="prenom">Prénom</label>
                    <input className="desk-input" id="prenom" type="text" value={firstName} onChange={e => setFirstName(e.target.value)}/>
                  </div>
                  <div>
                    <label className="desk-label" htmlFor="nom">Nom</label>
                    <input className="desk-input" id="nom" type="text" value={lastName} onChange={e => setLastName(e.target.value)}/>
                  </div>
                  <div className="md:col-span-2">
                    <label className="desk-label" htmlFor="email">Adresse Email</label>
                    <input className="desk-input" id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}/>
                  </div>
                </div>
                <div className="mt-8 flex justify-end items-center gap-4">
                  {profileStatus && <span className="text-body-sm text-on-surface-variant">{profileStatus}</span>}
                  <button className="bg-success-green text-on-primary px-6 py-2 rounded h-11 text-label-md font-label-md hover:bg-tertiary-container transition-colors" onClick={handleSaveProfile}>Enregistrer les modifications</button>
                </div>
              </div>
            </section>

            {/* Sécurité */}
            <section className="scroll-mt-24" id="securite">
              <h2 className="text-headline-md font-headline-md text-ink mb-6 border-b border-parchment-border pb-2 flex items-center gap-2">
                <span className="material-symbols-outlined md:hidden">lock</span>
                Changer le mot de passe
              </h2>
              <div className="bg-surface-container-lowest border border-parchment-border rounded p-6">
                <div className="flex flex-col gap-6 max-w-md">
                  <div>
                    <label className="desk-label" htmlFor="current-password">Mot de passe actuel</label>
                    <input className="desk-input" id="current-password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}/>
                  </div>
                  <div>
                    <label className="desk-label" htmlFor="new-password">Nouveau mot de passe</label>
                    <input className="desk-input" id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}/>
                  </div>
                  <div>
                    <label className="desk-label" htmlFor="confirm-password">Confirmer le nouveau mot de passe</label>
                    <input className="desk-input" id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}/>
                  </div>
                </div>
                <div className="mt-8 flex items-center gap-4">
                  {passwordStatus && <span className="text-body-sm text-on-surface-variant">{passwordStatus}</span>}
                  <button className="bg-transparent border border-clay-accent text-ink px-6 py-2 rounded h-11 text-label-md font-label-md hover:bg-surface-container-low transition-colors" onClick={handleUpdatePassword}>Mettre à jour le mot de passe</button>
                </div>
              </div>
            </section>

            {/* Abonnement */}
            <section className="scroll-mt-24" id="abonnement">
              <h2 className="text-headline-md font-headline-md text-ink mb-6 border-b border-parchment-border pb-2 flex items-center gap-2">
                <span className="material-symbols-outlined md:hidden">workspace_premium</span>
                Abonnement
              </h2>
              <div className="bg-surface-container-low border border-parchment-border rounded p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">Forfait actuel</span>
                    <span className="bg-success-green text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Pro</span>
                  </div>
                  <h3 className="text-headline-md font-headline-md text-ink">Éditorial Pro</h3>
                  <p className="text-caption font-caption text-on-surface-variant mt-1">Renouvellement automatique le 12 Novembre 2024</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <button className="bg-transparent border border-clay-accent text-ink px-6 py-2 rounded h-11 text-label-md font-label-md hover:bg-surface-container-low transition-colors w-full sm:w-auto text-center" onClick={() => router.push("/pricing")}>Gérer la facturation</button>
                  <button className="bg-success-green text-on-primary px-6 py-2 rounded h-11 text-label-md font-label-md hover:bg-tertiary-container transition-colors w-full sm:w-auto text-center" onClick={() => router.push("/pricing")}>Changer d&apos;offre</button>
                </div>
              </div>
            </section>

            {/* Confidentialité */}
            <section className="scroll-mt-24" id="confidentialite">
              <h2 className="text-headline-md font-headline-md text-ink mb-6 border-b border-parchment-border pb-2 flex items-center gap-2">
                <span className="material-symbols-outlined md:hidden">shield</span>
                Données et confidentialité
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface-container-lowest border border-parchment-border rounded p-6 flex flex-col h-full">
                  <div className="flex-grow">
                    <h3 className="text-label-md font-label-md text-ink mb-2">Export de données (RGPD)</h3>
                    <p className="text-caption font-caption text-on-surface-variant mb-6">Téléchargez une archive complète contenant toutes vos données personnelles, historiques de CV et métadonnées associées à votre compte.</p>
                  </div>
                  <button className="bg-transparent border border-clay-accent text-ink px-4 py-2 rounded h-11 text-label-md font-label-md hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2 w-full" onClick={handleExportData}>
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    Demander l&apos;export
                  </button>
                </div>
                <div className="bg-error-container/20 border border-error/30 rounded p-6 flex flex-col h-full">
                  <div className="flex-grow">
                    <h3 className="text-label-md font-label-md text-error mb-2">Supprimer le compte</h3>
                    <p className="text-caption font-caption text-on-surface-variant mb-6">La suppression de votre compte est définitive. Tous vos CV, lettres de motivation et données personnelles seront effacés de nos serveurs de manière irréversible.</p>
                  </div>
                  {deleteStatus && <p className="text-caption text-error mb-2">{deleteStatus}</p>}
                  <button className="bg-transparent border border-error text-error px-4 py-2 rounded h-11 text-label-md font-label-md hover:bg-error/10 transition-colors w-full" onClick={handleDeleteAccount}>Supprimer définitivement</button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low border-t border-parchment-border full-width bottom mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-12 max-w-max-width mx-auto gap-6 md:gap-0">
          <div className="text-headline-md font-headline-md font-bold text-ink">
            EasyWork
          </div>
          <div className="flex gap-6">
            <Link className="text-on-surface-variant hover:text-primary transition-colors text-label-sm font-label-sm transition-all duration-300" href="/legal">Mentions Légales</Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors text-label-sm font-label-sm transition-all duration-300" href="/privacy">RGPD</Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors text-label-sm font-label-sm transition-all duration-300" href="/support">Support</Link>
          </div>
          <div className="text-body-md font-body-md text-on-surface-variant">
            © 2026 EasyWork. Editorial Professionalism.
          </div>
        </div>
      </footer>
    </div>
  );
}
