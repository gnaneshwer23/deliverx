"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function PmOnboardErrorToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("onboard_error");

  useEffect(() => {
    if (!error) return;

    toast.error(error, {
      description: "We could not create your workspace project. Retry from this page or contact support.",
      duration: 8000,
    });

    const params = new URLSearchParams(searchParams.toString());
    params.delete("onboard_error");
    const qs = params.toString();
    router.replace(`${window.location.pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [error, router, searchParams]);

  return null;
}
