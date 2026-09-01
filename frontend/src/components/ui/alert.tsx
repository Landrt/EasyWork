import { cn } from "@/lib/cn";

type AlertTone = "error" | "success" | "neutral";

export function Alert({
  tone = "neutral",
  title,
  children,
}: {
  tone?: AlertTone;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-lg border p-4 text-sm leading-6",
        tone === "error" && "border-error bg-error-container text-error",
        tone === "success" && "border-success/40 bg-success/8 text-ink",
        tone === "neutral" && "border-parchment-border bg-surface-low text-ink",
      )}
    >
      {title ? <p className="font-medium mb-1">{title}</p> : null}
      <div>{children}</div>
    </div>
  );
}
