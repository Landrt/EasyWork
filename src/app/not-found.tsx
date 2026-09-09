import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-[#fbf9f5]">
      <div className="max-w-md w-full text-center space-y-6 bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-[#E5E1D8] shadow-xl">
        <div className="mx-auto w-16 h-16 rounded-full bg-[#127749]/10 flex items-center justify-center">
          <FileQuestion className="w-8 h-8 text-[#127749]" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#C9A96E]">Erreur 404</span>
          <h2 className="font-serif text-3xl font-bold text-[#1C1B18]">
            Page Introuvable
          </h2>
          <p className="text-sm text-[#494740] font-sans leading-relaxed">
            La page ou le document que vous recherchez semble avoir été déplacé ou n&apos;existe plus.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Link href="/" className="flex-1">
            <Button
              className="w-full bg-[#127749] hover:bg-[#0e5c38] text-white font-medium gap-2"
            >
              <Home className="w-4 h-4" />
              Tableau de bord
            </Button>
          </Link>
          <Link href="/auth/login" className="flex-1">
            <Button
              variant="outline"
              className="w-full border-[#E5E1D8] text-[#1C1B18] hover:bg-[#efeeea] font-medium gap-2"
            >
              <ArrowLeft className="w-4 h-4 text-[#716e65]" />
              Connexion
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
