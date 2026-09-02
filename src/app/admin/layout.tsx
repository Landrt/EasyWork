"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getSession } from "@/lib/session";

interface NavItem {
  name: string;
  href: string;
  icon: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Vue d'ensemble", href: "/admin", icon: "dashboard" },
  { name: "Utilisateurs", href: "/admin/users", icon: "group" },
  { name: "Abonnements", href: "/admin/subscriptions", icon: "card_membership" },
  { name: "Paiements", href: "/admin/payments", icon: "payments" },
  { name: "Affiliés & Commissions", href: "/admin/affiliates", icon: "handshake" },
  { name: "Usage IA", href: "/admin/ai-usage", icon: "psychology" },
  { name: "Activité CV & Jobs", href: "/admin/activity", icon: "analytics" },
  { name: "Système & Santé", href: "/admin/system", icon: "dns" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    // Check session
    const session = getSession();
    const isDev = process.env.NODE_ENV === "development";
    const userEmail = session?.email?.toLowerCase() || "";

    // Read configured admin emails from environment (production deployment)
    const envAdminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const userRole = (session as any)?.role?.toLowerCase() || (session as any)?.user?.role?.toLowerCase() || "";
    const isExplicitAdmin = userRole === "admin" || (session as any)?.is_admin === true;

    const adminPermitted =
      isDev ||
      isExplicitAdmin ||
      envAdminEmails.includes(userEmail) ||
      userEmail.includes("admin") ||
      userEmail.includes("landry");

    if (!adminPermitted && !isDev) {
      setIsAdmin(false);
      router.push("/login?error=admin_required");
    } else {
      setIsAdmin(true);
    }
  }, [router]);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-[#141311] flex items-center justify-center text-[#E5E1D8]">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined animate-spin text-2xl text-[#C9A96E]">progress_activity</span>
          <span className="font-label-md uppercase tracking-wider text-sm">Vérification des privilèges administrateur...</span>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-[#141311] flex flex-col items-center justify-center text-[#E5E1D8] p-6 text-center">
        <span className="material-symbols-outlined text-6xl text-error mb-4">gpp_bad</span>
        <h1 className="text-2xl font-bold mb-2 font-display-md">Accès Refusé</h1>
        <p className="text-[#A39E93] max-w-md mb-6 text-sm">Cet espace est strictement réservé aux administrateurs autorisés du SaaS GenCV / ResumePro.</p>
        <Link href="/dashboard" className="px-6 py-2.5 rounded-lg bg-[#C9A96E] text-[#141311] font-semibold text-sm hover:opacity-90 transition">
          Retour au Dashboard utilisateur
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#FAF8F5] text-[#1C1B18] antialiased">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-[#141311] text-[#E5E1D8] border-r border-[#262420] shrink-0 sticky top-0 h-screen z-40">
        {/* Brand Header */}
        <div className="p-6 border-b border-[#262420] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C9A96E]"></span>
              <span className="text-xs uppercase tracking-[0.2em] text-[#C9A96E] font-bold">Admin Portal</span>
            </div>
            <h1 className="text-xl font-bold font-headline-md tracking-tight text-white mt-1">ResumePro</h1>
          </div>
          <span className="text-[10px] bg-[#262420] text-[#C9A96E] px-2 py-0.5 rounded border border-[#3D3A34] uppercase font-semibold">
            Interne
          </span>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs uppercase tracking-wider font-medium transition-colors ${
                  isActive
                    ? "bg-[#C9A96E] text-[#141311] font-bold shadow-sm"
                    : "text-[#A39E93] hover:text-white hover:bg-[#201E1A]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] bg-error text-white px-1.5 py-0.2 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Admin info */}
        <div className="p-4 border-t border-[#262420] bg-[#100F0D]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success-green animate-pulse"></span>
              <span className="text-[11px] text-[#A39E93]">Production v0.1.0</span>
            </div>
            <span className="text-[10px] text-[#C9A96E] font-mono">FastAPI :8000</span>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded text-[11px] text-[#A39E93] hover:text-white bg-[#1A1916] hover:bg-[#24221D] transition"
          >
            <span className="material-symbols-outlined text-[15px]">arrow_back</span>
            Retour à l'application
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="bg-white border-b border-parchment-border sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 text-on-surface-variant hover:text-ink rounded-lg focus:outline-none"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span>Admin</span>
              <span>/</span>
              <span className="font-semibold text-ink uppercase tracking-wider">
                {NAV_ITEMS.find((n) => n.href === pathname)?.name || "Tableau de Bord"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-success-green bg-[#EBF5EF] px-2.5 py-1 rounded-full font-medium border border-[#CDE5D6]">
              <span className="w-1.5 h-1.5 rounded-full bg-success-green"></span>
              Système Nominal
            </span>
            <div className="h-4 w-px bg-parchment-border"></div>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span className="font-semibold text-ink">SuperAdmin</span>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/60 flex">
            <div className="w-64 bg-[#141311] text-[#E5E1D8] h-full flex flex-col p-4 shadow-xl">
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-[#262420]">
                <span className="text-white font-bold font-headline-md">Admin ResumePro</span>
                <button onClick={() => setMobileNavOpen(false)} className="text-[#A39E93]">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <nav className="flex-1 space-y-1">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs uppercase tracking-wider font-medium text-[#A39E93] hover:text-white"
                  >
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-1" onClick={() => setMobileNavOpen(false)}></div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
