import { cn } from "@/lib/cn";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center min-h-7 px-2 text-[12px] font-semibold uppercase tracking-[0.05em] rounded-[4px] border",
        tone === "success"
          ? "border-success text-success"
          : "border-parchment-border text-on-variant",
      )}
    >
      {children}
    </span>
  );
}
