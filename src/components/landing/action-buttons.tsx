'use client';

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { AuthDialog } from "@/components/auth/auth-dialog";

export function ActionButtons() {
  return (
    <div className="flex flex-col sm:flex-row gap-5">
      <AuthDialog />
      <Button 
        size="lg" 
        variant="outline" 
        className="border-violet-200 px-8 hover:bg-violet-50/50"
        onClick={() => {
          const el = document.getElementById('features');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}>
        <Sparkles className="mr-2.5 w-4 h-4 text-violet-600" />
        Découvrir les fonctionnalités
      </Button>
    </div>
  );
} 