import Link from "next/link";
import { mktClass } from "@/lib/marketing/landing-theme";

export function MarketingLogo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="mr-auto flex items-center gap-2.5 no-underline">
      <span
        className="flex size-[30px] shrink-0 items-center justify-center rounded-[7px] bg-[#1C4A2E]"
        aria-hidden
      >
        <svg
          viewBox="0 0 14 14"
          className="size-3.5 stroke-white fill-none stroke-2 [stroke-linecap:round]"
        >
          <path d="M1 7h12M7 1v12M2 2l10 10M12 2L2 12" />
        </svg>
      </span>
      <span className={`${mktClass.serif} text-lg tracking-[-0.01em] text-[#F0EDE8]`}>
        DeliverX
      </span>
    </Link>
  );
}
