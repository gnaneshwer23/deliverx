"use client";

import type { ReactNode } from "react";

/** Monday-style vertical automation flowchart for the workflow section. */
export function WorkflowDiagram() {
  return (
    <div className="mt-12">
      <p className="mb-8 font-[family-name:var(--font-mkt-mono)] text-[10px] font-medium uppercase tracking-[0.16em] text-white/40">
        How it works · example automation
      </p>

      <div className="relative mx-auto max-w-2xl">
        {/* Side labels — desktop */}
        <div className="pointer-events-none absolute -left-2 top-0 hidden h-full w-24 md:block lg:-left-8 lg:w-28">
          <SideLabel top="6%" text="Trigger" />
          <SideLabel top="28%" text="AI actions" />
          <SideLabel top="52%" text="Branch" />
          <SideLabel top="72%" text="Human approval" />
          <SideLabel top="90%" text="Outcome" />
        </div>

        <div className="relative flex flex-col items-center gap-0">
          <FlowStep
            type="trigger"
            title="When standup transcript uploaded"
            subtitle="Meeting intel · NHS EHR standup · Example"
            icon={<TriggerIcon />}
          />
          <Connector />
          <FlowStep
            type="ai"
            title="Extract tasks & decisions"
            subtitle="AI parses action items, owners, and severity"
            icon={<AiIcon />}
            gradient
          />
          <Connector branch />
          <div className="relative flex w-full max-w-md flex-col gap-0 sm:flex-row sm:justify-center sm:gap-8">
            <BranchArm label="High severity" direction="left">
              <FlowStep
                type="branch"
                compact
                title="Escalate to Sponsor"
                subtitle="Delivery impact event"
                icon={<AlertIcon />}
              />
            </BranchArm>
            <BranchArm label="Standard" direction="right">
              <FlowStep
                type="branch"
                compact
                title="Route to PM queue"
                subtitle="Awaiting approval"
                icon={<QueueIcon />}
              />
            </BranchArm>
          </div>
          <Connector merge />
          <FlowStep
            type="human"
            title="PM approves in Review Queue"
            subtitle="Nothing applies until a human approves it"
            icon={<HumanIcon />}
          />
          <Connector />
          <FlowStep
            type="outcome"
            title="Tasks propagate to 7 role dashboards"
            subtitle="Delivery Brain syncs approved signals across personas"
            icon={<OutcomeIcon />}
          />
        </div>
      </div>
    </div>
  );
}

function SideLabel({ top, text }: { top: string; text: string }) {
  return (
    <span
      className="absolute right-0 font-[family-name:var(--font-mkt-mono)] text-[9px] font-medium uppercase tracking-[0.12em] text-white/35"
      style={{ top }}
    >
      {text}
    </span>
  );
}

function Connector({ branch, merge }: { branch?: boolean; merge?: boolean }) {
  return (
    <div className="relative flex h-10 w-px flex-col items-center" aria-hidden>
      <div className="h-full w-px border-l border-dashed border-[rgba(110,231,183,0.35)]" />
      {branch ? (
        <>
          <div className="absolute top-1/2 h-px w-[min(280px,70vw)] -translate-y-1/2 border-t border-dashed border-[rgba(110,231,183,0.25)]" />
          <div className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6EE7B7]/60" />
        </>
      ) : null}
      {merge ? (
        <div className="absolute top-0 h-1/2 w-[min(280px,70vw)] border-t border-dashed border-[rgba(110,231,183,0.25)]" style={{ clipPath: "polygon(0 0, 50% 100%, 100% 0)" }} />
      ) : null}
    </div>
  );
}

function BranchArm({
  label,
  direction,
  children,
}: {
  label: string;
  direction: "left" | "right";
  children: ReactNode;
}) {
  return (
    <div className={`flex flex-1 flex-col items-center ${direction === "left" ? "sm:items-end" : "sm:items-start"}`}>
      <span className="mb-2 font-[family-name:var(--font-mkt-mono)] text-[8px] uppercase tracking-[0.1em] text-white/35">
        {label}
      </span>
      {children}
    </div>
  );
}

function FlowStep({
  type,
  title,
  subtitle,
  icon,
  gradient,
  compact,
}: {
  type: "trigger" | "ai" | "branch" | "human" | "outcome";
  title: string;
  subtitle: string;
  icon: ReactNode;
  gradient?: boolean;
  compact?: boolean;
}) {
  const borderClass = gradient
    ? "mkt-workflow-ai-box border-transparent"
    : type === "outcome"
      ? "border-[rgba(61,150,96,0.4)] bg-[rgba(61,150,96,0.1)]"
      : type === "human"
        ? "border-[rgba(96,165,250,0.35)] bg-[rgba(96,165,250,0.08)]"
        : "border-white/12 bg-white/[0.05]";

  return (
    <div
      className={`relative flex w-full items-center gap-3 rounded-xl border backdrop-blur-sm transition hover:border-white/20 ${
        compact ? "max-w-[200px] p-3" : "max-w-md p-4"
      } ${borderClass}`}
    >
      <div
        className={`marketing-workflow-hex flex shrink-0 items-center justify-center ${
          compact ? "size-10" : "size-12"
        }`}
        data-type={type}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className={`font-semibold leading-tight text-white ${compact ? "text-[0.75rem]" : "text-[0.875rem]"}`}>
          {title}
        </p>
        <p className={`mt-0.5 leading-snug text-white/50 ${compact ? "text-[0.625rem]" : "text-[0.75rem]"}`}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function TriggerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 text-[#6EE7B7]" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AiIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 text-[#A78BFA]" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 2a4 4 0 014 4v1a4 4 0 01-8 0V6a4 4 0 014-4z" />
      <path d="M8 14h8M10 18h4" strokeLinecap="round" />
      <circle cx="12" cy="10" r="1.5" fill="currentColor" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 text-[#FBBF24]" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  );
}

function QueueIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 text-[#60A5FA]" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M8 10h8M8 14h5" strokeLinecap="round" />
    </svg>
  );
}

function HumanIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 text-[#60A5FA]" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M6 20v-1a6 6 0 0112 0v1" strokeLinecap="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function OutcomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 text-[#6EE7B7]" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="6" cy="12" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="18" cy="18" r="2" />
      <path d="M8 12h4M14 7.5l2-1M14 16.5l2 1" strokeLinecap="round" />
    </svg>
  );
}
