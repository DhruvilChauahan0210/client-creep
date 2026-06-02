import type { AnalysisResult, ComponentNode, CreepCandidate, WhyTrace } from "./types.js";
import type { ImportGraph } from "./types.js";

export function computeWhyTraces(graph: ImportGraph): Map<string, WhyTrace> {
  const traces = new Map<string, WhyTrace>();

  // For each non-boundary client node, BFS backwards to find the nearest boundary
  for (const [filePath, node] of graph.nodes) {
    if (!node.isClientGraph) continue;
    if (node.isClientBoundary) {
      // The boundary explains itself
      traces.set(filePath, {
        filePath,
        chain: [filePath],
        boundaryRoot: filePath,
      });
      continue;
    }

    // BFS through reverse edges to find the shortest path to a boundary
    const chain = bfsToNearestBoundary(filePath, graph);
    if (chain) {
      traces.set(filePath, {
        filePath,
        chain,
        boundaryRoot: chain[0],
      });
    }
  }

  return traces;
}

function bfsToNearestBoundary(
  startFile: string,
  graph: ImportGraph
): string[] | null {
  // We want to find the nearest ancestor that is a client boundary
  // BFS through reverse edges (files that import startFile)
  const visited = new Set<string>();
  const queue: Array<{ file: string; path: string[] }> = [
    { file: startFile, path: [startFile] },
  ];

  while (queue.length > 0) {
    const { file, path: currentPath } = queue.shift()!;
    if (visited.has(file)) continue;
    visited.add(file);

    const node = graph.nodes.get(file);
    if (node?.isClientBoundary) {
      // Return the path with boundary at front, target at end
      return [...currentPath].reverse();
    }

    const parents = graph.reverseEdges.get(file);
    if (parents) {
      for (const parent of parents) {
        if (!visited.has(parent)) {
          queue.push({ file: parent, path: [...currentPath, parent] });
        }
      }
    }
  }

  return null;
}

export function detectCreepCandidates(
  graph: ImportGraph,
  traces: Map<string, WhyTrace>
): CreepCandidate[] {
  const candidates: CreepCandidate[] = [];

  for (const [filePath, node] of graph.nodes) {
    // Must be in client graph but NOT a boundary itself
    if (!node.isClientGraph || node.isClientBoundary) continue;

    // If it has no client signals, it's a candidate for hoisting
    if (node.clientSignals.length === 0) {
      const trace = traces.get(filePath);
      if (!trace) continue;

      // Estimate recoverable bytes: this file + its transitive client imports
      // that are also creep candidates (conservative: just this file for now)
      candidates.push({
        filePath,
        displayPath: node.displayPath,
        reason: "No client-only signals detected (no hooks, event handlers, or browser APIs)",
        recoverableBytes: node.sizeBytes,
        whyTrace: trace,
      });
    }
  }

  // Sort by recoverable bytes descending (biggest wins first)
  return candidates.sort((a, b) => b.recoverableBytes - a.recoverableBytes);
}

export function buildAnalysisResult(
  graph: ImportGraph,
  projectRoot: string
): AnalysisResult {
  const whyTraces = computeWhyTraces(graph);
  const creepCandidates = detectCreepCandidates(graph, whyTraces);

  const clientBoundaries: ComponentNode[] = [];
  const clientGraph: ComponentNode[] = [];
  const serverGraph: ComponentNode[] = [];

  let totalClientBytes = 0;

  for (const node of graph.nodes.values()) {
    if (node.isClientBoundary) clientBoundaries.push(node);
    if (node.isClientGraph) {
      clientGraph.push(node);
      totalClientBytes += node.sizeBytes;
    } else {
      serverGraph.push(node);
    }
  }

  const recoverableBytes = creepCandidates.reduce(
    (sum, c) => sum + c.recoverableBytes,
    0
  );

  return {
    projectRoot,
    totalFiles: graph.nodes.size,
    clientBoundaries,
    clientGraph,
    serverGraph,
    creepCandidates,
    totalClientBytes,
    recoverableBytes,
    whyTraces,
  };
}
