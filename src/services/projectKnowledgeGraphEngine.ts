/**
 * Project knowledge graph engine — BC → benefit delivery chain + governance subgraph.
 * Postgres-backed (Neo4j sync deferred to later sprint).
 */

export type ProjectGraphNodeType =
  | "project"
  | "business_case"
  | "objective"
  | "requirement"
  | "story"
  | "task"
  | "test"
  | "milestone"
  | "benefit"
  | "meeting"
  | "decision"
  | "raid";

export type ProjectGraphEdgeType =
  | "owns"
  | "drives"
  | "implements"
  | "executes"
  | "validates"
  | "delivers"
  | "realises"
  | "releases_in"
  | "spawned_from"
  | "linked_to";

export type ProjectGraphNode = {
  id: string;
  type: ProjectGraphNodeType;
  label: string;
  meta?: Record<string, string | number | boolean | null>;
};

export type ProjectGraphEdge = {
  from: string;
  to: string;
  type: ProjectGraphEdgeType;
  meta?: Record<string, string | number | boolean | null>;
};

export type ProjectKnowledgeGraph = {
  projectId: string;
  projectName: string;
  nodes: ProjectGraphNode[];
  edges: ProjectGraphEdge[];
  stats: {
    nodeCount: number;
    edgeCount: number;
    chainCompletenessPct: number;
    governanceLinks: number;
  };
};

export type GraphImpactResult = {
  nodeId: string;
  downstream: ProjectGraphNode[];
  upstream: ProjectGraphNode[];
  affectedTypes: Record<ProjectGraphNodeType, number>;
  summary: string;
};

export type GraphTracePath = {
  nodeId: string;
  pathToBusinessCase: ProjectGraphNode[];
  pathToBenefit: ProjectGraphNode[];
};

const DELIVERY_TYPES: ProjectGraphNodeType[] = [
  "business_case",
  "objective",
  "requirement",
  "story",
  "task",
  "test",
  "milestone",
  "benefit",
];

function adjacency(graph: ProjectKnowledgeGraph) {
  const out = new Map<string, string[]>();
  const incoming = new Map<string, string[]>();
  for (const e of graph.edges) {
    out.set(e.from, [...(out.get(e.from) ?? []), e.to]);
    incoming.set(e.to, [...(incoming.get(e.to) ?? []), e.from]);
  }
  return { out, incoming };
}

function nodesById(graph: ProjectKnowledgeGraph): Map<string, ProjectGraphNode> {
  return new Map(graph.nodes.map((n) => [n.id, n]));
}

function bfsReachable(
  startId: string,
  adj: Map<string, string[]>,
  nodeMap: Map<string, ProjectGraphNode>,
): ProjectGraphNode[] {
  const seen = new Set<string>();
  const queue = [startId];
  const result: ProjectGraphNode[] = [];

  while (queue.length) {
    const id = queue.shift()!;
    if (seen.has(id)) continue;
    seen.add(id);
    const node = nodeMap.get(id);
    if (node && id !== startId) result.push(node);
    for (const next of adj.get(id) ?? []) {
      if (!seen.has(next)) queue.push(next);
    }
  }

  return result;
}

function findPathToType(
  startId: string,
  targetType: ProjectGraphNodeType,
  incoming: Map<string, string[]>,
  nodeMap: Map<string, ProjectGraphNode>,
): ProjectGraphNode[] {
  const path: ProjectGraphNode[] = [];
  let current = startId;
  const visited = new Set<string>();

  while (current && !visited.has(current)) {
    visited.add(current);
    const node = nodeMap.get(current);
    if (!node) break;
    path.unshift(node);
    if (node.type === targetType) return path;

    const parents = incoming.get(current) ?? [];
    current = parents[0] ?? "";
  }

  return path;
}

export function computeGraphImpact(
  graph: ProjectKnowledgeGraph,
  nodeId: string,
): GraphImpactResult | null {
  const nodeMap = nodesById(graph);
  const origin = nodeMap.get(nodeId);
  if (!origin) return null;

  const { out, incoming } = adjacency(graph);
  const downstream = bfsReachable(nodeId, out, nodeMap);
  const upstream = bfsReachable(nodeId, incoming, nodeMap);

  const affectedTypes = {} as Record<ProjectGraphNodeType, number>;
  for (const n of [...downstream, origin]) {
    affectedTypes[n.type] = (affectedTypes[n.type] ?? 0) + 1;
  }

  const downstreamLabels = downstream.slice(0, 4).map((n) => n.label);
  const summary =
    downstream.length === 0
      ? `No downstream entities depend on "${origin.label}".`
      : `Changing "${origin.label}" may affect ${downstream.length} linked item${downstream.length === 1 ? "" : "s"}${downstreamLabels.length ? `: ${downstreamLabels.join(", ")}${downstream.length > 4 ? "…" : ""}` : ""}.`;

  return {
    nodeId,
    downstream,
    upstream,
    affectedTypes,
    summary,
  };
}

export function traceGraphPaths(
  graph: ProjectKnowledgeGraph,
  nodeId: string,
): GraphTracePath | null {
  const nodeMap = nodesById(graph);
  if (!nodeMap.has(nodeId)) return null;

  const { incoming, out } = adjacency(graph);
  const pathToBusinessCase = findPathToType(nodeId, "business_case", incoming, nodeMap);

  const reqPath = findPathToType(nodeId, "requirement", incoming, nodeMap);
  const req = reqPath.find((n) => n.type === "requirement");
  const pathToBenefit: ProjectGraphNode[] = req ? [req] : [];
  if (req) {
    const benefitDownstream = bfsReachable(req.id, out, nodeMap).filter((n) => n.type === "benefit");
    if (benefitDownstream[0]) pathToBenefit.push(benefitDownstream[0]);
  }

  return { nodeId, pathToBusinessCase, pathToBenefit };
}

export function computeChainCompleteness(graph: ProjectKnowledgeGraph): number {
  const requirements = graph.nodes.filter((n) => n.type === "requirement");
  if (requirements.length === 0) return 0;

  const { out } = adjacency(graph);
  const nodeMap = nodesById(graph);
  let complete = 0;

  for (const req of requirements) {
    const downstream = bfsReachable(req.id, out, nodeMap);
    const types = new Set(downstream.map((n) => n.type));
    if (types.has("story") && types.has("task") && types.has("test") && types.has("benefit")) {
      complete++;
    }
  }

  return Math.round((complete / requirements.length) * 100);
}

export type GraphBuildInput = {
  projectId: string;
  projectName: string;
  businessCase?: { id: string; label: string; recommendation?: string };
  objectives: Array<{ id: string; label: string }>;
  requirements: Array<{ id: string; code: string; title: string; objectiveId?: string }>;
  stories: Array<{ id: string; code: string; title: string; requirementId?: string }>;
  tasks: Array<{ id: string; title: string; storyId?: string }>;
  tests: Array<{ id: string; code: string; title: string; storyId?: string }>;
  milestones: Array<{ id: string; title: string; status: string }>;
  benefits: Array<{ id: string; title: string; objectiveId?: string }>;
  meetings: Array<{ id: string; title: string }>;
  decisions: Array<{ id: string; title: string; meetingId?: string }>;
  raidItems: Array<{ id: string; title: string; type: string; meetingId?: string }>;
  traceLinks: Array<{
    requirementId: string;
    storyId?: string | null;
    taskId?: string | null;
    testCaseId?: string | null;
    benefitId?: string | null;
  }>;
};

export function buildProjectKnowledgeGraph(input: GraphBuildInput): ProjectKnowledgeGraph {
  const nodes: ProjectGraphNode[] = [];
  const edges: ProjectGraphEdge[] = [];

  const projectNodeId = `project:${input.projectId}`;
  nodes.push({
    id: projectNodeId,
    type: "project",
    label: input.projectName,
  });

  if (input.businessCase) {
    const bcId = `bc:${input.businessCase.id}`;
    nodes.push({
      id: bcId,
      type: "business_case",
      label: input.businessCase.label,
      meta: { recommendation: input.businessCase.recommendation ?? null },
    });
    edges.push({ from: bcId, to: projectNodeId, type: "drives" });
  }

  for (const obj of input.objectives) {
    const objId = `obj:${obj.id}`;
    nodes.push({ id: objId, type: "objective", label: obj.label });
    if (input.businessCase) {
      edges.push({
        from: `bc:${input.businessCase.id}`,
        to: objId,
        type: "drives",
      });
    } else {
      edges.push({ from: projectNodeId, to: objId, type: "owns" });
    }
  }

  const objectiveIds = input.objectives.map((o) => o.id);
  for (const req of input.requirements) {
    const reqId = `req:${req.id}`;
    nodes.push({
      id: reqId,
      type: "requirement",
      label: `${req.code} — ${req.title}`,
      meta: { code: req.code },
    });
    const objId = req.objectiveId
      ? `obj:${req.objectiveId}`
      : objectiveIds.length
        ? `obj:${objectiveIds[input.requirements.indexOf(req) % objectiveIds.length]}`
        : null;
    if (objId && nodes.some((n) => n.id === objId)) {
      edges.push({ from: objId, to: reqId, type: "implements" });
    } else {
      edges.push({ from: projectNodeId, to: reqId, type: "owns" });
    }
  }

  for (const story of input.stories) {
    const storyId = `story:${story.id}`;
    nodes.push({
      id: storyId,
      type: "story",
      label: `${story.code} — ${story.title}`,
      meta: { code: story.code },
    });
    if (story.requirementId) {
      edges.push({ from: `req:${story.requirementId}`, to: storyId, type: "implements" });
    }
  }

  for (const task of input.tasks) {
    const taskId = `task:${task.id}`;
    nodes.push({ id: taskId, type: "task", label: task.title });
    if (task.storyId) {
      edges.push({ from: `story:${task.storyId}`, to: taskId, type: "executes" });
    }
  }

  for (const test of input.tests) {
    const testId = `test:${test.id}`;
    nodes.push({
      id: testId,
      type: "test",
      label: `${test.code} — ${test.title}`,
      meta: { code: test.code },
    });
    if (test.storyId) {
      edges.push({ from: `story:${test.storyId}`, to: testId, type: "validates" });
    }
  }

  for (const ms of input.milestones) {
    const msId = `ms:${ms.id}`;
    nodes.push({
      id: msId,
      type: "milestone",
      label: ms.title,
      meta: { status: ms.status },
    });
    edges.push({ from: projectNodeId, to: msId, type: "releases_in" });
  }

  for (const benefit of input.benefits) {
    const benId = `ben:${benefit.id}`;
    nodes.push({ id: benId, type: "benefit", label: benefit.title });
    if (benefit.objectiveId) {
      edges.push({ from: `obj:${benefit.objectiveId}`, to: benId, type: "realises" });
    } else {
      edges.push({ from: projectNodeId, to: benId, type: "realises" });
    }
  }

  for (const link of input.traceLinks) {
    if (link.storyId && !edges.some((e) => e.from === `req:${link.requirementId}` && e.to === `story:${link.storyId}`)) {
      edges.push({
        from: `req:${link.requirementId}`,
        to: `story:${link.storyId}`,
        type: "implements",
      });
    }
    if (link.taskId) {
      const storyId = link.storyId ? `story:${link.storyId}` : null;
      if (storyId) {
        edges.push({ from: storyId, to: `task:${link.taskId}`, type: "executes" });
      }
    }
    if (link.testCaseId) {
      const storyId = link.storyId ? `story:${link.storyId}` : null;
      if (storyId) {
        edges.push({ from: storyId, to: `test:${link.testCaseId}`, type: "validates" });
      }
    }
    if (link.benefitId) {
      edges.push({
        from: `req:${link.requirementId}`,
        to: `ben:${link.benefitId}`,
        type: "delivers",
      });
    }
  }

  for (const meeting of input.meetings) {
    const meetId = `meet:${meeting.id}`;
    nodes.push({ id: meetId, type: "meeting", label: meeting.title });
    edges.push({ from: projectNodeId, to: meetId, type: "owns" });
  }

  for (const decision of input.decisions) {
    const decId = `dec:${decision.id}`;
    nodes.push({ id: decId, type: "decision", label: decision.title });
    if (decision.meetingId) {
      edges.push({ from: `meet:${decision.meetingId}`, to: decId, type: "spawned_from" });
    } else {
      edges.push({ from: projectNodeId, to: decId, type: "linked_to" });
    }
  }

  for (const raid of input.raidItems) {
    const raidId = `raid:${raid.id}`;
    nodes.push({
      id: raidId,
      type: "raid",
      label: `${raid.type}: ${raid.title}`,
      meta: { raidType: raid.type },
    });
    if (raid.meetingId) {
      edges.push({ from: `meet:${raid.meetingId}`, to: raidId, type: "spawned_from" });
    } else {
      edges.push({ from: projectNodeId, to: raidId, type: "linked_to" });
    }
  }

  const uniqueNodes = dedupeNodes(nodes);
  const uniqueEdges = dedupeEdges(edges);

  const graph: ProjectKnowledgeGraph = {
    projectId: input.projectId,
    projectName: input.projectName,
    nodes: uniqueNodes,
    edges: uniqueEdges,
    stats: {
      nodeCount: uniqueNodes.length,
      edgeCount: uniqueEdges.length,
      chainCompletenessPct: 0,
      governanceLinks: uniqueEdges.filter((e) => e.type === "spawned_from").length,
    },
  };

  graph.stats.chainCompletenessPct = computeChainCompleteness(graph);
  return graph;
}

function dedupeNodes(nodes: ProjectGraphNode[]): ProjectGraphNode[] {
  const seen = new Set<string>();
  return nodes.filter((n) => {
    if (seen.has(n.id)) return false;
    seen.add(n.id);
    return true;
  });
}

function dedupeEdges(edges: ProjectGraphEdge[]): ProjectGraphEdge[] {
  const seen = new Set<string>();
  return edges.filter((e) => {
    const key = `${e.from}|${e.to}|${e.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function deliveryNodeTypes(): ProjectGraphNodeType[] {
  return DELIVERY_TYPES;
}
