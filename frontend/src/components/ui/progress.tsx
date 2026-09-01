import { cn } from "@/lib/cn";

export function Progress({
  value,
  optimized = false,
  label,
}: {
  value: number;
  optimized?: boolean;
  label?: string;
}) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="w-full">
      {label ? (
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.05em] text-on-variant">
          {label}
        </p>
      ) : null}
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-0.5 w-full bg-parchment-border"
      >
        <div
          className={cn("h-0.5", optimized ? "bg-success" : "bg-ink")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
