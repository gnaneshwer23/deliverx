import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { sovereignClass } from "@/lib/sovereign-theme";

export function SovereignLabel({ children }: { children: ReactNode }) {
  return <span className={sovereignClass.label}>{children}</span>;
}

export function SovereignInput(props: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, className = "", ...rest } = props;
  return (
    <label className="block">
      <SovereignLabel>{label}</SovereignLabel>
      <input {...rest} className={`${sovereignClass.input} ${className}`} />
    </label>
  );
}

export function SovereignSelect(
  props: SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: string[] },
) {
  const { label, options, className = "", ...rest } = props;
  return (
    <label className="block">
      <SovereignLabel>{label}</SovereignLabel>
      <select {...rest} className={`${sovereignClass.input} ${className}`}>
        <option value="" disabled>
          Select…
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SovereignButton({
  children,
  variant = "primary",
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
}) {
  const base =
    variant === "primary"
      ? `${sovereignClass.pillPrimary} h-11 w-full disabled:opacity-50`
      : `${sovereignClass.pillGhost} h-11 disabled:opacity-50`;
  return (
    <button type="button" {...rest} className={`${base} ${className}`}>
      {children}
    </button>
  );
}

export function SovereignError({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {children}
    </p>
  );
}
