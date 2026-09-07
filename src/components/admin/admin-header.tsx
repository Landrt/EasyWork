'use client';

import { ShieldCheck } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  adminEmail?: string;
}

export function AdminHeader({ title, subtitle, adminEmail = 'admin@easywork.com' }: AdminHeaderProps) {
  return (
    <header className="h-16 border-b border-[#E5E1D8] bg-[#fbf9f5]/95 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="font-serif text-lg font-bold text-[#1C1B18] tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-[#7A776D] mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded border border-[#E5E1D8] bg-white text-[11px] text-[#494740] shadow-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Données Réelles Supabase</span>
        </div>

        <div className="h-4 w-[1px] bg-[#E5E1D8]" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-[#1C1B18]">{adminEmail}</p>
            <p className="text-[10px] text-[#9E824C] font-medium">Administrateur</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-[#1C1B18] text-[#fbf9f5] font-serif font-bold text-xs flex items-center justify-center shadow-xs">
            {adminEmail.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
