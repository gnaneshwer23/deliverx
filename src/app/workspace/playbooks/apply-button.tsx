"use client";

import Link from "next/link";

export function ApplyButton({ playbookId }: { playbookId: string }) {
  return (
    <Link
      href={`/project/new?playbook=${encodeURIComponent(playbookId)}`}
      className="inline-flex h-9 w-full items-center justify-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white transition hover:bg-[#0E6B62]"
    >
      Use this playbook
    </Link>
  );
}
