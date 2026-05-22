import Link from "next/link";
import { Workflow } from "@/components/marketing/workflow";

const problems = [
  "Disconnected Tools",
  "Hidden Blockers",
  "Governance Gaps",
  "Delivery Drift",
  "Poor Visibility",
  "Lost Decisions",
];

const steps: Array<[string, string]> = [
  ["Upload Business Case", "Import or describe your project"],
  ["AI Structures Project", "Tasks, milestones, RAID"],
  ["Invite Team", "Assign roles"],
  ["Execute Delivery", "Tasks, standups"],
  ["Monitor Risks", "AI highlights issues"],
  ["Generate Intelligence", "Reports & learning"],
];

const capabilities: Array<{ title: string; description: string }> = [
  {
    title: "AI Project Structuring",
    description: "Turn a business brief into workstreams, tasks, and RAID items.",
  },
  {
    title: "Charter Alignment",
    description: "Score delivery against your charter with meeting-level deltas.",
  },
  {
    title: "Governance Intelligence",
    description: "RAID, decisions, meetings, and traceability in one project hub.",
  },
  {
    title: "Delivery Monitoring",
    description: "Health, confidence, and standup signals from live task data.",
  },
  {
    title: "Meeting Intelligence",
    description: "Upload recordings, transcribe, summarize, and approve AI outputs.",
  },
  {
    title: "Organisational Memory",
    description: "Capture lessons and playbooks as projects close.",
  },
];

const previews = ["AI Setup", "Task Workspace", "PM Dashboard", "Governance"];

export default function LandingPage() {
  return (
    <div className="bg-[#F8FAFC] text-[#0F172A]">
      <nav className="sticky top-0 z-20 flex items-center justify-between border-b bg-white px-8 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          DeliverX
        </Link>
        <div className="hidden gap-6 text-sm md:flex">
          <a href="#how-it-works" className="hover:text-[#0F766E]">
            How it works
          </a>
          <a href="#platform" className="hover:text-[#0F766E]">
            Platform
          </a>
          <a href="#use-cases" className="hover:text-[#0F766E]">
            Use Cases
          </a>
          <a href="#pricing" className="hover:text-[#0F766E]">
            Pricing
          </a>
        </div>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium text-[#0F172A] hover:bg-slate-100"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-9 items-center justify-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62]"
          >
            Start Free Trial
          </Link>
        </div>
      </nav>

      <section className="grid items-center gap-12 px-8 py-20 md:grid-cols-2">
        <div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Turn Business Cases Into Structured Delivery.
          </h1>
          <p className="mt-6 text-lg text-slate-600">
            DeliverX transforms business cases into executable delivery workflows
            with AI-assisted planning, governance, and monitoring.
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              href="/signup"
              className="inline-flex h-11 items-center justify-center rounded-md bg-[#0F766E] px-5 text-sm font-medium text-white hover:bg-[#0E6B62]"
            >
              Start Free Trial
            </Link>
            <Link
              href="/book-demo"
              className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-medium text-[#0F172A] hover:bg-slate-50"
            >
              Book Demo
            </Link>
          </div>
        </div>

        <Workflow />
      </section>

      <section className="px-8 py-16 text-center">
        <h2 className="mb-10 text-2xl font-semibold">
          Projects fail because execution becomes fragmented
        </h2>
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
          {problems.map((item) => (
            <div
              key={item}
              className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="bg-white px-8 py-16">
        <h2 className="mb-12 text-center text-2xl font-semibold">
          How DeliverX Works
        </h2>
        <div className="mx-auto grid max-w-6xl gap-6 text-sm md:grid-cols-6">
          {steps.map(([title, desc], i) => (
            <div key={title} className="text-center">
              <div className="mx-auto mb-3 flex size-8 items-center justify-center rounded-full bg-[#0F766E]/10 text-xs font-semibold text-[#0F766E]">
                {i + 1}
              </div>
              <div className="font-semibold">{title}</div>
              <div className="mt-2 text-slate-500">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="platform" className="px-8 py-16">
        <h2 className="mb-12 text-center text-2xl font-semibold">
          Built for Structured Delivery
        </h2>
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          {capabilities.map((item) => (
            <div
              key={item.title}
              className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <div className="font-semibold">{item.title}</div>
              <div className="mt-2 text-sm text-slate-500">{item.description}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="use-cases" className="bg-white px-8 py-16 text-center">
        <h2 className="mb-10 text-2xl font-semibold">Inside DeliverX</h2>
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          {previews.map((item) => (
            <div
              key={item}
              className="flex h-40 items-center justify-center rounded-xl bg-slate-100 text-slate-500"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="px-8 py-20 text-center">
        <h2 className="text-3xl font-bold">
          Build Projects With Operational Intelligence
        </h2>
        <p className="mt-4 text-slate-600">
          Turn business cases into structured delivery systems.
        </p>
        <div className="mt-8">
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center rounded-md bg-[#0F766E] px-8 text-lg font-medium text-white hover:bg-[#0E6B62]"
          >
            Start Free Trial
          </Link>
        </div>
      </section>

      <footer className="border-t bg-white px-8 py-10 text-sm text-slate-600">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 md:flex-row">
          <div>
            <div className="font-semibold text-[#0F172A]">DeliverX</div>
            <div className="mt-2">© {new Date().getFullYear()} DeliverX</div>
          </div>
          <div className="flex gap-10">
            <div>
              <div className="font-semibold text-[#0F172A]">Platform</div>
              <div>How it works</div>
              <div>Pricing</div>
            </div>
            <div>
              <div className="font-semibold text-[#0F172A]">Company</div>
              <div>About</div>
              <div>Contact</div>
            </div>
            <div>
              <div className="font-semibold text-[#0F172A]">Legal</div>
              <div>Privacy</div>
              <div>Terms</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
