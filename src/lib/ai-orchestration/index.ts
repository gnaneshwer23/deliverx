export {
  AI_AGENT_ROLES,
  AI_BOUND_SURFACES,
  AI_INTERACTION_STATUSES,
  AI_ORCHESTRATION_EVENT,
  isAiAgentRole,
  isAiBoundSurface,
} from "@/lib/ai-orchestration/types";
export type {
  AiAgentAuthority,
  AiAgentDefinition,
  AiAgentRole,
  AiBoundSurface,
  AiContextSource,
  AiInteractionRecord,
  AiInteractionStatus,
  AiPromptVersionDefinition,
  AiStructuredContext,
  AiUsageMetrics,
} from "@/lib/ai-orchestration/types";

export {
  AI_AGENT_CATALOGUE,
  getAgent,
  listAgents,
  listAgentsByRole,
  requireAgent,
} from "@/lib/ai-orchestration/agents";

export {
  AI_PROMPT_CATALOGUE,
  computePromptHash,
  getPromptVersion,
  listPromptVersions,
  requirePromptVersion,
} from "@/lib/ai-orchestration/prompt-registry";

export { buildStructuredContext } from "@/lib/ai-orchestration/context-builder";
export type { BuildContextInput } from "@/lib/ai-orchestration/context-builder";

export {
  evaluateGuardrails,
  formatGuardedUserPayload,
  scanPromptInjection,
  assertAuthorityBoundaries,
} from "@/lib/ai-orchestration/guardrails";

export {
  OUTPUT_CONTRACTS,
  validateAgentOutput,
  contractFallback,
  refusesUnstructuredCapabilityWrite,
} from "@/lib/ai-orchestration/output-contracts";
export type { OutputValidationResult } from "@/lib/ai-orchestration/output-contracts";

export {
  estimateCostUsd,
  estimateTokens,
  hashPayload,
  listAiInteractions,
  logAiInteraction,
} from "@/lib/ai-orchestration/usage-log";

export { createMockModelInvoker, runAgent } from "@/lib/ai-orchestration/run";
export type { ModelInvoker, RunAgentInput, RunAgentResult } from "@/lib/ai-orchestration/run";
