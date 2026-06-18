import { Sparkles } from "lucide-react";

export function PanelAiInsight({
  text,
  label = "AI insight",
  className = "mt-4",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const tooltip = `${label}: ${text}`;

  return (
    <p className={`flex items-start gap-2 text-sm text-[#6B6B64] ${className}`}>
      <span className="shrink-0" title={tooltip} aria-label={tooltip}>
        <Sparkles size={14} className="text-[#1C4A2E]" aria-hidden />
      </span>
      <span className="line-clamp-1" title={text}>{text}</span>
    </p>
  );
}
