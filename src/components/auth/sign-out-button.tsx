"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { signOutAction } from "@/app/auth/actions";

export function SignOutButton({
  className = "",
  showIcon = true,
}: {
  className?: string;
  showIcon?: boolean;
}) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => signOutAction())}
      className={className}
    >
      {showIcon ? <LogOut size={14} className="inline shrink-0" /> : null}
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
