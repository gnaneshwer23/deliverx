"use client";

import { useState } from "react";

const CLAMP_THRESHOLD = 120;

export function ClampableSummary({
  text,
  quote = true,
  className = "",
}: {
  text: string;
  quote?: boolean;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const display = quote ? `\u201C${text}\u201D` : text;
  const showToggle = text.length > CLAMP_THRESHOLD;

  return (
    <div>
      <p
        className={`text-sm leading-relaxed ${!expanded && showToggle ? "line-clamp-2" : ""} ${className}`}
      >
        {display}
      </p>
      {showToggle ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-xs font-medium text-[#1C4A2E] hover:underline"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      ) : null}
    </div>
  );
}
