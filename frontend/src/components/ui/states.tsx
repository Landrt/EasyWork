import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse bg-surface-high rounded-[4px]", className)}
      aria-hidden
    />
  );
}

export function LoadingState({ label = "Chargement…" }: { label?: string }) {
  return (
    <div className="flex flex-col gap-3 py-12" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function EmptyState({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="border border-parchment-border rounded-lg p-8 text-center">
      <h2 className="font-display text-2xl font-semibold text-ink">{title}</h2>
      {children ? (
        <div className="mt-3 text-on-variant text-base leading-6 max-w-[40ch] mx-auto">
          {children}
        </div>
      ) : null}
    </div>
  );
}
