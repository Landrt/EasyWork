'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Users, 
  CreditCard, 
  Receipt, 
  Handshake, 
  Cpu, 
  FileText, 
  Activity, 
  ArrowLeft, 
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: "Vue d'ensemble", icon: BarChart3 },
  { href: '/admin/users', label: 'Utilisateurs', icon: Users },
  { href: '/admin/subscriptions', label: 'Abonnements & Formules', icon: CreditCard },
  { href: '/admin/payments', label: 'Paiements & Factures', icon: Receipt },
  { href: '/admin/affiliates', label: 'Affiliés & Commissions', icon: Handshake },
  { href: '/admin/ai-usage', label: 'Consommation IA', icon: Cpu },
  { href: '/admin/activity', label: 'Activité CV & Offres', icon: FileText },
  { href: '/admin/system', label: 'Système & Santé', icon: Activity },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#fbf9f5] border-r border-[#E5E1D8] text-[#1C1B18] flex flex-col flex-shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#E5E1D8]">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded bg-[#1C1B18] flex items-center justify-center text-[#fbf9f5] font-serif font-bold text-sm shadow-sm">
            EW
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-base text-[#1C1B18] tracking-tight">EasyWork</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#C9A96E]/15 text-[#9E824C] border border-[#C9A96E]/30">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-[#7A776D]">Centre de pilotage</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="p-3 flex-1 overflow-y-auto space-y-1">
        <p className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest text-[#7A776D]">
          Modules de gestion
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded text-xs font-medium transition-all duration-150",
                isActive
                  ? "bg-white text-[#1C1B18] border-l-2 border-[#C9A96E] shadow-sm font-semibold"
                  : "text-[#494740] hover:bg-[#efeeea] hover:text-[#1C1B18]"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-[#C9A96E]" : "text-[#7A776D]")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer Info & Candidate Space Switcher */}
      <div className="p-4 border-t border-[#E5E1D8] space-y-3 bg-[#f5f3ef]">
        <div className="p-3 rounded border border-[#E5E1D8] bg-white shadow-xs">
          <div className="flex items-center gap-2 text-[11px] text-[#9E824C] font-semibold">
            <ShieldCheck className="h-3.5 w-3.5 text-[#C9A96E]" />
            <span>Mode Super-Admin</span>
          </div>
          <p className="text-[10px] text-[#7A776D] mt-1">
            Données réelles synchronisées avec Supabase & Flutterwave.
          </p>
        </div>

        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded text-xs font-medium text-[#1C1B18] hover:bg-[#efeeea] transition-colors border border-[#E5E1D8] bg-white shadow-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-[#7A776D]" />
          <span>Retour Espace Candidat</span>
        </Link>
      </div>
    </aside>
  );
}
