import Link from "next/link";
import { Mail } from "lucide-react";

interface FooterProps {
  variant?: 'fixed' | 'static';
}

export function Footer({ variant = 'fixed' }: FooterProps) {
  return (
    <footer className={`h-auto md:h-14 w-full border-t border-[#E5E1D8] bg-[#fbf9f5]/95 backdrop-blur z-50 ${variant === 'fixed' ? 'fixed bottom-0 left-0 right-0' : 'static'}`}>
      <div className="container py-4 md:py-0 flex flex-col md:flex-row h-auto md:h-14 items-center justify-between gap-4 md:gap-0">
        <div className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4">
          <p className="text-sm font-medium text-[#1C1B18] text-center md:text-left">
            EasyWork © 2026
          </p>
          <span className="text-sm text-[#494740] text-center">
            Optimisation ATS & Candidatures intelligentes
          </span>
        </div>
        <nav className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <Link
            href="/partner"
            className="text-sm text-[#494740] hover:text-[#1C1B18] transition-colors underline-offset-4 hover:underline"
          >
            Programme Partenaire
          </Link>
          <Link
            href="/legal/terms-partners"
            className="text-sm text-[#494740] hover:text-[#1C1B18] transition-colors underline-offset-4 hover:underline"
          >
            Conditions Partenaires
          </Link>
          <Link
            href="mailto:contact@easywork.com"
            className="flex items-center gap-1.5 text-sm text-[#494740] hover:text-[#1C1B18] transition-colors underline-offset-4 hover:underline"
          >
            <Mail className="h-4 w-4" />
            <span>Contact Support</span>
          </Link>
        </nav>
      </div>
    </footer>
  );
} 