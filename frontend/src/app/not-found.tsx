import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen font-body-md text-body-md antialiased bg-background text-on-background">
      <style dangerouslySetInnerHTML={{__html: `
        .btn-primary {
            background-color: var(--color-ink);
            color: var(--color-on-primary);
            min-height: 44px;
            border-radius: var(--borderRadius-DEFAULT);
            padding: 0.5rem 1rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s, box-shadow 0.2s;
        }
        
        .btn-primary:hover {
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
            opacity: 0.9;
        }

        .error-container {
            min-height: calc(100vh - 160px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: var(--spacing-margin-mobile);
        }
        
        @media (min-width: 768px) {
            .error-container {
                padding: var(--spacing-margin-desktop);
            }
        }
      `}} />

      {/* TopNavBar */}
      <header className="bg-surface dark:bg-surface-container-low border-b border-parchment-border dark:border-outline-variant w-full top-0 z-50">
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-max-width mx-auto">
          <Link href="/" className="text-headline-md font-headline-md font-bold text-ink dark:text-on-background">
            EasyWork
          </Link>
          <nav className="hidden md:flex gap-6">
            {/* Intentionally suppressed active tabs since this is a 404 */}
          </nav>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow flex items-center justify-center relative overflow-hidden">
        {/* Subtle decorative background element for depth without shadows */}
        <div className="absolute inset-0 pointer-events-none flex justify-center items-center opacity-10">
          <div className="w-[800px] h-[800px] rounded-full border border-parchment-border"></div>
          <div className="absolute w-[600px] h-[600px] rounded-full border border-parchment-border"></div>
          <div className="absolute w-[400px] h-[400px] rounded-full border border-parchment-border"></div>
        </div>

        <div className="error-container z-10 max-w-2xl mx-auto">
          {/* Graphic element representing 404 in a professional way */}
          <div className="mb-12 relative">
            <div className="w-32 h-40 bg-surface border border-parchment-border rounded mx-auto relative shadow-sm flex items-center justify-center">
              <span className="material-symbols-outlined text-outline-variant" style={{fontSize: "48px", fontVariationSettings: "'FILL' 0"}}>
                description
              </span>
              {/* Magnifying glass examining the empty doc */}
              <div className="absolute -right-6 -bottom-6 bg-surface-bright rounded-full p-2 border border-parchment-border">
                <span className="material-symbols-outlined text-ink" style={{fontSize: "32px", fontVariationSettings: "'FILL' 0"}}>
                  search
                </span>
              </div>
            </div>
          </div>

          {/* Typography hierarchy */}
          <h1 className="text-display-lg font-display-lg text-ink mb-4">404</h1>
          <h2 className="text-headline-lg font-headline-lg text-on-surface mb-6">
            Page introuvable
          </h2>
          <p className="text-body-lg font-body-lg text-on-surface-variant mb-10 max-w-md mx-auto">
            Le document que vous recherchez semble avoir été déplacé ou n&apos;existe plus dans nos archives.
          </p>

          {/* Primary Action */}
          <Link className="btn-primary text-label-md font-label-md uppercase tracking-wider" href="/dashboard">
            <span className="material-symbols-outlined mr-2" style={{fontSize: "18px"}}>
              arrow_back
            </span>
            Retour au Dashboard
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low dark:bg-surface-container-lowest border-t border-parchment-border dark:border-outline-variant mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-12 max-w-max-width mx-auto">
          <div className="text-headline-md font-headline-md font-bold text-ink mb-6 md:mb-0">
            EasyWork
          </div>
          <nav className="flex gap-6 mb-6 md:mb-0">
            <Link className="text-on-surface-variant font-label-sm text-label-sm hover:text-primary transition-colors" href="/legal">Mentions Légales</Link>
            <Link className="text-on-surface-variant font-label-sm text-label-sm hover:text-primary transition-colors" href="/privacy">RGPD</Link>
            <Link className="text-on-surface-variant font-label-sm text-label-sm hover:text-primary transition-colors" href="/support">Support</Link>
          </nav>
          <div className="text-on-surface-variant text-caption font-caption">
            © 2026 EasyWork. Editorial Professionalism.
          </div>
        </div>
      </footer>
    </div>
  );
}
