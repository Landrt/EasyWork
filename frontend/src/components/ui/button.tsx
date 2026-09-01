import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

const variants = {
  primary:
    "bg-ink text-on-primary hover:bg-ink/90 border border-ink",
  secondary:
    "bg-transparent text-ink border border-clay hover:border-ink",
  success:
    "bg-success text-on-primary border border-success hover:bg-success/90",
  ghost: "bg-transparent text-ink border border-transparent hover:border-clay",
} as const;

export type ButtonVariant = keyof typeof variants;

export function buttonClassName(
  variant: ButtonVariant = "primary",
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center gap-2 min-h-11 px-4 text-sm font-medium tracking-wide rounded-[4px] transition-[border-color,box-shadow,background-color] duration-150 disabled:opacity-50 disabled:pointer-events-none",
    "active:shadow-[inset_0_2px_0_rgba(28,27,24,0.12)]",
    variants[variant],
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName(variant, className)}
      {...props}
    />
  );
}
