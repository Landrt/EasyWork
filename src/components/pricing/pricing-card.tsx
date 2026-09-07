'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Plan {
  id?: 'free' | 'sprint' | 'monthly' | 'lifetime' | string;
  title: string;
  subtitle?: string;
  priceId: string;
  price: string;
  period?: string;
  badge?: string;
  features: string[];
  highlight?: boolean;
}

interface PricingCardProps {
  plan: Plan;
  isCurrentPlan: boolean;
  isLoading: boolean;
  onAction: (plan: Plan) => Promise<void>;
  buttonText?: string;
  variant?: 'default' | 'pro' | 'canceling';
  className?: string;
}

export function PricingCard({ 
  plan, 
  isCurrentPlan, 
  isLoading,
  onAction,
  buttonText,
  className
}: PricingCardProps) {
  const isFree = !plan.priceId || plan.priceId === 'free' || plan.title === 'Découverte';
  const isHighlighted = plan.highlight;

  return (
    <Card className={cn(
      "relative p-6 sm:p-7 rounded border border-[#E5E1D8] bg-white flex flex-col transition-all duration-200 hover:border-[#B8B1A5] hover:shadow-sm",
      isHighlighted && "border-[#1C1B18] bg-[#fbf9f5] shadow-md ring-1 ring-[#1C1B18]",
      className
    )}>
      {plan.badge && (
        <div className="absolute -top-3 left-6">
          <span className={cn(
            "px-2.5 py-0.5 rounded text-[11px] font-semibold tracking-wider uppercase",
            isHighlighted 
              ? "bg-[#1C1B18] text-[#fbf9f5]" 
              : "bg-[#f0ede6] text-[#494740] border border-[#E5E1D8]"
          )}>
            {plan.badge}
          </span>
        </div>
      )}

      <div className="mb-6 pt-1">
        <h3 className="font-serif text-xl font-bold text-[#1C1B18] mb-1">{plan.title}</h3>
        {plan.subtitle && (
          <p className="text-xs text-[#716e65] mb-3 leading-relaxed">{plan.subtitle}</p>
        )}
        <div className="flex items-baseline gap-1.5 pt-1">
          <span className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1B18]">{plan.price}</span>
          {plan.period && (
            <span className="text-[#494740] text-xs font-sans">{plan.period}</span>
          )}
        </div>
      </div>

      <div className="border-t border-[#E5E1D8] pt-4 mb-6 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#716e65] mb-3">Fonctionnalités :</p>
        <ul className="space-y-2.5">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-xs text-[#1C1B18] leading-snug">
              <Check className="h-3.5 w-3.5 text-[#127749] flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto pt-2">
        {isFree ? (
          <Button
            variant="outline"
            className="w-full h-10 rounded font-medium text-xs border-[#E5E1D8] text-[#494740] bg-[#f9f8f6] cursor-default"
            disabled
          >
            {buttonText || (isCurrentPlan ? 'Formule Actuelle' : 'Inclus Gratuitement')}
          </Button>
        ) : (
          <Button
            className={cn(
              "w-full h-10 rounded font-medium text-xs transition-all duration-200",
              isHighlighted
                ? "bg-[#1C1B18] text-[#fbf9f5] hover:bg-[#30312e] border border-[#1C1B18]"
                : "bg-white text-[#1C1B18] hover:bg-[#f5f3ef] border border-[#1C1B18]"
            )}
            onClick={() => onAction(plan)}
            disabled={isLoading || isCurrentPlan}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : null}
            {buttonText || (
              isCurrentPlan
                ? 'Formule Active'
                : `Choisir cette formule (${plan.price})`
            )}
          </Button>
        )}
      </div>
    </Card>
  );
}