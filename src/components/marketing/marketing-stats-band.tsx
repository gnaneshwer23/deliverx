import { marketing } from "@/lib/marketing-theme";
import { Grain } from "@/components/marketing/grain";

const stats = [
  {
    value: "Charter",
    label: "Alignment score",
    sub: "Core differentiator",
  },
  {
    value: "Governance",
    label: "RAID · meetings · trace",
    sub: "Full delivery stack",
  },
  {
    value: "AI-native",
    label: "Structure · summarize · score",
    sub: "Approve before save",
  },
];

export function MarketingStatsBand() {
  return (
    <section className="relative overflow-hidden bg-[#0a0e14] px-6 py-20 md:px-10 md:py-28">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 100% 80% at 50% 100%, rgba(30,58,95,0.8), transparent), linear-gradient(180deg, transparent, #0a0e14)",
        }}
        aria-hidden
      />
      <Grain />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p
            className="font-[family-name:var(--font-display)] text-5xl text-[#f8f6f2] md:text-7xl"
            style={{ color: marketing.gold }}
          >
            <span className="text-[#f8f6f2]">One</span> workspace
          </p>
          <p
            className="mt-2 text-[10px] uppercase tracking-[0.35em]"
            style={{ color: marketing.gold }}
          >
            End-to-end delivery intelligence
          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-3 md:gap-8">
          {stats.map((stat) => (
            <div key={stat.value} className="text-center md:text-left">
              <p className="font-[family-name:var(--font-display)] text-3xl text-[#f8f6f2] md:text-4xl">
                {stat.value}
              </p>
              <p
                className="mt-2 text-[10px] uppercase tracking-[0.3em]"
                style={{ color: marketing.gold }}
              >
                {stat.sub}
              </p>
              <p className="mt-3 text-sm text-[#9ca3af]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
