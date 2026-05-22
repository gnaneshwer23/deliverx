const steps = [
  { n: "01", title: "Charter", desc: "Upload or write your project charter. AI extracts goals and baseline alignment." },
  { n: "02", title: "Structure", desc: "Generate workstreams, tasks, and RAID from a business brief — then approve." },
  { n: "03", title: "Execute", desc: "Run delivery with standups, meetings, and live health signals." },
  { n: "04", title: "Learn", desc: "Capture decisions, traceability, and organisational memory as you ship." },
];

export function MarketingProcess() {
  return (
    <section id="how-it-works" className="bg-[#f5f2ed] px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-6xl">
        <span className="text-[10px] uppercase tracking-[0.35em] text-[#5c3333]">How it works</span>
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl text-[#1a1a1a] md:text-5xl">
          From business case to structured delivery
        </h2>
        <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.n} className="border-t border-[#1a1a1a]/10 pt-6">
              <p className="font-[family-name:var(--font-display)] text-3xl text-[#c4a574]">{step.n}</p>
              <h3 className="mt-4 font-[family-name:var(--font-display)] text-2xl text-[#1a1a1a]">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#4b5563]">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
