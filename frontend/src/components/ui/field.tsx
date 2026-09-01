import { cn } from "@/lib/cn";
import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

const labelClass =
  "block text-[12px] font-semibold leading-4 tracking-[0.05em] uppercase text-on-variant mb-1.5";

const controlClass =
  "w-full min-h-11 bg-transparent px-0 py-2.5 text-base text-ink border-0 border-b border-parchment-border rounded-none transition-colors placeholder:text-clay";

const focusClass =
  "focus:outline-none focus:border-ink focus:border focus:px-3 focus:rounded-[4px]";

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  id: string;
};

export function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className={labelClass}>
      {children}
    </label>
  );
}

export function Input({
  label,
  hint,
  error,
  id,
  className,
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="w-full">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(controlClass, focusClass, error && "border-error", className)}
        {...props}
      />
      {hint && !error ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[13px] leading-[18px] text-on-variant">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[13px] leading-[18px] text-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Textarea({
  label,
  hint,
  error,
  id,
  className,
  ...props
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="w-full">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        className={cn(
          controlClass,
          focusClass,
          "min-h-32 resize-y",
          error && "border-error",
          className,
        )}
        {...props}
      />
      {error ? (
        <p className="mt-1.5 text-[13px] text-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Select({
  label,
  error,
  id,
  children,
  className,
  ...props
}: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="w-full">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <select
        id={id}
        className={cn(controlClass, focusClass, "bg-parchment", className)}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <p className="mt-1.5 text-[13px] text-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
