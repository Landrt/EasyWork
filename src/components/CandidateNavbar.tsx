"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSession, getCandidateName } from "@/lib/session";

interface NavLinkItem {
  label: string;
  href: string;
}

const navItems: NavLinkItem[] = [
  { label: "Mes CV", href: "/dashboard" },
  { label: "Mes offres", href: "/matching" },
  { label: "Mon profil", href: "/profile" },
  { label: "QRO", href: "/onboarding" },
  { label: "ATS", href: "/analysis" },
  { label: "Réglages", href: "/settings" },
];

export default function CandidateNavbar() {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userName, setUserName] = useState("Candidat");
  const [userEmail, setUserEmail] = useState("candidat@easywork.com");

  useEffect(() => {
    const syncUser = () => {
      const session = getSession();
      const resolved = getCandidateName() || session?.name;
      if (resolved) {
        setUserName(resolved);
      } else if (session?.email) {
        const part = session.email.split("@")[0];
        setUserName(part.charAt(0).toUpperCase() + part.slice(1));
      }
      if (session?.email) {
        setUserEmail(session.email);
      }
    };

    syncUser();
    window.addEventListener("gencv-session", syncUser);
    window.addEventListener("storage", syncUser);
    return () => {
      window.removeEventListener("gencv-session", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  return (
    <header className="bg-surface border-b border-parchment-border w-full flex-none relative z-40">
      <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-max-width mx-auto">
        {/* Brand Logo */}
        <div className="text-headline-md font-headline-md font-bold text-ink">
          <Link href="/dashboard">EasyWork</Link>
        </div>

        {/* Desktop Navigation */}
        <nav
          className={`md:flex space-x-8 items-center h-full ${
            mobileNavOpen
              ? "flex flex-col absolute top-full left-0 w-full bg-surface border-b border-parchment-border p-4 space-y-4 space-x-0 z-50 shadow-md"
              : "hidden"
          }`}
        >
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/dashboard" && pathname === "/cvs") ||
              (item.href !== "/dashboard" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={`text-label-sm font-label-sm uppercase tracking-wider transition-colors duration-200 ${
                  isActive
                    ? "text-primary font-bold border-b-2 border-primary pb-1"
                    : "text-on-surface-variant hover:text-primary opacity-80 hover:opacity-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Controls */}
        <div className="flex items-center space-x-4">
          <button
            className="md:hidden text-on-surface-variant p-1"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Menu"
          >
            <span className="material-symbols-outlined">{mobileNavOpen ? "close" : "menu"}</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="w-10 h-10 rounded-full border border-parchment-border overflow-hidden bg-surface-variant flex items-center justify-center hover:border-ink transition-colors cursor-pointer"
              title={userName}
            >
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">person</span>
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-surface border border-parchment-border shadow-lg py-2 z-50 animate-fadeIn text-xs">
                <div className="px-4 py-2 border-b border-parchment-border">
                  <p className="font-bold text-ink truncate">{userName}</p>
                  <p className="text-[11px] text-on-surface-variant truncate">{userEmail}</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-on-surface-variant hover:text-ink hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">person</span>
                    <span>Mon profil</span>
                  </Link>
                  <Link
                    href="/pricing"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-on-surface-variant hover:text-ink hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">credit_card</span>
                    <span>Abonnement</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-on-surface-variant hover:text-ink hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">settings</span>
                    <span>Réglages</span>
                  </Link>
                </div>
                <div className="pt-1 border-t border-parchment-border">
                  <Link
                    href="/login?logout=1"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-error hover:bg-error-container/20 font-medium transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    <span>Déconnexion</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
