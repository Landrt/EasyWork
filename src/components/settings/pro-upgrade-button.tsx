'use client';

import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface ProUpgradeButtonProps {
  className?: string;
}

export function ProUpgradeButton({ className }: ProUpgradeButtonProps) {
  return (
    <div className={cn("relative", className)}>
      <Link 
        href="/subscription" 
        className={cn(
          "inline-flex items-center gap-2 px-3.5 py-1.5",
          "bg-[#1C1B18] text-[#fbf9f5] hover:bg-[#30312e]",
          "border border-[#1C1B18] rounded text-sm font-medium",
          "transition-all duration-200"
        )}
      >
        <Sparkles className="h-3.5 w-3.5 text-[#9af6bc]" />
        <span>EasyWork Pro</span>
      </Link>
    </div>
  );
} 