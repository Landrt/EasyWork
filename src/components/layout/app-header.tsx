'use client';

import { LogoutButton } from "@/components/auth/logout-button";
import { SettingsButton } from "@/components/settings/settings-button";
// import { ModelSelector } from "@/components/settings/model-selector";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Menu, User, ShieldCheck, Handshake } from "lucide-react";
import { PageTitle } from "./page-title";
// import { TogglePlanButton } from '@/components/settings/toggle-plan-button';
import { ProUpgradeButton } from "@/components/settings/pro-upgrade-button";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { DevBypassToggle } from "@/components/dev/dev-bypass-toggle";

interface AppHeaderProps {
  children?: React.ReactNode;
  showUpgradeButton?: boolean;
}

export function AppHeader({ children, showUpgradeButton = true }: AppHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="h-14 border-b border-[#E5E1D8] bg-[#fbf9f5]/95 backdrop-blur-md fixed top-0 left-0 right-0 z-40">
      {/* Content Container */}
      <div className="max-w-[2000px] mx-auto h-full px-4 flex items-center justify-between relative">
        {/* Left Section - Logo and Title */}
        <div className="flex items-center gap-3 min-w-0 flex-shrink">
          <Logo className="text-xl flex-shrink-0" />
          <div className="h-5 w-px bg-[#E5E1D8] hidden sm:block flex-shrink-0" />
          <div className="flex items-center min-w-0 max-w-[140px] sm:max-w-[300px] lg:max-w-[600px]">
            <div className="truncate max-w-[80ch] overflow-hidden text-ellipsis font-serif text-[#1C1B18]">
              <PageTitle />
            </div>
          </div>
        </div>

        {/* Right Section - Navigation Items */}
        <div className="flex items-center flex-shrink-0">
          {children ? (
            children
          ) : (
            <>
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-2">
                {showUpgradeButton && (
                  <>
                    <ProUpgradeButton />
                    <div className="h-4 w-px bg-[#E5E1D8] ml-3" />
                  </>
                )}
                
                <div className="flex items-center px-2 py-1">
                  <DevBypassToggle className="mr-2" />
                  <Link 
                    href="/admin" 
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded",
                      "text-sm font-medium text-[#C9A96E] hover:text-[#9E824C] hover:bg-[#efeeea]",
                      "transition-colors duration-150"
                    )}
                    title="Dashboard Administration"
                  >
                    <ShieldCheck className="h-4 w-4 text-[#C9A96E]" />
                    <span className="hidden sm:inline font-semibold">Admin</span>
                  </Link>
                  <div className="mx-2 h-4 w-px bg-[#E5E1D8]" />
                  <Link 
                    href="/partner" 
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded",
                      "text-sm font-medium text-[#494740] hover:text-[#1C1B18] hover:bg-[#efeeea]",
                      "transition-colors duration-150"
                    )}
                    title="Programme Partenaires (Affiliation 30%)"
                  >
                    <Handshake className="h-4 w-4 text-[#C9A96E]" />
                    <span className="hidden sm:inline">Partenariat</span>
                  </Link>
                  <div className="mx-2 h-4 w-px bg-[#E5E1D8]" />
                  <Link 
                    href="/profile" 
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded",
                      "text-sm font-medium text-[#494740] hover:text-[#1C1B18] hover:bg-[#efeeea]",
                      "transition-colors duration-150"
                    )}
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Profile</span>
                  </Link>
                  <div className="mx-2 h-4 w-px bg-[#E5E1D8]" />
                  <SettingsButton />
                  <div className="mx-2 h-4 w-px bg-[#E5E1D8]" />
                  <LogoutButton />
                </div>
              </nav>

              {/* Mobile Menu */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-[#1C1B18] hover:bg-[#efeeea]">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-[#fbf9f5] border-[#E5E1D8]">
                  <SheetHeader>
                    <SheetTitle className="font-serif text-[#1C1B18]">Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-4 pt-6">
                    <div className="px-4 py-1">
                      <DevBypassToggle />
                    </div>
                    {showUpgradeButton && <ProUpgradeButton className="w-full" />}
                    <Link
                      href="/admin"
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded",
                        "text-sm font-semibold text-[#C9A96E]",
                        "hover:bg-[#efeeea] transition-colors duration-150"
                      )}
                    >
                      <ShieldCheck className="h-4 w-4 text-[#C9A96E]" />
                      Administration
                    </Link>
                    <Link
                      href="/partner"
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded",
                        "text-sm font-medium text-[#1C1B18]",
                        "hover:bg-[#efeeea] transition-colors duration-150"
                      )}
                    >
                      <Handshake className="h-4 w-4 text-[#C9A96E]" />
                      Programme Partenaires
                    </Link>
                    <Link
                      href="/profile" 
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded",
                        "text-sm font-medium text-[#1C1B18]",
                        "hover:bg-[#efeeea] transition-colors duration-150"
                      )}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <div className="px-4">
                      <SettingsButton className="w-full justify-start" />
                    </div>
                    <div className="px-4">
                      <LogoutButton className="w-full justify-start" />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          )}
        </div>
      </div>
    </header>
  );
}