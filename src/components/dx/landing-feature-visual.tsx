/** Mini UI illustrations inside feature bento cards — no external assets */

export function ReportingFeatureVisual() {
  return (
    <div
      className="rounded border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
      aria-hidden
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-wider text-white/70">
          Weekly status · Draft
        </span>
        <span className="bg-[#3D9660] px-2 py-0.5 font-[family-name:var(--font-dx-mono)] text-[7px] uppercase text-white">
          AI draft
        </span>
      </div>
      <div className="space-y-2">
        {["Executive summary", "RAID update", "Next period plan"].map((line, i) => (
          <div key={line} className="flex items-center gap-2">
            <span
              className={`h-1.5 shrink-0 rounded-full bg-white/25 ${i === 0 ? "w-full" : i === 1 ? "w-[85%]" : "w-[65%]"}`}
            />
            <span className="text-[10px] text-white/55">{line}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <span className="flex-1 border border-white/20 py-1.5 text-center font-[family-name:var(--font-dx-mono)] text-[7px] uppercase text-white/60">
          Review
        </span>
        <span className="flex-1 bg-white py-1.5 text-center font-[family-name:var(--font-dx-mono)] text-[7px] uppercase text-[#1C4A2E]">
          Publish
        </span>
      </div>
    </div>
  );
}

export function SignalsFeatureVisual() {
  const items = [
    { label: "Vendor scope creep", tone: "amber" as const },
    { label: "QA capacity gap", tone: "red" as const },
    { label: "Milestone on track", tone: "green" as const },
  ];
  return (
    <div className="border border-[#E4E4DC] bg-[#FAFAF5] p-4" aria-hidden>
      <p className="mb-3 font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-wider text-[#6B6B64]">
        Alert queue
      </p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.label}
            className={`flex items-center justify-between gap-2 border-l-[3px] px-2 py-2 text-[11px] ${
              item.tone === "red"
                ? "border-[#C0392B] bg-[#FDF1F0]"
                : item.tone === "amber"
                  ? "border-[#B7620A] bg-[#FEF6EC]"
                  : "border-[#1A6B3A] bg-[#EDF7F1]"
            }`}
          >
            <span className="text-[#2C2C28]">{item.label}</span>
            <span className="font-[family-name:var(--font-dx-mono)] text-[7px] uppercase text-[#6B6B64]">
              Review
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MeetingsFeatureVisual() {
  return (
    <div className="border border-[#E4E4DC] bg-white p-4" aria-hidden>
      <p className="mb-3 font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-wider text-[#6B6B64]">
        Steering · 45 min
      </p>
      <div className="space-y-3">
        <div>
          <p className="text-[10px] font-medium text-[#1C4A2E]">Decision</p>
          <p className="text-[11px] text-[#2C2C28]">Approve phased rollout for CRM</p>
        </div>
        <div>
          <p className="text-[10px] font-medium text-[#1C4A2E]">Actions</p>
          <p className="text-[11px] text-[#6B6B64]">2 owners assigned · 1 change request</p>
        </div>
      </div>
    </div>
  );
}

export function MemoryFeatureVisual() {
  return (
    <div className="border border-[#C6DDD0] bg-white p-4" aria-hidden>
      <p className="mb-3 font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-wider text-[#6B6B64]">
        Org memory search
      </p>
      <div className="mb-3 flex items-center gap-2 border border-[#E4E4DC] bg-[#FAFAF5] px-3 py-2">
        <span className="text-[#A8A89E]">⌕</span>
        <span className="text-[11px] text-[#6B6B64]">lessons learned vendor delay</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {["Playbook", "RAID pattern", "Closure 2024", "Benefits"].map((tag) => (
          <span
            key={tag}
            className="border border-[#C6DDD0] bg-[#EEF5F1] px-2 py-0.5 text-[10px] text-[#1C4A2E]"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
