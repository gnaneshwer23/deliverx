import Link from "next/link";

/**
 * Honest framing for bookmarkable Mission Control / Twin / PMO / Marketplace
 * surfaces that remain reachable but sit outside the primary pilot journey.
 */
export function DemotedWorkspaceBanner({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <aside
      role="note"
      aria-label={`${title} — deferred surface`}
      className="mb-6 rounded-lg border border-[#E4E4DC] bg-[#F7F7F2] px-4 py-3 text-sm text-[#3F3F3A]"
    >
      <p className="font-medium text-[#0D0D0B]">{title}</p>
      <p className="mt-1">{body}</p>
      <Link
        href="/profile"
        className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-[#1C4A2E] underline-offset-2 hover:underline"
      >
        Back to Professional Home
      </Link>
    </aside>
  );
}
