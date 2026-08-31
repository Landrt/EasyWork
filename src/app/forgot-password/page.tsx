"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      // @ts-expect-error better-auth types may not be fully resolved without plugins
      await authClient.forgetPassword({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setStatus('success');
      setMessage('Un email de réinitialisation a été envoyé si ce compte existe.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Une erreur est survenue.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col antialiased bg-[#fbf9f5] text-[#1b1c1a]">
      <style dangerouslySetInnerHTML={{__html: `
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        /* Custom input styles following guidelines */
        .resume-input {
            border: none;
            border-bottom: 1px solid #E5E1D8;
            background-color: transparent;
            border-radius: 0;
            padding-left: 0;
            padding-right: 0;
            transition: border-color 0.2s ease-in-out;
        }
        .resume-input:focus {
            outline: none;
            box-shadow: none;
            border-bottom-color: #1C1B18;
        }
      `}} />

      {/* TopNavBar omitted as per instruction for Transactional intent pages */}
      <main className="flex-grow flex items-center justify-center p-margin-mobile md:p-margin-desktop">
        <div className="w-full max-w-md">
          {/* Logo / Brand anchor */}
          <div className="text-center mb-12">
            <h1 className="font-headline-md text-headline-md font-bold text-ink mb-2">EasyWork</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Editorial Professionalism.</p>
          </div>
          
          {/* Password Reset Card */}
          <div className="bg-surface-container-lowest border border-parchment-border rounded-DEFAULT p-8">
            <div className="mb-8">
              <h2 className="font-headline-md text-headline-md text-ink mb-2">Réinitialiser le mot de passe</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Entrez votre adresse e-mail ci-dessous et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
            </div>
            
            <form action="#" className="space-y-6" method="POST" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="block font-label-sm text-label-sm uppercase text-on-surface-variant" htmlFor="email">Adresse E-mail</label>
                <input className="w-full font-body-md text-body-md text-ink resume-input h-10" id="email" name="email" placeholder="vous@exemple.com" required type="email" value={email} onChange={e => setEmail(e.target.value)}/>
              </div>
              {message && (
                <p className={`text-sm ${status === 'success' ? 'text-success-green' : 'text-error'}`}>{message}</p>
              )}
              <div className="pt-4">
                <button className="w-full h-11 bg-success-green text-on-primary font-label-md text-label-md rounded-DEFAULT hover:bg-on-surface-variant transition-colors flex items-center justify-center gap-2 disabled:opacity-60" type="submit" disabled={status === 'loading' || status === 'success'}>
                  <span>{status === 'loading' ? 'Envoi...' : status === 'success' ? 'Email envoyé !' : 'Envoyer le lien'}</span>
                  <span className="material-symbols-outlined text-[18px]">{status === 'success' ? 'check' : 'arrow_forward'}</span>
                </button>
              </div>
            </form>
            
            <div className="mt-8 text-center">
              <Link className="font-label-md text-label-md text-on-surface-variant hover:text-ink transition-colors flex items-center justify-center gap-1" href="/login">
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </main>
      {/* Footer omitted as per instructions for Transactional intent pages */}
    </div>
  );
}
