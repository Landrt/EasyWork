'use client';

import { Sparkles, ChevronRight } from "lucide-react";

export function GitHubBadge() {
  return (
    <div 
      onClick={() => {
        const el = document.getElementById('features');
        el?.scrollIntoView({ behavior: 'smooth' });
      }}
      className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-violet-50/80 border border-violet-200 text-violet-700 w-fit cursor-pointer hover:bg-violet-100/80 transition-colors">
      <Sparkles className="w-4 h-4 text-violet-600" />
      <span className="text-sm font-medium">Propulsé par l&apos;IA EasyWork</span>
      <ChevronRight className="w-4 h-4" />
    </div>
  );
} 