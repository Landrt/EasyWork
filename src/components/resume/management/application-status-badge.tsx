'use client';

import React, { useState } from 'react';
import { ApplicationStatus } from '@/lib/types';
import { updateApplicationStatus } from '@/utils/actions/resumes/actions';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ApplicationStatusBadgeProps {
  resumeId: string;
  currentStatus?: ApplicationStatus;
  editable?: boolean;
  onStatusChange?: (status: ApplicationStatus) => void;
  className?: string;
}

export const STATUS_CONFIG: Record<ApplicationStatus, { label: string; bg: string; text: string; border: string; icon: string }> = {
  preparing: {
    label: 'En préparation',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    icon: '📝',
  },
  applied: {
    label: 'Postulé',
    bg: 'bg-sky-100',
    text: 'text-sky-800',
    border: 'border-sky-300',
    icon: '🚀',
  },
  interviewing: {
    label: 'En entretien',
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-300',
    icon: '🤝',
  },
  offer: {
    label: 'Offre reçue',
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-300',
    icon: '🎉',
  },
  rejected: {
    label: 'Non retenu',
    bg: 'bg-rose-100',
    text: 'text-rose-800',
    border: 'border-rose-300',
    icon: '❌',
  },
};

export function ApplicationStatusBadge({
  resumeId,
  currentStatus = 'preparing',
  editable = true,
  onStatusChange,
  className,
}: ApplicationStatusBadgeProps) {
  const [status, setStatus] = useState<ApplicationStatus>(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const config = STATUS_CONFIG[status] || STATUS_CONFIG.preparing;

  const handleSelect = async (newStatus: ApplicationStatus) => {
    if (newStatus === status || isUpdating) return;
    setStatus(newStatus);
    if (onStatusChange) onStatusChange(newStatus);

    try {
      setIsUpdating(true);
      await updateApplicationStatus(resumeId, newStatus);
      toast({
        title: 'Statut mis à jour',
        description: `Candidature passée à "${STATUS_CONFIG[newStatus].label}".`,
      });
    } catch (error) {
      console.error('Failed to update status:', error);
      setStatus(status); // rollback
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!editable) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-xs transition-colors',
          config.bg,
          config.text,
          config.border,
          className
        )}
      >
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={isUpdating}
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-xs transition-all duration-200 cursor-pointer hover:shadow-sm hover:scale-102 focus:outline-hidden focus:ring-2 focus:ring-offset-1 focus:ring-purple-400',
            config.bg,
            config.text,
            config.border,
            className
          )}
        >
          {isUpdating ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <span>{config.icon}</span>
          )}
          <span>{config.label}</span>
          <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 bg-white/95 backdrop-blur-md shadow-lg border border-gray-100 p-1">
        {(Object.keys(STATUS_CONFIG) as ApplicationStatus[]).map((st) => {
          const itemConfig = STATUS_CONFIG[st];
          const isSelected = st === status;
          return (
            <DropdownMenuItem
              key={st}
              onClick={() => handleSelect(st)}
              className={cn(
                'flex items-center justify-between text-xs font-medium cursor-pointer rounded-md px-2 py-1.5',
                isSelected ? 'bg-purple-50 text-purple-900 font-semibold' : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <span className="flex items-center gap-2">
                <span>{itemConfig.icon}</span>
                <span>{itemConfig.label}</span>
              </span>
              {isSelected && <span className="text-purple-600">✓</span>}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
