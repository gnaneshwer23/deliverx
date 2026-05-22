import { marketing } from "@/lib/marketing-theme";

const cards = [
  {
    tag: "Charter alignment",
    title: "Alignment",
    body: "Score delivery against your charter. See meeting-level deltas and trend on every project overview.",
    gradient: "from-[#1e3a5f] via-[#0f172a] to-[#050608]",
  },
  {
    tag: "Meeting intelligence",
    title: "Meetings",
    body: "Upload recordings, transcribe, summarize, and approve decisions and RAID items from AI output.",
    gradient: "from-[#134e4a] via-[#0f172a] to-[#050608]",
  },
  {
    tag: "Governance stack",
    title: "Governance",
    body: "RAID, decisions, documents, changes, and reports — linked through a live traceability graph.",
    gradient: "from-[#312e81] via-[#0f172a] to-[#050608]",
  },
  {
    tag: "Delivery signals",
    title: "Intelligence",
    body: "Health, confidence, drift, and recommendations fed by real task and standup data — not mocks.",
    gradient: "from-[#422006] via-[#0f172a] to-[#050608]",
  },
];

export function MarketingFeatureCards() {
  return (
    <section id="capabilities" className="bg-[#0a0e14] px-6 py-16 md:px-10 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
        {cards.map((card, i) => (
          <article
            key={card.title}
            className="group relative min-h-[380px] overflow-hidden rounded-2xl border border-white/5"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${card.gradient} transition duration-700 group-hover:scale-105`}
              aria-hidden
            />
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  i % 2 === 0
                    ? "radial-gradient(circle at 20% 80%, rgba(110,231,199,0.15), transparent 50%)"
                    : "radial-gradient(circle at 80% 20%, rgba(196,165,116,0.12), transparent 50%)",
              }}
              aria-hidden
            />
            <div className="relative flex h-full flex-col justify-end p-8 md:p-10">
              <p
                className="text-[10px] uppercase tracking-[0.3em]"
                style={{ color: marketing.teal }}
              >
                {card.tag}
              </p>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[#f8f6f2] md:text-5xl">
                {card.title}
              </h3>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-[#9ca3af]">{card.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
