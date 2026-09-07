'use client';

import { useRef } from "react";
import Link from "next/link";
import { Download, Code } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface LogoProps {
  className?: string;
  asLink?: boolean;
}

export function Logo({ className, asLink = true }: LogoProps) {
  const logoRef = useRef<HTMLDivElement>(null);

  async function exportAsPNG() {
    try {
      const scale = window.devicePixelRatio || 1;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 800 * scale;
      canvas.height = 200 * scale;

      ctx.scale(scale, scale);

      ctx.font = '700 110px Fraunces, Georgia, serif';
      ctx.fillStyle = '#1C1B18';
      ctx.textBaseline = 'middle';
      
      const text = 'EasyWork';
      const textMetrics = ctx.measureText(text);
      const x = (800 - textMetrics.width - 24) / 2;
      ctx.fillText(text, x, 100);

      // Accent dot in #127749
      ctx.beginPath();
      ctx.arc(x + textMetrics.width + 12, 110, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#127749';
      ctx.fill();

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'easywork-logo.png';
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting logo:', error);
    }
  }

  function exportAsSVG() {
    try {
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="800" height="200" viewBox="0 0 800 200">
          <text x="375" y="115" fill="#1C1B18" 
            font-family="Fraunces, Georgia, serif" 
            font-size="110px"
            font-weight="700"
            text-anchor="middle"
            dominant-baseline="middle">
            EasyWork
          </text>
          <circle cx="585" cy="115" r="9" fill="#127749" />
        </svg>
      `;

      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'easywork-logo.svg';
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting SVG:', error);
    }
  }

  const logoContent = (
    <ContextMenu>
      <ContextMenuTrigger>
        <div ref={logoRef} className="transition-transform duration-300 hover:opacity-90 flex items-center gap-0.5">
          <span className={cn("font-serif text-2xl font-bold tracking-tight text-[#1C1B18]", className)}>
            EasyWork
          </span>
          <span className="inline-block w-2 h-2 rounded-full bg-[#127749] mb-2.5 ml-0.5" />
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-[#fbf9f5] border border-[#E5E1D8] shadow-md text-[#1C1B18]">
        <ContextMenuItem onClick={exportAsPNG} className="cursor-pointer hover:bg-[#efeeea]">
          <Download className="mr-2 h-4 w-4 text-[#1C1B18]" />
          Save as PNG
        </ContextMenuItem>
        <ContextMenuItem onClick={exportAsSVG} className="cursor-pointer hover:bg-[#efeeea]">
          <Code className="mr-2 h-4 w-4 text-[#1C1B18]" />
          Save as SVG
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );

  if (asLink) {
    return (
      <Link href="/" className="inline-flex items-center">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
} 