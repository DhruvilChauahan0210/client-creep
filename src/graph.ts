import path from "node:path";
import fs from "node:fs";
import type { ComponentNode, ImportGraph } from "./types.js";
import { parseFile } from "./parser.js";
import { resolveImport, loadAliases, type TsPathAliases } from "./resolver.js";

export function buildImportGraph(
  files: string[],
  projectRoot: string
): ImportGraph {
  const nodes = new Map<string, ComponentNode>();
  const edges = new Map<string, Set<string>>();
  const reverseEdges = new Map<string, Set<string>>();
  const aliases = loadAliases(projectRoot);

  // First pass: parse all files
  for (const filePath of files) {
    const { hasUseClient, imports, clientSignals } = parseFile(filePath);
    const sizeBytes = safeStatSize(filePath);

    nodes.set(filePath, {
      filePath,
      displayPath: path.relative(projectRoot, filePath),
      isClientBoundary: hasUseClient,
      isClientGraph: hasUseClient, // will be updated in propagation
      clientSignals,
      imports: [], // resolved imports added below
      sizeBytes,
    });

    edges.set(filePath, new Set());
    reverseEdges.set(filePath, new Set());

    // Store raw import sources temporarily
    (nodes.get(filePath) as ComponentNode & { _rawImports: string[] })._rawImports =
      imports;
  }

  // Second pass: resolve imports and build edges
  for (const [filePath, node] of nodes) {
    const rawImports = (node as ComponentNode & { _rawImports: string[] })
      ._rawImports;
    const importerDir = path.dirname(filePath);
    const resolvedImports: string[] = [];

    for (const importSource of rawImports) {
      const resolved = resolveImport(importSource, importerDir, aliases);
      if (!resolved) continue;

      if (nodes.has(resolved)) {
        resolvedImports.push(resolved);
        edges.get(filePath)!.add(resolved);
        if (!reverseEdges.has(resolved)) reverseEdges.set(resolved, new Set());
        reverseEdges.get(resolved)!.add(filePath);

        // If the resolved file is a barrel (index.*), also wire edges to
        // everything it re-exports so propagation follows through barrels
        if (isBarrelFile(resolved)) {
          const barrelExports = getBarrelExports(resolved, aliases, nodes);
          for (const exported of barrelExports) {
            if (!edges.get(filePath)!.has(exported)) {
              edges.get(filePath)!.add(exported);
              if (!reverseEdges.has(exported)) reverseEdges.set(exported, new Set());
              reverseEdges.get(exported)!.add(filePath);
            }
          }
        }
      }
    }

    node.imports = resolvedImports;
    delete (node as ComponentNode & { _rawImports?: string[] })._rawImports;
  }

  return { nodes, edges, reverseEdges };
}

export function propagateClientGraph(graph: ImportGraph): void {
  // BFS from all client boundary roots
  const queue: string[] = [];

  for (const [filePath, node] of graph.nodes) {
    if (node.isClientBoundary) {
      queue.push(filePath);
    }
  }

  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const node = graph.nodes.get(current);
    if (node) {
      node.isClientGraph = true;
    }

    // Propagate to all files this node imports
    const imported = graph.edges.get(current);
    if (imported) {
      for (const dep of imported) {
        if (!visited.has(dep)) {
          queue.push(dep);
        }
      }
    }
  }
}

function safeStatSize(filePath: string): number {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return 0;
  }
}

function isBarrelFile(filePath: string): boolean {
  const base = path.basename(filePath, path.extname(filePath));
  return base === "index";
}

function getBarrelExports(
  barrelPath: string,
  aliases: TsPathAliases,
  nodes: Map<string, ComponentNode>
): string[] {
  const { imports } = parseFile(barrelPath);
  const barrelDir = path.dirname(barrelPath);
  const result: string[] = [];

  for (const importSource of imports) {
    const resolved = resolveImport(importSource, barrelDir, aliases);
    if (resolved && nodes.has(resolved)) {
      result.push(resolved);
    }
  }

  return result;
}
