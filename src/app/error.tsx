'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception to monitoring service
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#fbf9f5]">
      <div className="max-w-md w-full text-center space-y-6 bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-[#E5E1D8] shadow-xl">
        <div className="mx-auto w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-amber-600" />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold text-[#1C1B18]">
            Une erreur inattendue est survenue
          </h2>
          <p className="text-sm text-[#494740] font-sans leading-relaxed">
            Nous n&apos;avons pas pu charger cette page correctement. Vous pouvez réinitialiser la vue ou revenir à votre espace.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="flex-1 bg-[#127749] hover:bg-[#0e5c38] text-white font-medium gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </Button>

          <Link href="/" className="flex-1">
            <Button
              variant="outline"
              className="w-full border-[#E5E1D8] text-[#1C1B18] hover:bg-[#efeeea] font-medium gap-2"
            >
              <Home className="w-4 h-4 text-[#716e65]" />
              Accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}