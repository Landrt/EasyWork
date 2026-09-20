'use client';

import { useState, useEffect } from 'react';
import { isDevBypassActive, toggleDevBypassMode } from '@/utils/dev-bypass';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DevBypassToggleProps {
  className?: string;
}

export function DevBypassToggle({ className }: DevBypassToggleProps) {
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    isDevBypassActive().then((status) => {
      setIsActive(status);
    });
  }, []);

  const handleToggle = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const res = await toggleDevBypassMode();
      setIsActive(res.isDevBypass);
      if (res.isDevBypass) {
        toast.success('⚡ Mode Bypass Développeur ACTIVÉ (Accès Pro Illimité)');
      } else {
        toast.info('Mode Bypass Développeur DÉSACTIVÉ (Vue Utilisateur Gratuit)');
      }
      router.refresh();
    } catch {
      toast.error('Erreur lors du changement de mode');
    } finally {
      setIsLoading(false);
    }
  };

  if (isActive === null) {
    return null;
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      title={
        isActive
          ? 'Mode Bypass Développeur ACTIF : Quotas illimités, tous les modèles IA et actions Pro débloqués. Cliquez pour tester le mode Gratuit.'
          : 'Mode Bypass Développeur INACTIF : Cliquez pour débloquer immédiatement toutes les fonctionnalités Pro.'
      }
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 border',
        isActive
          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300/40 hover:bg-amber-500/20 shadow-sm'
          : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700',
        isLoading && 'opacity-60 cursor-wait',
        className
      )}
    >
      <Zap className={cn('h-3.5 w-3.5', isActive ? 'text-amber-500 fill-amber-500 animate-pulse' : 'text-zinc-400')} />
      <span className="hidden sm:inline">Dev Bypass:</span>
      <span className={cn('font-bold', isActive ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-500')}>
        {isActive ? 'ACTIF' : 'OFF'}
      </span>
    </button>
  );
}
