"use client";

import { useEffect, useState } from "react";

/** Static label on SSR + first paint; live clock only after mount. */
export function ClientClock({
  className,
  dotColor,
}: {
  className?: string;
  dotColor: string;
}) {
  const [clock, setClock] = useState("United Kingdom · BST");

  useEffect(() => {
    const format = () => {
      const formatted = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
        timeZone: "Europe/London",
      }).format(new Date());
      return `United Kingdom · ${formatted}`;
    };

    setClock(format());
    const id = setInterval(() => setClock(format()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={className}>
      <span className="size-1.5 rounded-full" style={{ backgroundColor: dotColor }} />
      <span suppressHydrationWarning>{clock}</span>
    </div>
  );
}
