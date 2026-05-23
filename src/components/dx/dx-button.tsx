import Link from "next/link";
import type { ComponentProps } from "react";
import { dxClass } from "@/lib/dx-theme";

type Variant = "primary" | "ghost" | "primarySm" | "ghostSm";

const styles: Record<Variant, string> = {
  primary: dxClass.btnPrimary,
  ghost: dxClass.btnGhost,
  primarySm: `${dxClass.btnSm}`,
  ghostSm: `${dxClass.btnGhost} px-3.5 py-1.5 text-[9px]`,
};

export function DxButton({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return (
    <button
      type="button"
      {...props}
      className={`${styles[variant]} disabled:opacity-50 ${className}`}
    />
  );
}

export function DxButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return (
    <Link href={href} {...props} className={`${styles[variant]} ${className}`}>
      {children}
    </Link>
  );
}
